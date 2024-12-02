import { Router } from 'express';
import weatherService from '../../service/weatherService';
import historyService from '../../service/historyService';

const router = Router();

router.post('/', async (req, res) => {
  try {
    // Extract city name from the request body
    const newCity = req.body.cityName;
    console.log('newCity', JSON.stringify(newCity));

    // Fetch weather data for the city
    const weatherData = await weatherService.getWeatherForCity(newCity);
    console.log('weatherData: ', weatherData);

    // Respond with the weather data
    res.json(weatherData);

    // Save city to search history
    const id = weatherData[0].id;
    console.log('id: ', id);
    await historyService.addCity(newCity, id);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch weather data or save city to history' });
  }
});

router.get('/history', async (_req, res) => {
  try {
    // Get the list of searched cities
    const cities = await historyService.getCities();
    res.json(cities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve search history' });
  }
});

router.delete('/history/:id', async (req, res) => {
  try {
    // Remove city from history by ID
    const id = req.params.id;
    await historyService.removeCity(id);
    res.json({ success: 'City successfully removed from search history' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete city from search history' });
  }
});

export default router;
