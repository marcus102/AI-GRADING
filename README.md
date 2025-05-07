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

2.  **Using Local Models with Ollama (e.g., Gemma):**

    This section provides detailed steps to configure Genkit to use a model like Gemma, served locally via Ollama.

    *   **Prerequisite: Install and Run Ollama with Gemma:**
        *   Download and install Ollama from [https://ollama.com/](https://ollama.com/).
        *   Once Ollama is installed, pull the Gemma model. Open your terminal and run:
            ```bash
            ollama pull gemma:latest
            ```
            *(Note: `gemma:latest` will pull the latest version. You can specify other tags like `gemma:7b` or `gemma:2b` if you prefer a specific version. The model tag you pull must match the one you configure in Genkit.)*
        *   Ensure Ollama is running. Typically, it runs as a background service after installation. You can check its status or start it using the Ollama CLI (e.g., `ollama serve` if not automatically started, though this is often not needed).

    *   **Install the Genkit Ollama Plugin:**
        *   Genkit plugins allow integration with various model providers. For Ollama, you would typically install a plugin like `@genkit-ai/ollama`.
            ```bash
            npm install @genkit-ai/ollama
            ```
        *   **Important Note:** As of the last update, an official `@genkit-ai/ollama` plugin might not be available on npm under this exact name, or it may have a different version compatibility. If the above command fails (e.g., with a "Not Found" error), please search the official Genkit documentation or community resources for the correct and current Ollama plugin or alternative integration methods. The following steps assume such a plugin is available and named `@genkit-ai/ollama`.

    *   **Configure the Ollama Plugin in `src/ai/genkit.ts`:**
        *   Open the `src/ai/genkit.ts` file.
        *   Import the Ollama plugin and add it to the `plugins` array within the `genkit()` configuration.
        *   Configure the plugin with your Gemma model details.

        ```typescript
        // src/ai/genkit.ts
        import {genkit} from 'genkit';
        import {googleAI} from '@genkit-ai/googleai';
        import {ollama} from '@genkit-ai/ollama'; // Ensure this import path is correct for the plugin you installed

        const plugins = [
          googleAI(),
          ollama({ // Add the Ollama plugin instance
            models: [
              // Configure the Gemma model you pulled
              { name: 'gemma:latest', kind: 'generate' }, // This name must match the model tag from 'ollama pull'
              // You can add other Ollama models here, e.g.:
              // { name: 'llama3', kind: 'generate' },
            ],
            serverAddress: process.env.OLLAMA_SERVER_ADDRESS || 'http://127.0.0.1:11434' // Default Ollama address
          }),
        ];

        // The default model to use for flows/prompts that don't explicitly specify one.
        // This can be overridden by setting the GENKIT_MODEL_NAME environment variable.
        const defaultModelName = process.env.GENKIT_MODEL_NAME || 'googleai/gemini-2.0-flash';

        export const ai = genkit({
          plugins: plugins,
          model: defaultModelName, // Sets the default model for Genkit operations
          // enableTracingAndMetrics: true, 
        });
        ```
        *   Make sure the model `name` (e.g., `'gemma:latest'`) in the `models` array within the `ollama` plugin configuration exactly matches the tag you used with `ollama pull`.

    *   **Set Environment Variables to Use Gemma:**
        *   Create or update the `.env` file in the root of your project.
        *   Set `GENKIT_MODEL_NAME` to point to your Ollama-served Gemma model. The format is `ollama/MODEL_NAME_IN_PLUGIN_CONFIG`.

        ```env
        # .env

        # Set Genkit to use your Ollama-served Gemma model by default
        GENKIT_MODEL_NAME="ollama/gemma:latest"

        # Optionally, if your Ollama server is not at the default address:
        # OLLAMA_SERVER_ADDRESS="http://your_ollama_server_ip:11434"

        # If you are also using Google AI models, ensure GOOGLE_API_KEY is set for them
        # GOOGLE_API_KEY="your_google_api_key"
        ```

    *   **Restart Your Application:**
        *   After making these changes, restart your Next.js development server and your Genkit development server (if you run it separately) for the new configuration to take effect.
            ```bash
            npm run dev
            # and if applicable, in another terminal:
            # npm run genkit:watch (or genkit:dev)
            ```

    Now, Genkit flows that do not explicitly specify a different model will attempt to use `"ollama/gemma:latest"` by default. You can also specify this model directly in your Genkit flows or prompts:
    ```typescript
    // Example in a flow when calling ai.generate:
    // const { output } = await ai.generate({
    //   model: 'ollama/gemma:latest', // Explicitly use the Ollama Gemma model
    //   prompt: 'Your prompt here...'
    // });

    // Or when defining a prompt:
    // const myPrompt = ai.definePrompt({
    //   name: 'myGemmaPrompt',
    //   model: 'ollama/gemma:latest', // Explicitly use the Ollama Gemma model
    //   input: { schema: z.object({ message: z.string() }) },
    //   prompt: `User message: {{{message}}}`,
    // });
    ```

    Ensure your Ollama server is running and accessible by the application when you try to use the model.
