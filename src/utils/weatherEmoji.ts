/**
 * This utility maps OpenWeatherMap weather condition codes to emojis
 * Based on the OpenWeatherMap API weather condition codes:
 * https://openweathermap.org/weather-conditions
 */

/**
 * Maps weather condition codes to corresponding emojis
 * @param weatherCode The OpenWeatherMap weather condition code
 * @returns An emoji representing the weather condition
 */
export const getWeatherEmoji = (weatherId: number): string => {
  // Thunderstorm: 200-299
  if (weatherId >= 200 && weatherId < 300) {
    return '⛈️'; // thunder cloud and rain
  }
  
  // Drizzle: 300-399
  if (weatherId >= 300 && weatherId < 400) {
    return '🌦️'; // sun behind rain cloud
  }
  
  // Rain: 500-599
  if (weatherId >= 500 && weatherId < 600) {
    return '🌧️'; // cloud with rain
  }
  
  // Snow: 600-699
  if (weatherId >= 600 && weatherId < 700) {
    return '❄️'; // snowflake
  }
  
  // Atmosphere conditions: 700-799 (mist, fog, etc.)
  if (weatherId >= 700 && weatherId < 800) {
    return '🌫️'; // fog
  }
  
  // Clear: 800
  if (weatherId === 800) {
    return '☀️'; // sun
  }
  
  // Clouds: 801-899
  if (weatherId > 800 && weatherId < 900) {
    // Few clouds (801) or scattered clouds (802)
    if (weatherId === 801 || weatherId === 802) {
      return '🌤️'; // sun behind small cloud
    } 
    // Broken clouds (803) or overcast clouds (804)
    else {
      return '☁️'; // cloud
    }
  }
  
  // Default emoji for unknown weather codes
  return '🌡️'; // thermometer
};

/**
 * Gets a text description with emoji for the weather
 * @param weatherId The weather condition code
 * @param description The weather description text
 * @returns A formatted string with emoji and description
 */
export const getWeatherText = (weatherId: number, description: string): string => {
  const emoji = getWeatherEmoji(weatherId);
  return `${emoji} ${description}`;
};
