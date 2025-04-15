import React, { useEffect, useRef, useState } from "react";
import "./weather.css";
import Search from "../assets/search.png";
import clear from "../assets/clear.png";
import Cloud from "../assets/cloud.png";
import drizzle from "../assets/drizzle.png";
import humidity from "../assets/humidity.png";
import rain from "../assets/rain.png";
import snow from "../assets/snow.png";
import wind from "../assets/wind.png";
import mic from "../assets/mic.png";
import { toast } from "sonner";

export default function Weather() {
  const [weatherData, setWeather] = useState({});
  const [val, setCity] = useState("Kerala");
  const [mode, setMode] = useState("city");
  const [isListening, setIsListening] = useState(false);
  const [voiceWaveAmplitudes, setVoiceWaveAmplitudes] = useState([0.3, 0.5, 0.7, 0.5, 0.3]);
  const [inputValue, setInputValue] = useState("");
  const [weatherCode, setWeatherCode] = useState("");
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const animationRef = useRef(null);
  
  const allIcons = {
    "01d": clear,
    "01n": clear,
    "02d": Cloud,
    "02n": Cloud,
    "03d": Cloud,
    "03n": Cloud,
    "04d": drizzle,
    "04n": drizzle,
    "09d": rain,
    "09n": rain,
    "10d": rain,
    "10n": rain,
    "13d": snow,
    "13n": snow,
  };
  
  const search = async (city) => {
    try {
      const CITY = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${
        import.meta.env.VITE_APP_ID
      }`;
      const ZIP = `https://api.openweathermap.org/data/2.5/weather?zip=${val},${"IN"}&units=metric&appid=${
        import.meta.env.VITE_APP_ID
      }`;
      const url = mode == "city" ? CITY : ZIP;
      const res = await fetch(url).then((res) => res.json());

      const iconCode = res.weather[0].icon;
      const icons = allIcons[iconCode] || clear;
      
      setWeatherCode(iconCode);
      setWeather({
        humidity: res.main.humidity,
        temp: Math.floor(res.main.temp),
        location: res.name,
        speed: res.wind.speed,
        icon: icons,
        description: res.weather[0].description,
        feels_like: Math.floor(res.main.feels_like)
      });
    } catch (error) {
      console.log(error.message);
      toast.error(`Enter valid ${mode}`);
    }
  };

  const animateVoiceWave = () => {
    if (!isListening) return;
    
    // Generate random amplitudes for voice wave effect
    const newAmplitudes = Array(5).fill(0).map(() => Math.random() * 0.7 + 0.3);
    setVoiceWaveAmplitudes(newAmplitudes);
    
    animationRef.current = requestAnimationFrame(animateVoiceWave);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error("Error stopping recognition:", e);
      }
    }
    setIsListening(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const VoiceRecognition = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast.error("Voice recognition not supported in this browser");
      return;
    }

    try {
      if (!recognitionRef.current) {
        const SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition;
        
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = "en-US";
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = (event) => {
          const speechResult = event.results[0][0].transcript;
          setInputValue(speechResult); // Update state instead of directly manipulating DOM
          setTimeout(() => {
            setCity(speechResult);
            stopListening();
          }, 500);
        };

        recognitionRef.current.onend = () => {
          stopListening();
        };

        recognitionRef.current.onerror = (event) => {
          console.error("Speech recognition error", event.error);
          toast.error("Voice recognition failed. Please try again.");
          stopListening();
        };
      }
      
      setIsListening(true);
      recognitionRef.current.start();
      animateVoiceWave();

      // Auto-stop listening after 5 seconds if no result
      setTimeout(() => {
        if (isListening) {
          stopListening();
        }
      }, 5000);
    } catch (error) {
      console.error("Speech recognition setup error:", error);
      toast.error("Could not initialize voice recognition. Please try again.");
    }
  };

  const handleModeToggle = () => {
    setMode(mode === "city" ? "zipcode" : "city");
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (inputValue.trim()) {
      setCity(inputValue);
    }
  };

  useEffect(() => {
    search(val);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.error("Error aborting recognition:", e);
        }
      }
    };
  }, [val]);

  // Sync input ref value with state when component updates
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = inputValue;
    }
  }, [inputValue]);

  // Weather animation components
  const SunnyAnimation = () => (
    <div className="weather-animation sunny-animation">
      <div className="sun">
        <div className="rays"></div>
      </div>
    </div>
  );

  const CloudyAnimation = () => (
    <div className="weather-animation cloudy-animation">
      <div className="cloud cloud1"></div>
      <div className="cloud cloud2"></div>
      <div className="cloud cloud3"></div>
    </div>
  );

  const RainyAnimation = () => (
    <div className="weather-animation rainy-animation">
      <div className="cloud rain-cloud"></div>
      <div className="rain-container">
        {Array(20).fill().map((_, i) => (
          <div key={i} className="raindrop" style={{ 
            left: `${Math.random() * 100}%`, 
            animationDelay: `${Math.random() * 2}s` 
          }}></div>
        ))}
      </div>
    </div>
  );

  const SnowyAnimation = () => (
    <div className="weather-animation snowy-animation">
      <div className="cloud snow-cloud"></div>
      <div className="snow-container">
        {Array(30).fill().map((_, i) => (
          <div key={i} className="snowflake" style={{ 
            left: `${Math.random() * 100}%`, 
            animationDelay: `${Math.random() * 5}s` 
          }}></div>
        ))}
      </div>
    </div>
  );

  const DrizzleAnimation = () => (
    <div className="weather-animation drizzle-animation">
      <div className="cloud drizzle-cloud"></div>
      <div className="drizzle-container">
        {Array(15).fill().map((_, i) => (
          <div key={i} className="drizzle-drop" style={{ 
            left: `${Math.random() * 100}%`, 
            animationDelay: `${Math.random() * 3}s` 
          }}></div>
        ))}
      </div>
    </div>
  );

  // Render the appropriate animation based on weather code
  const renderWeatherAnimation = () => {
    if (!weatherCode) return null;
    
    if (weatherCode.startsWith('01')) {
      return <SunnyAnimation />;
    } else if (weatherCode.startsWith('02') || weatherCode.startsWith('03') || weatherCode.startsWith('04')) {
      return <CloudyAnimation />;
    } else if (weatherCode.startsWith('09') || weatherCode.startsWith('10')) {
      return <RainyAnimation />;
    } else if (weatherCode.startsWith('13')) {
      return <SnowyAnimation />;
    } else if (weatherCode.startsWith('04')) {
      return <DrizzleAnimation />;
    }
    
    return null;
  };

  return (
    <>
      <div className="weather-container">
        {/* Weather animation as background */}
        <div className="weather-animation-container">
          {renderWeatherAnimation()}
        </div>
        
        {/* Weather card with blur effect on top */}
        <div className="weather">
          <div className="search-section">
            <form className="searchbar" onSubmit={handleSubmit}>
              {isListening ? (
                <div className="voice-wave">
                  {voiceWaveAmplitudes.map((amplitude, index) => (
                    <div 
                      key={index} 
                      className="wave-bar" 
                      style={{ height: `${amplitude * 40}px` }}
                    ></div>
                  ))}
                  <span className="listening-text">Listening...</span>
                </div>
              ) : (
                <input
                  type="text"
                  ref={inputRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder={`Search by ${mode}`}
                  id="city"
                />
              )}
  
              <div className="search-controls">
                <button 
                  type="button" 
                  className={`icon-button mic ${isListening ? 'active' : ''}`} 
                  onClick={isListening ? stopListening : VoiceRecognition}
                >
                  <img src={mic} alt="Microphone" />
                </button>
                <button type="submit" className="icon-button">
                  <img src={Search} alt="Search" />
                </button>
              </div>
            </form>
            <button className="mode-toggle" onClick={handleModeToggle}>
              Switch to {mode === "city" ? "zipcode" : "city"}
            </button>
          </div>
  
          <div className="weather-display">
            <div className="weather-main">
              <img src={weatherData.icon} alt="" className="weather-icon" />
              <div className="weather-info">
                <p className="temp">{weatherData.temp}<span>°C</span></p>
                <p className="feels-like">Feels like: {weatherData.feels_like}°C</p>
                <p className="description">{weatherData.description}</p>
              </div>
            </div>
            
            <p className="location">{weatherData.location}</p>
            
            <div className="data">
              <div className="col">
                <img src={humidity} alt="Humidity" />
                <div>
                  <p>{weatherData.humidity}%</p>
                  <span>Humidity</span>
                </div>
              </div>
              <div className="col">
                <img src={wind} alt="Wind" />
                <div>
                  <p>{weatherData.speed} km/h</p>
                  <span>Wind Speed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}