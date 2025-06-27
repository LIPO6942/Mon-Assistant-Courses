import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI(), // API Key is automatically read from GOOGLE_API_KEY env var
  ],
});
