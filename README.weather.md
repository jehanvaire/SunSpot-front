# Weather Feature - SunSpot

This feature adds weather information to the map, displaying current weather conditions for your nearest city and several nearby cities.

## How it Works

1. When a user allows geolocation, the app captures their current position
2. The position coordinates are used to find the nearest city using OpenWeatherMap's geocoding API
3. The app then fetches the precise center coordinates of that city
4. The app also finds several nearby cities (up to 10) around the user's location
5. Weather data for all cities is fetched from OpenWeatherMap's API
6. Weather emoji markers are displayed on the map at the center of each city (not at the user's exact position)
7. The markers show emojis that represent the current weather conditions (sun, clouds, rain, etc.)
8. The nearest city is displayed with a larger, more prominent marker
9. Hovering over any marker displays the temperature, weather description, and city name

## Components Created

### 1. Utilities
- `weatherEmoji.ts`: Converts OpenWeatherMap weather condition codes to appropriate emojis

### 2. Services
- `geocodingService.ts`: Handles reverse geocoding to get city names from coordinates and finding multiple nearby cities

### 3. Components
- `WeatherMarker.tsx`: React component that creates and manages weather markers with different styles for primary (nearest) and secondary (nearby) cities
- `WeatherMarker.scss`: Styling for the weather markers including animations and differentiation between primary and secondary markers

## Environment Variables

The weather feature uses the following environment variables (defined in `.env.local`):

- `VITE_OPENWEATHER_API_KEY`: Your OpenWeatherMap API key (required)
- `VITE_MAX_NEARBY_CITIES`: Maximum number of nearby cities to display (default: 10)

A `.env.example` file is provided as a template:

```
VITE_OPENWEATHER_API_KEY=your_api_key_here
VITE_MAX_NEARBY_CITIES=10
```

## Weather Animations

The weather marker includes animations based on the weather type:
- Rain: Gentle bouncing animation
- Sun: Pulsing animation
- Snow: Floating animation

## Adding New Weather Types

To add more weather condition mappings, update the `getWeatherEmoji` function in `weatherEmoji.ts`.
