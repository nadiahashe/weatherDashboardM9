import dotenv from 'dotenv';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// TODO: Define a class for the Weather object
class Weather {
  city: string;
  id: string;
  date: string;
  tempF: number;
  windSpeed: string;
  humidity: number;
  icon: string;


  constructor(city: string, id: string, date: string, temperature: number, wind: string, humidity: number, icon: string) {
    this.city = city;
    this.id = id;
    this.date = date;
    this.tempF = temperature;
    this.windSpeed = wind;
    this.humidity = humidity;
    this.icon = icon;
  }
}

// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  baseURL?: string;
  apiKey?: string;
  cityName?: string;

  constructor() {
    this.baseURL = process.env.API_BASE_URL || '';
    this.apiKey = process.env.API_KEY || '';
    this.cityName = '';
  }
  // TODO: Create fetchLocationData method
  async fetchLocationData(query: string) {
    try {
      console.log('query: ', query);
      console.log('----------------------------------');
      const response = await fetch(query);
      const data = await response.json();
      return data.coord
    }
    catch (err) {
      console.log('Error: Unable to fetchLocationData', err);
      return err;
    }
  }
  // TODO: Create destructureLocationData method
  // takes in Coordinates object and returns latitude and longitude
  private destructureLocationData(locationData: Coordinates): Coordinates {
    try {
      const { lon, lat } = locationData;
      return { lon, lat };
    } catch (err) {
      console.log('Error: Unable to destructureLocationData', err);
      return { lon: 0, lat: 0 }; // Return default coordinates
    }
  }
  // TODO: Create buildGeocodeQuery method
  //create query based on city name
  private buildGeocodeQuery(): string {
    try {
      return `${this.baseURL}/data/2.5/weather?q=${this.cityName}&units=imperial&appid=${this.apiKey}`;
    } catch (err) {
      console.log('Error: Unable to buildGeocodeQuery', err);
      return ''; // Return empty string
    }
  }
  // TODO: Create buildWeatherQuery method
  //takes in coordinates object and returns lat long based query
  private buildWeatherQuery(coordinates: Coordinates): string {
    try {
      const { lon, lat } = coordinates;
      return `${this.baseURL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${this.apiKey}`;
    } catch (err) {
      console.log('Error: Unable to buildWeatherQuery', err);
      return ''; // Return empty string
    }
  }
  private async fetchWeatherData(coordinates: Coordinates) {
    try {
      const query = this.buildWeatherQuery(coordinates);
      const response = await fetch(query);
      return await response.json();
    } catch (err) {
      console.log('Error: Unable to fetchWeatherData', err);
      return err;
    }
  }
  // TODO: Build parseCurrentWeather method
  //takes in query response and returns Weather object with data
  private parseCurrentWeather(response: any) {
    try {
      // console.log('response: ', response.list[0].main);
      // console.log('response: ', response.list[0].weather);
      // const { city, temp, wind_speed, humidity, weather } = response.list[0];
      console.log('response.list[0]: ', response.list[0]);
      const city = response.city.name;
      console.log('city: ', city);
      const id = response.city.id;
      console.log('id: ', id);
      const formatDate = convertTime(response.list[0].dt);
      const tempF = response.list[0].main.temp;
      // convert to Fareinheit
      // const tempF = Math.round((temp - 273.15) * 9 / 5 + 32);
      // console.log('tempF: ', tempF);
      const windSpeed = response.list[0].wind.speed;
      console.log('wind_speed: ', windSpeed);
      const humidity = response.list[0].main.humidity;
      console.log('humidity: ', humidity);
      const icon = response.list[0].weather[0].icon;
      const currentWeather = new Weather(city, id, formatDate, tempF, windSpeed, humidity, icon);
      return currentWeather;
    } catch (err) {
      console.log('Error: Unable to parseCurrentWeather', err);
      return new Weather('', '', '', 0, '', 0, ''); // Return empty Weather object
    }

  }

  // TODO: Complete buildForecastArray method
  // this basically adds current weather to the forecast ?
  private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
    try {
      // console.log('currentWeather: ', currentWeather);
      // console.log('weatherData: ', weatherData);
      let forecastArray: Weather[] = [];
      forecastArray.push(currentWeather);
      // console.log('forecastArray: ', forecastArray);
      console.log('----------------------------------');
      weatherData.forEach((data: any) => {
        // console.log('data: ', data);
        const date = new Date(data.dt * 1000);
        const hour = date.getUTCHours();
        if (hour === 12) {
        // console.log('hour: ', hour);
          const city = currentWeather.city;
          const id = currentWeather.id;
          const formatDate = convertTime(data.dt);
          const temp = data.main.temp;
          // const tempF = Math.round((temp - 273.15) * 9 / 5 + 32);
          const wind_speed = data.wind.speed;
          const humidity = data.main.humidity;
          const icon = data.weather[0].icon;
          const forecast = new Weather(city, id, formatDate, temp, wind_speed, humidity, icon);
          // console.log('forecast: ', forecast);
          forecastArray.push(forecast)
        };
      });
      // console.log('forecastArray: ', forecastArray);
      return forecastArray;
    } catch (err) {
      console.log('Error: Unable to buildForecastArray', err);
      return [new Weather('', '', '', 0, '', 0, '')]; // Return empty
    }
  }

  // TODO: Complete getWeatherForCity method
  // main method
  async getWeatherForCity(city: string) {
    try {
      this.cityName = city;
      // console.log('cityName: ', this.cityName);
      const queryC = this.buildGeocodeQuery();
      // console.log('queryC: ', queryC);
      const locationData = await this.fetchLocationData(queryC);
      // console.log('locationData: ', locationData);
      const coordinates = this.destructureLocationData(locationData);
      // console.log('coordinates: ', coordinates);
      const queryW = await this.buildWeatherQuery(coordinates);
      console.log('queryW: ', queryW);
      const weatherData = await this.fetchWeatherData(coordinates);
      // console.log('weatherData: ', weatherData);
      const currentWeather = this.parseCurrentWeather(weatherData);
      // console.log('currentWeather: ', currentWeather);
      const forecast = this.buildForecastArray(currentWeather, weatherData.list);
      // console.log('forecast: ', forecast);
      return forecast;
    }
    catch (err) {
      console.log('Error: Unable to getWeatherForCity', err);
      return [new Weather('', '', '', 0, '', 0, '')]; // Return empty Weather object
    }
  }
}

//time converter
function convertTime(unix: number) {
  const date = new Date(unix * 1000);
  // Extract month, day, and year
  const month = date.getMonth() + 1; // Months are zero-based, so add 1
  const day = date.getDate();
  const year = date.getFullYear();

  // Pad single-digit months and days with leading zeros
  const formattedMonth = month < 10 ? `0${month}` : month;
  const formattedDay = day < 10 ? `0${day}` : day;

  // Return formatted date string
  return `${formattedMonth}/${formattedDay}/${year}`;
}

export default new WeatherService();
