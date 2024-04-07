import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [weatherData, setWeatherData] = useState([]);
  const [searchedWeatherData, setSearchedWeatherData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [temperatureUnit, setTemperatureUnit] = useState('C'); // Default unit is Celsius
  const [currentWeatherImage, setCurrentWeatherImage] = useState('');
  const [searchedWeatherImage, setSearchedWeatherImage] = useState('');
  const [timeFormat, setTimeFormat] = useState('12h');

  // Mapping between Weatherbit's weather condition codes and corresponding image URLs
  const weatherImages = {
    'clear sky': 'https://cdn-icons-png.flaticon.com/128/6974/6974833.png',
    'few clouds': 'https://cdn-icons-png.flaticon.com/128/414/414927.png',
    'scattered clouds': 'https://cdn-icons-png.flaticon.com/512/3222/3222808.png',
    'broken clouds': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVj1ENPld2yFwzOB9gdCQTJThV8dN6jT5F8g&s',
    'shower rain': 'https://cdn-icons-png.flaticon.com/128/1163/1163657.png',
    'rain': 'https://cdn-icons-png.flaticon.com/128/4834/4834677.png',
    'thunderstorm': 'https://cdn-icons-png.flaticon.com/128/9755/9755354.png',
    'snow': 'https://cdn-icons-png.flaticon.com/128/2942/2942909.png',
    'mist': 'https://cdn-icons-png.flaticon.com/512/1458/1458966.png',
    // Add more conditions and corresponding image URLs as needed
  };

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        let response;
        if (latitude !== null && longitude !== null) {
          response = await axios.get('https://api.weatherbit.io/v2.0/current', {
            params: {
              key: '4006b6418dc844ecaac93576a30072c9',
              lat: latitude,
              lon: longitude,
              units: temperatureUnit === 'F' ? 'I' : 'M' // 'I' for Fahrenheit, 'M' for Celsius
            }
          });
          setWeatherData(response.data.data || []);
          // Set current weather image
          setCurrentWeatherImage(weatherImages[response.data.data[0].weather.description.toLowerCase()]);
        }
      } catch (error) {
        console.error('Error fetching current weather data: ', error);
      }
    };

    fetchWeatherData();
  }, [latitude, longitude, temperatureUnit]);

  useEffect(() => {
    const fetchSearchedWeatherData = async () => {
      try {
        let response;
        if (searchQuery.match(/^\d+$/)) { // Check if searchQuery is a number (postal code)
          response = await axios.get('https://api.weatherbit.io/v2.0/current', {
            params: {
              key: '4006b6418dc844ecaac93576a30072c9',
              postal_code: searchQuery,
              units: temperatureUnit === 'F' ? 'I' : 'M' // 'I' for Fahrenheit, 'M' for Celsius
            }
          });
        } else { // Assume searchQuery is a city name
          response = await axios.get('https://api.weatherbit.io/v2.0/current', {
            params: {
              key: '4006b6418dc844ecaac93576a30072c9',
              city: searchQuery,
              units: temperatureUnit === 'F' ? 'I' : 'M' // 'I' for Fahrenheit, 'M' for Celsius
            }
          });
        }
        setSearchedWeatherData(response.data.data || []);
        // Set searched weather image
        setSearchedWeatherImage(weatherImages[response.data.data[0].weather.description.toLowerCase()]);
      } catch (error) {
        console.error('Error fetching searched weather data: ', error);
      }
    };

    fetchSearchedWeatherData();
  }, [searchQuery, temperatureUnit]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleUnitToggle = (unit) => {
    setTemperatureUnit(unit);
  };

  const toggleTimeFormat = () => {
    setTimeFormat((format) => (format === '12h' ? '24h' : '12h'));
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
      }, (error) => {
        console.error('Error getting current location: ', error);
      });
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, []);

  const formatTime = (time) => {
    if (timeFormat === '12h') {
      const [hours, minutes] = time.split(':');
      const period = parseInt(hours, 10) >= 12 ? 'PM' : 'AM';
      const formattedHours = parseInt(hours, 10) % 12 || 12;
      return `${formattedHours}:${minutes} ${period}`;
    } else {
      return time;
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Weather Dashboard</h1>
      
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Enter city name or postal code..."
        value={searchQuery}
        onChange={handleSearch}
      />

      {/* Temperature Unit Toggle */}
      <div>
        <button onClick={() => handleUnitToggle('C')}>Celsius</button>
        <button onClick={() => handleUnitToggle('F')}>Fahrenheit</button>
      </div>

       {/* Time Format Toggle */}
       <div className="button-container">
        <button onClick={toggleTimeFormat}>
          {timeFormat === '12h' ? '12-Hour Time' : '24-Hour Time'}
        </button>
      </div>

      {/* Display Current and Searched Location Weather Side by Side */}
      <div className="weather-container">
        {/* Current Location Weather */}
        <div>
          <h2>Current Location Weather</h2>
          {weatherData.length > 0 ? (
            <div>
              <img src={currentWeatherImage} alt="Current Weather" />
              <ul>
                {weatherData.map((data, index) => (
                  <li key={index}>
                    <h3>{data.city_name}</h3>
                    <p>Temperature: {temperatureUnit === 'F' ? data.temp : (data.temp - 32) * 5/9} {temperatureUnit}</p>
                    <p>Wind Speed: {data.wind_spd}</p>
                    <p>Sunrise: {formatTime(data.sunrise)}</p>
                    <p>Sunset: {formatTime(data.sunset)}</p>
                    {/* Add other weather data properties as needed */}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>No weather data found for current location.</p>
          )}
        </div>
        
        {/* Searched Location Weather */}
        <div>
          <h2>Searched Location Weather</h2>
          {searchedWeatherData.length > 0 ? (
            <div>
              <img src={searchedWeatherImage} alt="Searched Weather" />
              <ul>
                {searchedWeatherData.map((data, index) => (
                  <li key={index}>
                    <h3>{data.city_name}</h3>
                    <p>Temperature: {temperatureUnit === 'F' ? data.temp : (data.temp - 32) * 5/9} {temperatureUnit}</p>
                    <p>Wind Speed: {data.wind_spd}</p>
                    <p>Sunrise: {formatTime(data.sunrise)}</p>
                    <p>Sunset: {formatTime(data.sunset)}</p>
                    {/* Add other weather data properties as needed */}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>No weather data found for searched location.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;