// Lazy import to avoid initialization errors
let transformersModule: any = null;
let isInitialized = false;

const initializeONNX = async () => {
  try {
    // Import onnxruntime-web and configure it
    const ort = await import('onnxruntime-web');
    
    // Configure ONNX runtime for WASM execution
    ort.env.wasm.numThreads = 1;
    ort.env.wasm.simd = true;
    
    console.log('ONNX Runtime initialized');
  } catch (error) {
    console.error('Failed to initialize ONNX:', error);
  }
};

const getTransformers = async () => {
  if (!transformersModule) {
    // Initialize ONNX first
    if (!isInitialized) {
      await initializeONNX();
      isInitialized = true;
    }
    
    transformersModule = await import('@xenova/transformers');
    
    // Configure transformers environment
    if (transformersModule.env) {
      transformersModule.env.allowRemoteModels = true;
      transformersModule.env.allowLocalModels = false;
    }
  }
  return transformersModule;
};

let generator: any = null;
let currentModelId: string | null = null;

export interface GenerateOptions {
  temperature?: number;
  max_new_tokens?: number;
  do_sample?: boolean;
}

export const loadModel = async (
  modelId: string,
  onProgress?: (progress: number) => void
): Promise<void> => {
  if (currentModelId === modelId && generator) {
    console.log('Model already loaded:', modelId);
    return;
  }

  try {
    console.log('Starting to load model:', modelId);
    
    const { pipeline } = await getTransformers();
    
    generator = await pipeline('text-generation', modelId, {
      progress_callback: (progress: any) => {
        console.log('Download progress:', progress);
        
        if (progress.status === 'progress' && progress.progress !== undefined && onProgress) {
          onProgress(progress.progress);
        } else if (progress.status === 'done' && onProgress) {
          onProgress(1.0);
        }
      }
    });
    
    currentModelId = modelId;
    console.log('Model loaded successfully:', modelId);
  } catch (error) {
    console.error('Failed to load model:', error);
    generator = null;
    currentModelId = null;
    throw new Error(`Failed to load model: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const generateText = async (
  prompt: string,
  options: GenerateOptions = {},
  onToken?: (token: string) => void
): Promise<string> => {
  if (!generator) {
    throw new Error('Model not loaded. Please select and download a model first.');
  }

  try {
    console.log('Generating text with prompt:', prompt.substring(0, 100) + '...');
    
    const result = await generator(prompt, {
      temperature: options.temperature ?? 0.7,
      max_new_tokens: options.max_new_tokens ?? 256,
      do_sample: options.do_sample ?? true,
      return_full_text: false,
      callback_function: onToken ? (output: any) => {
        if (output && output.length > 0 && output[0].token) {
          onToken(output[0].token.text);
        }
      } : undefined
    });

    console.log('Generation result:', result);

    if (Array.isArray(result) && result[0]?.generated_text) {
      return result[0].generated_text;
    }

    if (typeof result === 'object' && result !== null && 'generated_text' in result) {
      return (result as any).generated_text;
    }

    throw new Error('Unexpected response format from model');
  } catch (error) {
    console.error('Generation error:', error);
    throw new Error(`Failed to generate text: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const isModelLoaded = (): boolean => {
  return generator !== null;
};

export const getCurrentModelId = (): string | null => {
  return currentModelId;
};
