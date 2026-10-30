
import React, { useState } from "react";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function getWeather(e) {
    e.preventDefault();

    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);

    try {
      // Step 1: Find city coordinates
      const cityResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
      );

      const cityData = await cityResponse.json();

      if (!cityData.results || cityData.results.length === 0) {
        throw new Error("City not found. Try another city.");
      }

      const location = cityData.results[0];

      // Step 2: Get weather using coordinates
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`
      );

      const weatherData = await weatherResponse.json();

      setWeather({
        city: location.name,
        country: location.country,
        temperature: weatherData.current.temperature_2m,
        humidity: weatherData.current.relative_humidity_2m,
        wind: weatherData.current.wind_speed_10m,
        code: weatherData.current.weather_code
      });

    } catch (err) {
      setError(err.message || "Something went wrong");
    }

    setLoading(false);
  }

  function getCondition(code) {
    if (code === 0) return "Clear Sky";
    if ([1, 2, 3].includes(code)) return "Partly Cloudy";
    if ([45, 48].includes(code)) return "Foggy";
    if ([51, 53, 55, 61, 63, 65].includes(code)) return "Rainy";
    if ([71, 73, 75].includes(code)) return "Snowy";
    if ([95, 96, 99].includes(code)) return "Thunderstorm";
    return "Cloudy";
  }

  function getIcon(code) {
    if (code === 0) return "☀️";
    if ([1, 2, 3].includes(code)) return "⛅";
    if ([45, 48].includes(code)) return "🌫️";
    if ([51, 53, 55, 61, 63, 65].includes(code)) return "🌧️";
    if ([71, 73, 75].includes(code)) return "❄️";
    if ([95, 96, 99].includes(code)) return "⛈️";
    return "☁️";
  }

  return (
    <div className="app">
      <div className="weather-container">

        <h1>☀️ Weather App</h1>
        <p className="subtitle">
          Check the weather in your city
        </p>

        <form onSubmit={getWeather}>
          <input
            type="text"
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {weather && (
          <div className="weather-card">

            <h2>{weather.city}, {weather.country}</h2>

            <div className="weather-icon">
              {getIcon(weather.code)}
            </div>

            <h1>{weather.temperature}°C</h1>

            <h3>{getCondition(weather.code)}</h3>

            <div className="details">

              <div className="detail-box">
                <h3>💧</h3>
                <p>Humidity</p>
                <h4>{weather.humidity}%</h4>
              </div>

              <div className="detail-box">
                <h3>💨</h3>
                <p>Wind Speed</p>
                <h4>{weather.wind} km/h</h4>
              </div>

            </div>
          </div>
        )}

        <footer>
          Weather data powered by Open-Meteo
        </footer>

      </div>
    </div>
  );
}

export default App;
