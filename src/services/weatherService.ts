import axios, { AxiosError } from 'axios';

export interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
  weatherId: number; // Weather condition ID from OpenWeatherMap
  humidity: number;
  windSpeed: number;
  clouds: number;
  sunrise: Date;
  sunset: Date;
  city: string;
}

export class WeatherService {
  private readonly API_KEY: string;
  private readonly BASE_URL: string;
  private cache: Map<string, {data: WeatherData, timestamp: number}>;
  private readonly CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes in milliseconds
  private pendingRequests: Map<string, Promise<WeatherData>>;

  constructor() {
    this.API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
    this.BASE_URL = 'https://api.openweathermap.org/data/2.5';
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  /**
   * Get weather data for a location
   * Uses caching to avoid redundant API calls and rate limiting
   */
  async getWeather(lat: number, lon: number): Promise<WeatherData> {
    // Round coordinates to 3 decimal places to improve cache hits for nearby points
    const roundedLat = Math.round(lat * 1000) / 1000;
    const roundedLon = Math.round(lon * 1000) / 1000;
    const cacheKey = `${roundedLat},${roundedLon}`;
    
    // Check if we have this data in cache and it's not expired
    const cachedData = this.cache.get(cacheKey);
    const now = Date.now();
    
    if (cachedData && (now - cachedData.timestamp) < this.CACHE_EXPIRY) {
      return cachedData.data;
    }
    
    // Check if there's already a pending request for this location
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }
    
    // Create a new request promise
    const requestPromise = this.fetchWeatherData(roundedLat, roundedLon, cacheKey);
    
    // Store the pending request
    this.pendingRequests.set(cacheKey, requestPromise);
    
    try {
      // Await the result
      const result = await requestPromise;
      return result;
    } finally {
      // Clean up the pending request when done
      this.pendingRequests.delete(cacheKey);
    }
  }
  
  /**
   * Fetch weather data from API and update cache
   */
  private async fetchWeatherData(lat: number, lon: number, cacheKey: string): Promise<WeatherData> {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${this.API_KEY}&lang=fr`,
        { timeout: 10000 } // 10 second timeout
      );

      const data = response.data;
      const weatherData = {
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        weatherId: data.weather[0].id, // Weather condition ID
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        clouds: data.clouds.all,
        sunrise: new Date(data.sys.sunrise * 1000),
        sunset: new Date(data.sys.sunset * 1000),
        city: data.name,
      };
      
      // Store in cache
      this.cache.set(cacheKey, {
        data: weatherData,
        timestamp: Date.now()
      });
      
      return weatherData;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(`Weather API error for ${cacheKey}:`, axiosError);
      
      if (axiosError.response?.status === 401) {
        throw new Error('Clé API invalide. Veuillez vérifier votre clé OpenWeatherMap.');
      } else if (axiosError.response?.status === 429) {
        // If we have cached data and hit rate limit, return the cached data even if expired
        const cachedData = this.cache.get(cacheKey);
        if (cachedData) {
          return cachedData.data;
        }
        throw new Error('Limite de requêtes atteinte. Veuillez réessayer plus tard.');
      } else if (axiosError.code === 'ECONNABORTED') {
        throw new Error('La requête a pris trop de temps. Veuillez vérifier votre connexion.');
      }
      throw new Error('Erreur lors de la récupération des données météo. Veuillez réessayer.');
    }
  }

  /**
   * Récupère les prévisions météo pour les prochaines heures
   */
  async getForecast(lat: number, lon: number): Promise<WeatherData[]> {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${this.API_KEY}&lang=fr`
      );

      return response.data.list.map((item: any) => ({
        temperature: Math.round(item.main.temp),
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        weatherId: item.weather[0].id, // Weather condition ID
        humidity: item.main.humidity,
        windSpeed: item.wind.speed,
        clouds: item.clouds.all,
        sunrise: new Date(item.dt * 1000),
        sunset: new Date(item.dt * 1000), // Note: forecast doesn't include sunrise/sunset
        city: response.data.city?.name || 'Unknown',
      }));
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        throw new Error('Clé API invalide. Veuillez vérifier votre clé OpenWeatherMap.');
      }
      throw new Error('Erreur lors de la récupération des prévisions météo.');
    }
  }
}

// Export une instance unique du service
export const weatherService = new WeatherService();
