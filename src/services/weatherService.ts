import axios, { AxiosError } from 'axios';

export interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
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

  constructor() {
    this.API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
    this.BASE_URL = 'https://api.openweathermap.org/data/2.5';
  }

  async getWeather(lat: number, lon: number): Promise<WeatherData> {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${this.API_KEY}&lang=fr`
      );

      const data = response.data;
      return {
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        clouds: data.clouds.all,
        sunrise: new Date(data.sys.sunrise * 1000),
        sunset: new Date(data.sys.sunset * 1000),
        city: data.name,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        throw new Error('Clé API invalide. Veuillez vérifier votre clé OpenWeatherMap.');
      } else if (axiosError.response?.status === 429) {
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
        humidity: item.main.humidity,
        windSpeed: item.wind.speed,
        clouds: item.clouds.all,
        sunrise: new Date(item.dt * 1000),
        sunset: new Date(item.dt * 1000), // Note: forecast doesn't include sunrise/sunset
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
