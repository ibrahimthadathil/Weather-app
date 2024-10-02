import React, { useEffect, useRef, useState } from 'react'
import './weather.css'
import Search from '../assets/search.png'
import clear from '../assets/clear.png'
import Cloud from '../assets/cloud.png'
import drizzle from '../assets/drizzle.png'
import humidity from '../assets/humidity.png'
import rain from '../assets/rain.png'
import snow from '../assets/snow.png'
import wind from '../assets/wind.png'
import mic from '../assets/mic.png'
import { toast } from 'sonner'

export default function weather() {
  const [weatherData,setWeather] = useState({})
  const [val,setCity] =useState('Kerala')
  const [mode,setMode]=useState('city')
  const inputRef = useRef(null)
  const recognitionRef = useRef(null) 
  const allIcons ={
    '01d':clear,
    '01n':clear,
    '02d':Cloud,
    '02n':Cloud,
    '03d':Cloud,
    '03n':Cloud,
    '04d':drizzle,
    '04n':drizzle,
    '09d':rain,
    '09n':rain,
    '10d':rain,
    '10n':rain,
    '13d':snow,
    '13n':snow,
  }
  const search = async(city)=>{
    try {
      const CITY = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${import.meta.env.VITE_APP_ID}`
      const ZIP =  `https://api.openweathermap.org/data/2.5/weather?zip=${val},${'IN'}&units=metric&appid=${import.meta.env.VITE_APP_ID}`
      const url = mode=='city'? CITY :ZIP
      const res = await fetch(url).then((res)=>res.json())
      
      const icons = allIcons[res.weather[0].icon] || clear
    setWeather({
      Humidity:res.main.humidity,
      temp:Math.floor(res.main.temp),
      location : res.name,
      speed:res.wind.speed,
      icon:icons
    })
    
  } catch (error) {
    console.log(error.message)
    toast.error(`Enter valid ${mode}`)
  }

}

const VoiceRecognition = () => {
  if (!('webkitSpeechRecognition' in window)) {
    toast.error('Voice recognition not supported in this browser')
    return
  }

  if (!recognitionRef.current) {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.lang = 'en-US'
    recognitionRef.current.continuous = false
    recognitionRef.current.interimResults = false

    recognitionRef.current.onresult = (event) => {
      const speechResult = event.results[0][0].transcript
      inputRef.current.value = speechResult
      setCity(speechResult) 
    }
  }

  recognitionRef.current.start()
}

useEffect(()=>{
search(val)
},[val])
  return (
    <>
    <div className='weather'>
      
      <div className="searchbar">

          
      <button  className="btn" onClick={() => mode=='PIN'?setMode('city'):setMode('PIN')}>Change Mode</button>
          <input type="text" ref={inputRef} placeholder={`search By ${mode}`} id='city' />

          <img  src={mic} alt="" onClick={VoiceRecognition}/>
          <img  src={Search} alt="" onClick={()=>setCity(inputRef.current.value)}/>
      </div>

      <img src={weatherData.icon} alt="" className='weather-icon'/>
      <p className='temp'>{weatherData.temp}°c</p>
      <p className='location'>{weatherData.location}</p>
    <div className="data">
      <div className="col">
        <img src={humidity} alt="" />
      <div>
        <p>{weatherData.Humidity}%</p>
        <span>Humidity</span>
      </div>
      </div>
      <div className="col">
        <img src={wind} alt="" />
      <div>
        <p>{weatherData.speed} km/h</p>
        <span>Wind Speed</span>
      </div>
      </div>
    </div>

    </div>
    </> 
  )
}
