import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Use the API key directly for local development
const API_KEY = 'AIzaSyC3xokIE3KHWm9AlAKv9qa2bLd0Lczhz4w';

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      apiKey: API_KEY, // Use the direct API key
    }),
  ],
  model: 'googleai/gemini-2.0-flash',
});
