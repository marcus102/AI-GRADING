import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
// To use other model providers, such as local LLMs (e.g., via Ollama),
// you would typically:
// 1. Install the provider's Genkit plugin (e.g., `npm install @genkit-ai/ollama`).
// 2. Import the plugin here (e.g., `import { ollama } from '@genkit-ai/ollama';`).
// 3. Add the plugin instance to the `plugins` array below, configuring it as needed.
//    (e.g., `ollama({ models: [{ name: 'llama3' }], serverAddress: 'http://localhost:11434' })`).

const plugins = [
  googleAI(),
  // Example: If you installed and configured an Ollama plugin, you might add it here:
  // ollama({
  //   models: [{ name: 'llama3', kind: 'generate' }], // Adjust model name as needed
  //   serverAddress: process.env.OLLAMA_SERVER_ADDRESS || 'http://127.0.0.1:11434'
  // }),
];

// The default model to use for flows/prompts that don't explicitly specify one.
// This can be overridden by setting the GENKIT_MODEL_NAME environment variable.
// Ensure the model name is prefixed with its provider if multiple providers are used
// (e.g., 'googleai/gemini-2.0-flash' or 'ollama/llama3').
// If GENKIT_MODEL_NAME is not set, it defaults to 'googleai/gemini-2.0-flash'.
const defaultModelName =
  process.env.GENKIT_MODEL_NAME || "googleai/gemini-2.0-flash";

export const ai = genkit({
  plugins: plugins,
  model: defaultModelName, // Sets the default model for Genkit operations
  // enableTracingAndMetrics: true, // Optional: Consider enabling for better observability in production or complex setups.
});

// Note on using multiple model providers:
// If you configure multiple model providers (e.g., Google AI and Ollama),
// when defining prompts or making `ai.generate()` calls, you can specify
// the model explicitly to choose which provider and model to use, e.g.:
// `ai.generate({ model: 'ollama/llama3', prompt: '...' })`
// or
// `ai.definePrompt({ model: 'googleai/gemini-1.5-pro-latest', ... })`
// If no model is specified in those calls, the `defaultModelName` configured above will be used.
