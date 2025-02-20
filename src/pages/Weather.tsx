import React, { useEffect, useState } from 'react';
import { Cloud, Sun, CloudRain, Wind, Search } from 'lucide-react';

interface WeatherData {
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
  name: string;
}

interface ForecastData {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      humidity: number;
    };
    weather: Array<{
      main: string;
      description: string;
    }>;
  }>;
}

interface City {
  name: string;
  country: string;
  state?: string;
}

const Weather = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState(() => localStorage.getItem('lastCity') || 'Dhaka');
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    localStorage.setItem('lastCity', city);
  }, [city]);

  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      try {
        // Fetch current weather
        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=3e74f536934981fe8ced85b0d60abd95`
        );

        if (!weatherResponse.ok) {
          throw new Error('Weather data fetch failed');
        }

        // Fetch 5-day forecast
        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=3e74f536934981fe8ced85b0d60abd95`
        );

        if (!forecastResponse.ok) {
          throw new Error('Forecast data fetch failed');
        }

        const weatherResult = await weatherResponse.json();
        const forecastResult = await forecastResponse.json();

        setWeatherData(weatherResult);
        setForecastData(forecastResult);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch weather data');
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [city]);

  const handleSearchInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);

    if (value.length >= 3) {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${value}&limit=5&appid=3e74f536934981fe8ced85b0d60abd95`
        );
        
        if (!response.ok) throw new Error('Failed to fetch cities');
        
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Error fetching city suggestions:', err);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (cityName: string) => {
    setCity(cityName);
    setSearchInput(cityName);
    setShowSuggestions(false);
    setSuggestions([]);
    localStorage.setItem('lastCity', cityName);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setCity(searchInput.trim());
      setShowSuggestions(false);
      setSuggestions([]);
      localStorage.setItem('lastCity', searchInput.trim());
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return <Sun className="w-full h-full" />;
      case 'rain':
        return <CloudRain className="w-full h-full" />;
      case 'mist':
      case 'clouds':
        return <Cloud className="w-full h-full" />;
      default:
        return <Cloud className="w-full h-full" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !weatherData) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-red-500">{error || 'No weather data available'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Weather in {weatherData.name}</h1>
        <div className="relative w-full md:w-auto">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative w-full">
              <input
                type="text"
                value={searchInput}
                onChange={handleSearchInputChange}
                placeholder="Search for a city..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                      onClick={() => handleSuggestionClick(suggestion.name)}
                    >
                      <div className="font-medium">{suggestion.name}</div>
                      <div className="text-sm text-gray-500">
                        {suggestion.state ? `${suggestion.state}, ` : ''}{suggestion.country}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Current Weather */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold text-gray-900">
              {Math.round(weatherData.main.temp)}°C
            </h2>
            <p className="text-gray-500">
              Feels like {Math.round(weatherData.main.feels_like)}°C
            </p>
            <p className="text-xl text-gray-600 capitalize mt-2">
              {weatherData.weather[0].description}
            </p>
          </div>
          <div className="text-blue-500 w-24 h-24">
            {getWeatherIcon(weatherData.weather[0].main)}
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 bg-blue-50 p-4 rounded-lg">
            <Wind className="w-6 h-6 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Wind Speed</p>
              <p className="text-lg font-semibold">
                {Math.round(weatherData.wind.speed * 3.6)} km/h
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 bg-blue-50 p-4 rounded-lg">
            <CloudRain className="w-6 h-6 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Humidity</p>
              <p className="text-lg font-semibold">{weatherData.main.humidity}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Day Forecast */}
      {forecastData && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">5-Day Forecast</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {forecastData.list
              .filter((item, idx) => idx % 8 === 0)
              .slice(0, 5)
              .map((item, idx) => (
                <div key={idx} className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="font-semibold text-gray-700">
                    {new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <div className="text-blue-500 w-12 h-12 mx-auto my-2">
                    {getWeatherIcon(item.weather[0].main)}
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(item.main.temp)}°C</p>
                  <p className="text-sm text-gray-600 capitalize">{item.weather[0].description}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;