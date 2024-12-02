import * as fs from 'fs/promises';

class City {
  name: string;
  id: string;
  constructor(name: string, id: string) {
    this.name = name;
    this.id = id;
  }
}

class HistoryService {
  private async read(): Promise<string> {
    try {
      return await fs.readFile('db/searchHistory.json', { encoding: 'utf8' });
    } catch (error) {
      if (error instanceof Error && error.message.includes('ENOENT')) {
        // If file does not exist, initialize it
        await this.write([]);
        return '[]';
      }
      throw error; // Re-throw unknown errors
    }
  }

  private async write(cities: City[]) {
    try {
      await fs.writeFile('db/searchHistory.json', JSON.stringify(cities, null, '\t'));
    } catch (error) {
      if (error instanceof Error) {
        console.error('Failed to write file:', error.message);
      } else {
        console.error('An unknown error occurred while writing:', error);
      }
    }
  }

  async getCities(): Promise<City[]> {
    try {
      const cities = await this.read();
      return JSON.parse(cities) as City[];
    } catch (error) {
      if (error instanceof Error) {
        console.error('Failed to parse cities:', error.message);
      } else {
        console.error('An unknown error occurred while reading cities:', error);
      }
      return [];
    }
  }

  async addCity(name: string, id: string) {
    try {
      const newCity = new City(name, id);
      const existingCities = await this.getCities();
      const totalCities = [...existingCities, newCity];
      await this.write(totalCities);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Failed to add city:', error.message);
      } else {
        console.error('An unknown error occurred while adding city:', error);
      }
    }
  }

  async removeCity(id: string) {
    try {
      let existingCities = await this.getCities();
      existingCities = existingCities.filter((city) => city.id !== id);
      await this.write(existingCities);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Failed to remove city:', error.message);
      } else {
        console.error('An unknown error occurred while removing city:', error);
      }
    }
  }
}

export default new HistoryService();
