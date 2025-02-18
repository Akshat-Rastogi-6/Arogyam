import React, { useState, useEffect, useRef } from "react";
import { generateHealthTip } from "../services/geminiService";

const WeatherTip = () => {
  const [tip, setTip] = useState("Loading weather tips...");
  const lastRefreshRef = useRef("");

  const fetchWeather = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Load weather API key from env
          const weatherApiKey = '227b3fbd398dbc05d444e566470a503d';
          fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${weatherApiKey}&units=metric`
          )
            .then((response) => {
              if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
              }
              return response.json();
            })
            .then((data) => {
              // Extract weather parameters
              const temp = data.main?.temp;
              const humidity = data.main?.humidity;
              const condition =
                data.weather && data.weather[0]
                  ? data.weather[0].main.toLowerCase()
                  : "unknown";
              const rainVolume = data.rain ? data.rain["1h"] || 0 : 0;
              const snowVolume = data.snow ? data.snow["1h"] || 0 : 0;
              const windSpeed = data.wind?.speed || 0;

              // Build Gemini API prompt using the weather data
              const prompt = `Based on the current weather: Temperature ${temp}°C, Humidity ${humidity}%, Condition ${condition}, Rain ${rainVolume}mm, Snow ${snowVolume}mm, Wind Speed ${windSpeed}m/s, provide a one-line health tip for the user.`;

              // Use the geminiService to generate the health tip
              generateHealthTip(prompt)
                .then((generatedTip) => {
                  setTip(generatedTip || "Stay healthy and enjoy your day!");
                })
                .catch((error) => {
                  console.error("Gemini API error:", error);
                  setTip("Unable to get health tip from Gemini API.");
                });
            })
            .catch((error) => {
              console.error("Fetch error:", error);
              setTip("Unable to fetch weather data.");
            });
        },
        (error) => {
          console.error("Geolocation error:", error);
          setTip("Unable to get your location.");
        }
      );
    } else {
      setTip("Geolocation is not supported by your browser.");
    }
  };

  useEffect(() => {
    // Initial fetch on mount
    fetchWeather();

    // Check every minute for refresh condition.
    const intervalId = setInterval(() => {
      const now = new Date();
      const day = now.getDay(); // 0: Sunday, 6: Saturday
      const hour = now.getHours();
      const minute = now.getMinutes();

      // Format current minute to keep track (e.g., "2023-10-11-08:00")
      const currTimeKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${hour}:${minute}`;

      if (lastRefreshRef.current === currTimeKey) {
        return; // already refreshed this minute
      }
      // Define refresh times:
      // Working days (Mon-Fri): 8:00 and 17:00
      // Weekends (Sat,Sun): 8:00, 12:00 and 17:00
      const isWeekend = day === 0 || day === 6;
      const validRefreshHours = isWeekend ? [8, 12, 17] : [8, 17];

      if (minute === 0 && validRefreshHours.includes(hour)) {
        fetchWeather();
        lastRefreshRef.current = currTimeKey;
      }
    }, 60000); // check every minute

    return () => clearInterval(intervalId);
  }, []);

  return <p>{tip}</p>;
};

export default WeatherTip;
