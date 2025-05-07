# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Genkit Configuration

### Switching AI Models

The application uses Genkit to interact with AI models. The default model used by the AI flows can be configured via an environment variable.

1.  **Set the `GENKIT_MODEL_NAME` environment variable:**
    Create or update the `.env` file in the root of your project and add the following line:
    ```env
    GENKIT_MODEL_NAME="your-desired-model-identifier"
    ```
    Replace `"your-desired-model-identifier"` with the specific model you want to use. For example:
    *   For Google AI's Gemini 2.0 Flash: `GENKIT_MODEL_NAME="googleai/gemini-2.0-flash"`
    *   For Google AI's Gemini 1.5 Flash: `GENKIT_MODEL_NAME="googleai/gemini-1.5-flash-latest"`

    If this variable is not set, the application defaults to `"googleai/gemini-2.0-flash"`. Ensure any necessary API keys (e.g., `GOOGLE_API_KEY` for Google AI models) are also set in your `.env` file.

2.  **Using Local or Other Model Providers (e.g., Ollama):**
    To use models from different providers (including locally hosted models via services like Ollama), you'll need to:
    *   **Install the appropriate Genkit plugin** for that provider. For example, if a Genkit plugin for Ollama exists (e.g., `@genkit-ai/ollama`), you would install it:
        ```bash
        npm install @genkit-ai/ollama
        ```
    *   **Configure the plugin** in `src/ai/genkit.ts`. This involves importing the plugin and adding it to the `plugins` array within the `genkit()` configuration. You'll also need to ensure the `GENKIT_MODEL_NAME` (or the model specified directly in a flow/prompt) matches a model accessible by that plugin (e.g., `"ollama/llama3"`).

    Refer to the comments in `src/ai/genkit.ts` for an example of where to add new plugins and how to configure them. You might also need to set additional environment variables for the new provider (e.g., `OLLAMA_SERVER_ADDRESS`).
