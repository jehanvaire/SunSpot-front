import axios, { AxiosError } from 'axios';

export interface LocationData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

// Type definitions for caching
interface CachedData<T> {
  data: T;
  timestamp: number;
}

export class GeocodingService {
  private readonly API_KEY: string;
  private readonly REVERSE_GEOCODING_URL: string;
  private readonly NEARBY_CITIES_URL: string;
  
  // Cache storage for different types of requests
  private reverseGeoCache: Map<string, CachedData<LocationData>>;
  private nearbyCitiesCache: Map<string, CachedData<LocationData[]>>;
  private cityCoordinatesCache: Map<string, CachedData<LocationData>>;
  
  // Pending requests tracking to avoid duplicate API calls
  private pendingReverseGeo: Map<string, Promise<LocationData>>;
  private pendingNearbyCities: Map<string, Promise<LocationData[]>>;
  
  // Cache expiry times
  private readonly LOCATION_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours for locations
  private readonly COORDINATES_CACHE_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days for city coordinates (rarely change)

  constructor() {
    this.API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
    this.REVERSE_GEOCODING_URL = 'https://api.openweathermap.org/geo/1.0/reverse';
    this.NEARBY_CITIES_URL = 'https://api.openweathermap.org/geo/1.0/direct';
    
    // Initialize caches
    this.reverseGeoCache = new Map();
    this.nearbyCitiesCache = new Map();
    this.cityCoordinatesCache = new Map();
    
    // Initialize pending requests tracking
    this.pendingReverseGeo = new Map();
    this.pendingNearbyCities = new Map();
  }

