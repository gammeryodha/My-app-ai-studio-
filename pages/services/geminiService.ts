
import { GoogleGenAI } from "@google/genai";
import type { VideoData } from '../../types';
import { API_KEY } from "../../constants";

// Helper to parse Gemini API errors which may be nested
const parseGeminiError = (error: any): string => {
    console.error("Raw Gemini Error:", error);
    // The actual error from the API might be a JSON string inside the error's message property
    try {
        const errorString = error.message || JSON.stringify(error);
        // A more robust regex to find JSON within a string
        const match = errorString.match(/\{[\s\S]*\}/);
        if (match) {
            const jsonError = JSON.parse(match[0]);
            if (jsonError.error?.message) {
                 if (jsonError.error.status === 'RESOURCE_EXHAUSTED') {
                    return "You have exceeded your request limit for the AI service. Please check your plan and billing details, or try again later.";
                }
                return `AI Service Error: ${jsonError.error.message}`;
            }
        }
    } catch (e) {
        // Not a JSON error or failed to parse, fall through to default message
    }
    // Return the original message if it's not a complex object
    if (typeof error.message === 'string' && !error.message.includes('{')) {
        return error.message;
    }
    return "An unknown error occurred while communicating with the AI service.";
};


async function pollVideoOperation(operation: any, ai: GoogleGenAI): Promise<any> {
    let currentOperation = operation;
    let retries = 0;
    const maxRetries = 7;
    const baseDelay = 5000; // 5 seconds
    const maxDelay = 60000; // 60 seconds

    while (!currentOperation.done) {
        // Initial delay before every check.
        await new Promise(resolve => setTimeout(resolve, baseDelay));
        
        try {
            currentOperation = await ai.operations.getVideosOperation({ operation: currentOperation });
            retries = 0; // Reset retries on successful poll
        } catch (error: any) {
            console.warn("Polling error, checking for retry...", error.message);
            // Check for rate limit error (429)
            if (error.message && (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED'))) {
                retries++;
                if (retries > maxRetries) {
                    throw new Error("The AI service is currently experiencing high demand. Please try again in a few minutes.");
                }

                const backoffTime = Math.min(maxDelay, baseDelay * (2 ** retries)) + (Math.random() * 1000);
                console.warn(`Rate limit hit. Waiting ${Math.round(backoffTime / 1000)}s before next retry. (Attempt ${retries}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, backoffTime));
                // The loop will continue, and we'll retry the `getVideosOperation` call.
            } else {
                // For other errors, fail fast.
                throw new Error(parseGeminiError(error));
            }
        }
    }
    return currentOperation;
}

// Helper to convert File to base64 string
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // The result is "data:mime/type;base64,the-base-64-string".
            // We need to remove the prefix part.
            const result = reader.result as string;
            resolve(result.split(',')[1]);
        };
        reader.onerror = (error) => reject(error);
    });
};

export const generateImageFromPrompt = async (prompt: string): Promise<string> => {
    if (!API_KEY) {
        throw new Error("Gemini API key is not configured in constants.ts.");
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
        const enhancedPrompt = `A vibrant, high-resolution, photorealistic, cinematic 16:9 image suitable for a YouTube video. The image should visually represent the following concept with dramatic lighting: "${prompt}"`;
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: enhancedPrompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: '16:9',
            },
        });

        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        if (!base64ImageBytes) {
            throw new Error("Image generation succeeded but no image data was returned.");
        }
        return base64ImageBytes;

    } catch (error: any) {
        throw new Error(parseGeminiError(error));
    }
};

export const generateVideoFromPrompt = async (prompt: string, imageFile: File | null, quality: string, aspectRatio: string): Promise<VideoData> => {
    if (!API_KEY) {
        throw new Error("Gemini API key is not configured in constants.ts.");
    }
    
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
        const finalPrompt = `Create a ${quality} quality, ${aspectRatio} aspect ratio video of the following scene: ${prompt}`;

        const requestPayload: {
            model: string;
            prompt: string;
            image?: { imageBytes: string; mimeType: string; };
            config: { numberOfVideos: number; };
        } = {
            model: 'veo-2.0-generate-001',
            prompt: finalPrompt,
            config: {
                numberOfVideos: 1
            }
        };

        if (imageFile) {
            const base64Image = await fileToBase64(imageFile);
            requestPayload.image = {
                imageBytes: base64Image,
                mimeType: imageFile.type,
            };
        }

        let initialOperation = await ai.models.generateVideos(requestPayload);

        const completedOperation = await pollVideoOperation(initialOperation, ai);
        
        const downloadLink = completedOperation.response?.generatedVideos?.[0]?.video?.uri;

        if (!downloadLink) {
            throw new Error("Video generation succeeded but no download link was found.");
        }

        const videoResponse = await fetch(`${downloadLink}&key=${API_KEY}`);

        if (!videoResponse.ok) {
            const errorText = await videoResponse.text();
            throw new Error(`Failed to download video file. Status: ${videoResponse.status}. Details: ${errorText}`);
        }

        const blob = await videoResponse.blob();
        
        return {
            url: URL.createObjectURL(blob),
            blob: blob,
        };

    } catch (error: any) {
        throw new Error(parseGeminiError(error));
    }
};