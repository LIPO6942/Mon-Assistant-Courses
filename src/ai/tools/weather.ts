'use server';
/**
 * @fileOverview A tool for getting the current weather.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Mock weather data. In a real app, this would call a weather API.
const mockWeather = {
  'Paris': { temperature: 15, condition: 'cloudy', frenchCondition: 'nuageux' },
  'Marseille': { temperature: 25, condition: 'sunny', frenchCondition: 'ensoleillé' },
  'Lyon': { temperature: 18, condition: 'rainy', frenchCondition: 'pluvieux' },
  'Toulouse': { temperature: 22, condition: 'sunny', frenchCondition: 'ensoleillé' },
  'Nice': { temperature: 24, condition: 'sunny', frenchCondition: 'ensoleillé' },
  'Tunis': { temperature: 28, condition: 'sunny', frenchCondition: 'ensoleillé' },
};
const defaultWeather = { temperature: 12, condition: 'cloudy', frenchCondition: 'nuageux' };

export const getWeather = ai.defineTool(
  {
    name: 'getWeatherForLocation',
    description: 'Obtient la météo actuelle pour un lieu donné. Le lieu doit être une grande ville française ou Tunis.',
    inputSchema: z.object({
      location: z.string().describe('La ville pour laquelle obtenir la météo. Ex: Paris, Marseille, Lyon, Tunis.'),
    }),
    outputSchema: z.object({
      location: z.string(),
      temperature: z.number().describe('La température en degrés Celsius.'),
      condition: z.string().describe('La condition météo en anglais (ex: sunny, cloudy, rainy).'),
      frenchCondition: z.string().describe('La condition météo en français (ex: ensoleillé, nuageux, pluvieux).'),
    }),
  },
  async ({ location }) => {
    // In a real app, you would call a weather API here.
    // For this prototype, we'll return mock data.
    const city = Object.keys(mockWeather).find(city => location.toLowerCase().includes(city.toLowerCase()));
    const weather = city ? mockWeather[city as keyof typeof mockWeather] : defaultWeather;
    
    return {
      location: city || location,
      ...weather,
    };
  }
);