  /**
   * Get location information (city, country) from coordinates
   * @param lat Latitude
   * @param lon Longitude
   * @returns Promise with location data
   */
  async getLocationFromCoordinates(lat: number, lon: number): Promise<LocationData> {
    // Round coordinates to 3 decimal places to improve cache hits
    const roundedLat = Math.round(lat * 1000) / 1000;
    const roundedLon = Math.round(lon * 1000) / 1000;
    const cacheKey = `${roundedLat},${roundedLon}`;
    
    // Check cache first
    const cachedData = this.reverseGeoCache.get(cacheKey);
    const now = Date.now();
    
    if (cachedData && (now - cachedData.timestamp) < this.LOCATION_CACHE_EXPIRY) {
      return cachedData.data;
    }
    
    // Check if there's already a pending request for these coordinates
    if (this.pendingReverseGeo.has(cacheKey)) {
      return this.pendingReverseGeo.get(cacheKey)!;
    }
    
    // Create a new request and store it in pendingRequests
    const requestPromise = this.fetchLocationFromCoordinates(roundedLat, roundedLon, cacheKey);
    this.pendingReverseGeo.set(cacheKey, requestPromise);
    
    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Clean up pending request when done
      this.pendingReverseGeo.delete(cacheKey);
    }
  }
  
  /**
   * Internal method to fetch location data from API and update cache
   */
  private async fetchLocationFromCoordinates(lat: number, lon: number, cacheKey: string): Promise<LocationData> {
    try {
      const response = await axios.get(
        `${this.REVERSE_GEOCODING_URL}?lat=${lat}&lon=${lon}&limit=1&appid=${this.API_KEY}`
      );

      if (!response.data || response.data.length === 0) {
        throw new Error('Aucune donnée de localisation trouvée pour ces coordonnées');
      }

      const location = response.data[0];
      const locationData = {
        city: location.name || 'Unknown',
        country: location.country || 'Unknown',
        latitude: lat,
        longitude: lon
      };
      
      // Save to cache
      this.reverseGeoCache.set(cacheKey, {
        data: locationData,
        timestamp: Date.now()
      });
      
      return locationData;
    } catch (error) {
      console.error(`Error fetching location data for ${cacheKey}:`, error);
      const axiosError = error as AxiosError;
      
      if (axiosError.response?.status === 401) {
        throw new Error('Clé API invalide. Veuillez vérifier votre clé OpenWeatherMap.');
      } else if (axiosError.response?.status === 429) {
        // Check if we have cached data for this location
        const cachedData = this.reverseGeoCache.get(cacheKey);
        if (cachedData) {
          return cachedData.data;
        }
        throw new Error('Limite de requêtes atteinte. Veuillez réessayer plus tard.');
      }
      throw new Error('Erreur lors de la récupération des données de localisation.');
    }
  }

  /**
   * Get the nearest city from the current coordinates
   * This will return the city center coordinates, not the user's position
   * @param lat Latitude of the user
   * @param lon Longitude of the user
   * @returns Promise with city location data with coordinates to the city center
   */
  async getNearestCity(lat: number, lon: number): Promise<LocationData> {
    // Round coordinates to 3 decimal places for better cache hits
    const roundedLat = Math.round(lat * 1000) / 1000;
    const roundedLon = Math.round(lon * 1000) / 1000;
    const cacheKey = `nearest:${roundedLat},${roundedLon}`;
    
    // Check cache first
    const cachedData = this.cityCoordinatesCache.get(cacheKey);
    const now = Date.now();
    
    if (cachedData && (now - cachedData.timestamp) < this.COORDINATES_CACHE_EXPIRY) {
      return cachedData.data;
    }
    
    try {
      // First, find the nearest city based on the user's coordinates
      const nearestCity = await this.getLocationFromCoordinates(lat, lon);
      
      // Use the city name to get accurate center coordinates
      const response = await axios.get(
        `${this.NEARBY_CITIES_URL}?q=${encodeURIComponent(nearestCity.city)}&limit=1&appid=${this.API_KEY}`
      );
      
      if (!response.data || response.data.length === 0) {
        // If we can't get city center, fall back to the approximate location
        return nearestCity;
      }
      
      const cityData = response.data[0];
      const result = {
        city: nearestCity.city,
        country: nearestCity.country,
        // Use the precise city center coordinates
        latitude: cityData.lat,
        longitude: cityData.lon
      };
      
      // Save to cache
      this.cityCoordinatesCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      console.error(`Error finding city center for ${cacheKey}:`, error);
      // Fall back to basic reverse geocoding if anything fails
      const fallbackResult = await this.getLocationFromCoordinates(lat, lon);
      
      // Still cache the fallback result
      this.cityCoordinatesCache.set(cacheKey, {
        data: fallbackResult,
        timestamp: Date.now()
      });
      
      return fallbackResult;
    }
  }
  
  /**
   * Get multiple nearby cities based on the user's location
   * @param lat Latitude of the user
   * @param lon Longitude of the user
   * @param limit Maximum number of cities to return (default: 10)
   * @returns Promise with an array of location data for nearby cities
   */
  async getNearbyCities(lat: number, lon: number, limit: number = 10): Promise<LocationData[]> {
    // Round coordinates to 3 decimal places for better cache hits
    const roundedLat = Math.round(lat * 1000) / 1000;
    const roundedLon = Math.round(lon * 1000) / 1000;
    const cacheKey = `nearby:${roundedLat},${roundedLon}:${limit}`;
    
    // Check cache first
    const cachedData = this.nearbyCitiesCache.get(cacheKey);
    const now = Date.now();
    
    if (cachedData && (now - cachedData.timestamp) < this.LOCATION_CACHE_EXPIRY) {
      return cachedData.data;
    }
    
    // Check if there's already a pending request for these coordinates
    if (this.pendingNearbyCities.has(cacheKey)) {
      return this.pendingNearbyCities.get(cacheKey)!;
    }
    
    // Create a new request and store it in pendingRequests
    const requestPromise = this.fetchNearbyCities(roundedLat, roundedLon, limit, cacheKey);
    this.pendingNearbyCities.set(cacheKey, requestPromise);
    
    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Clean up pending request when done
      this.pendingNearbyCities.delete(cacheKey);
    }
  }
  
  /**
   * Internal method to fetch nearby cities from API and update cache
   */
  private async fetchNearbyCities(lat: number, lon: number, limit: number, cacheKey: string): Promise<LocationData[]> {
    try {
      // First, find the nearest city to establish the region
      const nearestCity = await this.getLocationFromCoordinates(lat, lon);
      const cities: LocationData[] = [nearestCity];
      
      // Define major cities to search for in different directions around the user's location
      // We'll create a grid search at different distances in different directions
      // This approach is more reliable than the reverse geocoding limit parameter
      // which only returns different admin areas at the exact same location
      
      // Define a set of offsets to search in different directions (in degrees lat/lon)
      // This creates a smaller grid (roughly 5-15km) to find nearby suburbs
      // 0.05 degrees is approximately 5km, 0.1 degrees is approximately 10km
      const offsets = [
        { lat: 0.05, lon: 0 },    // North
        { lat: 0.05, lon: 0.05 },  // Northeast
        { lat: 0, lon: 0.05 },    // East
        { lat: -0.05, lon: 0.05 }, // Southeast
        { lat: -0.05, lon: 0 },   // South
        { lat: -0.05, lon: -0.05 },// Southwest
        { lat: 0, lon: -0.05 },   // West
        { lat: 0.05, lon: -0.05 }, // Northwest
        // Add some slightly further offsets to catch suburbs that are a bit farther
        { lat: 0.08, lon: 0.08 },  // Further Northeast
        { lat: -0.08, lon: -0.08 }, // Further Southwest
        { lat: 0.1, lon: 0 },     // Further North
        { lat: 0, lon: 0.1 },     // Further East
        { lat: -0.1, lon: 0 },    // Further South
        { lat: 0, lon: -0.1 }     // Further West
      ];
      
      // Search for cities in each direction
      const cityPromises = offsets.map(async (offset) => {
        try {
          const searchLat = lat + offset.lat;
          const searchLon = lon + offset.lon;
          
          // Use reverse geocoding to find a city at this location
          const response = await axios.get(
            `${this.REVERSE_GEOCODING_URL}?lat=${searchLat}&lon=${searchLon}&limit=1&appid=${this.API_KEY}`
          );
          
          if (response.data && response.data.length > 0) {
            const location = response.data[0];
            
            // Skip if we already found this city (check by name)
            if (cities.some(city => city.city === location.name)) {
              return null;
            }
            
            // Get accurate city center coordinates
            try {
              const cityResponse = await axios.get(
                `${this.NEARBY_CITIES_URL}?q=${encodeURIComponent(location.name)}&limit=1&appid=${this.API_KEY}`
              );
              
              if (cityResponse.data && cityResponse.data.length > 0) {
                const cityData = cityResponse.data[0];
                return {
                  city: location.name,
                  country: location.country,
                  latitude: cityData.lat,
                  longitude: cityData.lon
                };
              }
            } catch (e) {
              console.error(`Error getting precise coordinates for ${location.name}:`, e);
            }
            
            // If no precise coordinates or error, use the ones from reverse geocoding
            return {
              city: location.name,
              country: location.country,
              latitude: location.lat,
              longitude: location.lon
            };
          }
          return null;
        } catch (e) {
          console.error(`Error searching for cities in direction:`, e);
          return null;
        }
      });
      
      // Wait for all searches to complete
      const results = await Promise.all(cityPromises);
      
      // Filter out null results and add to cities array
      results.filter(Boolean).forEach(cityData => {
        if (cityData && !cities.some(city => city.city === cityData.city)) {
          cities.push(cityData);
        }
      });
      
      // If we have fewer than our target number of cities, try to find more with a wider search
      if (cities.length < limit) {
        try {
          // Use the direct geocoding API to find more cities in the country of the nearest city
          // This is just to add more variety if our grid search didn't find enough
          const countryCode = nearestCity.country;
          const response = await axios.get(
            `${this.NEARBY_CITIES_URL}?q=,,${countryCode}&limit=${limit - cities.length + 5}&appid=${this.API_KEY}`
          );
          
          if (response.data && response.data.length > 0) {
            for (const cityData of response.data) {
              // Skip if we already found this city or if it's too far away (>20km)
              // Reduced from 300km to 20km to focus on nearby suburbs
              const distance = this.calculateDistance(lat, lon, cityData.lat, cityData.lon);
              if (distance > 20 || cities.some(city => city.city === cityData.name)) {
                continue;
              }
              
              cities.push({
                city: cityData.name,
                country: cityData.country,
                latitude: cityData.lat,
                longitude: cityData.lon
              });
              
              if (cities.length >= limit) break;
            }
          }
        } catch (e) {
          console.error('Error finding additional cities:', e);
        }
      }
      
      // Sort cities by distance from user's location
      // This ensures the closest suburbs are prioritized
      const citiesWithDistance = cities.map(city => ({
        ...city,
        distance: this.calculateDistance(lat, lon, city.latitude, city.longitude)
      }));
      
      // Sort by distance
      citiesWithDistance.sort((a, b) => a.distance - b.distance);
      
      // Log the cities found and their distances for debugging
      
      // Get the final list without distance property
      const finalCities = citiesWithDistance
        .map(({ city, country, latitude, longitude }) => ({ city, country, latitude, longitude }))
        .slice(0, limit);
      
      // Save to cache
      this.nearbyCitiesCache.set(cacheKey, {
        data: finalCities,
        timestamp: Date.now()
      });
      
      return finalCities;
    } catch (error) {
      console.error(`Error finding nearby cities for ${cacheKey}:`, error);
      
      // Check if we're hitting rate limits
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 429) {
        // Check if we have cached data for this location
        const cachedData = this.nearbyCitiesCache.get(cacheKey);
        if (cachedData) {
          return cachedData.data;
        }
      }
      
      // If all else fails, return just the nearest city
      const nearestCity = await this.getLocationFromCoordinates(lat, lon);
      const fallbackResult = [nearestCity];
      
      // Still cache this fallback result
      this.nearbyCitiesCache.set(cacheKey, {
        data: fallbackResult,
        timestamp: Date.now()
      });
      
      return fallbackResult;
    }
  }
  
  /**
   * Calculate distance between two coordinates in kilometers
   * Using the Haversine formula
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

// Export a single instance of the service
export const geocodingService = new GeocodingService();
