import React, { useState, useRef } from 'react';
import { generateImageFromPrompt } from '../pages/services/geminiService';
import type { Series } from '../types';

interface VideoGeneratorProps {
    onGenerate: (prompt: string, imageFile: File | null, seriesId: string | null, quality: string, aspectRatio: string) => void;
    isLoading: boolean;
    seriesList: Series[];
}

const samplePrompts = [
    "A time-lapse of a futuristic city being built on Mars.",
    "A tiny fox discovering a magical, glowing mushroom in an enchanted forest at night.",
    "An astronaut playing a guitar while floating in space, with Earth in the background.",
    "A cinematic shot of a majestic eagle soaring through a dramatic thunderstorm.",
    "A steampunk-style library where books fly on their own to the readers.",
    "A close-up of a hummingbird's wings in ultra slow-motion, showing iridescent colors.",
    "A neon-lit cyberpunk alleyway on a rainy night, with flying cars passing by.",
    "A cat wearing a tiny chef's hat, comically trying to bake a cake.",
    "A beautiful coral reef teeming with bioluminescent fish and sea creatures.",
    "A robot gracefully tending to a serene Japanese zen garden.",
];

// Helper to convert a base64 string to a File object
const base64ToFile = (base64: string, filename: string, mimeType: string = 'image/png'): File => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    return new File([blob], filename, { type: mimeType });
};


const VideoGenerator: React.FC<VideoGeneratorProps> = ({ onGenerate, isLoading, seriesList }) => {
    const [prompt, setPrompt] = useState('');
    const [selectedSeriesId, setSelectedSeriesId] = useState('');
    const [quality, setQuality] = useState('High Definition');
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [imageError, setImageError] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
             if (file.size > 4 * 1024 * 1024) { // 4MB limit
                setImageError("Image size exceeds 4MB. Please choose a smaller file.");
                return;
            }
            setImageError(null);
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setImageError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim()) {
            onGenerate(prompt, imageFile, selectedSeriesId || null, quality, aspectRatio);
        }
    };

    const generateImage = async (promptToUse: string) => {
        if (!promptToUse.trim()) {
            setImageError("Please enter a prompt to generate an image.");
            return;
        }
        setIsGeneratingImage(true);
        setImageError(null);
        handleRemoveImage();
        try {
            const base64Image = await generateImageFromPrompt(promptToUse);
            const fileName = `${promptToUse.substring(0, 20).replace(/\s/g, '_')}_${Date.now()}.png`;
            const file = base64ToFile(base64Image, fileName, 'image/png');
            
            if (file.size > 4 * 1024 * 1024) { 
                setImageError("Generated image is too large (> 4MB). Please try a different prompt.");
                return;
            }

            setImageFile(file);
            setImagePreview(`data:image/png;base64,${base64Image}`);
        } catch (err: any) {
            setImageError(err.message || "Failed to generate image.");
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const handleGenerateImageClick = async () => {
        await generateImage(prompt);
    };

    const handleInspireMeClick = () => {
        const randomPrompt = samplePrompts[Math.floor(Math.random() * samplePrompts.length)];
        setPrompt(randomPrompt);
        handleRemoveImage(); // Also clear the image when getting a new prompt
    };

    const hasSeries = seriesList && seriesList.length > 0;

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {hasSeries && (
                     <div>
                        <label htmlFor="seriesTitle" className="block text-sm font-medium text-gray-300 mb-2">Assign to Series</label>
                        <select
                            id="seriesTitle"
                            value={selectedSeriesId}
                            onChange={(e) => setSelectedSeriesId(e.target.value)}
                            className="w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300 text-white placeholder-gray-500"
                            disabled={isLoading || isGeneratingImage}
                        >
                            <option value="">No series</option>
                            {seriesList.map(series => (
                                <option key={series.id} value={series.id}>{series.title}</option>
                            ))}
                        </select>
                    </div>
                )}
                 <div className={!hasSeries ? 'md:col-start-2' : ''}>
                    <label htmlFor="quality" className="block text-sm font-medium text-gray-300 mb-2">Video Quality</label>
                    <select id="quality" value={quality} onChange={e => setQuality(e.target.value)} disabled={isLoading || isGeneratingImage} className="w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300 text-white">
                        <option>High Definition</option>
                        <option>Standard</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="aspectRatio" className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
                    <select id="aspectRatio" value={aspectRatio} onChange={e => setAspectRatio(e.target.value)} disabled={isLoading || isGeneratingImage} className="w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300 text-white">
                        <option value="16:9">16:9 (Widescreen)</option>
                        <option value="9:16">9:16 (Vertical)</option>
                        <option value="1:1">1:1 (Square)</option>
                    </select>
                </div>
            </div>
           
            <div className="flex flex-col md:flex-row gap-6">
                {/* Left side: Image Upload */}
                <div className="flex-shrink-0 w-full md:w-56">
                     <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        className="hidden"
                        accept="image/png, image/jpeg, image/webp"
                        disabled={isLoading || isGeneratingImage}
                    />
                    {imagePreview ? (
                        <div className="relative group w-full h-36 md:h-full">
                             <img src={imagePreview} alt="Image preview" className="w-full h-full object-cover rounded-lg border-2 border-gray-700"/>
                             <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100"
                                aria-label="Remove image"
                                disabled={isLoading || isGeneratingImage}
                             >
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                             </button>
                        </div>
                    ) : (
                        <div className="w-full h-36 md:h-full p-2 flex flex-col items-center justify-center text-sm border-2 border-dashed border-gray-700 bg-gray-900/50 rounded-lg">
                           {isGeneratingImage ? (
                                <>
                                    <div className="w-8 h-8 border-2 border-dashed rounded-full animate-spin border-indigo-400"></div>
                                    <p className="mt-2 text-xs text-gray-400">AI is creating your image...</p>
                                </>
                            ) : (
                                <div className="w-full flex flex-col items-center space-y-2 text-center">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isLoading || isGeneratingImage}
                                        className="w-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-md p-2 transition-colors text-white font-semibold text-xs"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                        Upload Image
                                    </button>
                                    <span className="text-gray-500 text-xs">OR</span>
                                    <button
                                        type="button"
                                        onClick={handleGenerateImageClick}
                                        disabled={isLoading || isGeneratingImage || !prompt.trim()}
                                        className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md p-2 transition-colors text-white font-semibold text-xs"
                                        aria-label="Generate an image with AI based on the prompt"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                        </svg>
                                        Generate with AI
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                     {imageError && <p className="text-red-400 text-xs mt-1 text-center">{imageError}</p>}
                </div>

                {/* Right side: Prompt */}
                <div className="flex-grow flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <label htmlFor="prompt" className="font-semibold text-gray-300">
                             {selectedSeriesId ? 'Episode Topic' : 'Enter your video prompt'}
                        </label>
                        <button
                            type="button"
                            onClick={handleInspireMeClick}
                            disabled={isLoading || isGeneratingImage}
                            className="flex items-center text-sm bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-full transition-colors duration-300 disabled:opacity-50"
                            aria-label="Suggest a random prompt"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            Inspire Me
                        </button>
                    </div>
                    <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A cinematic shot of a robot surfing on a holographic wave"
                        className="w-full flex-grow p-4 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300 text-white resize-none text-base placeholder-gray-500"
                        disabled={isLoading || isGeneratingImage}
                        rows={6}
                    ></textarea>
                </div>
            </div>
             <button
                type="submit"
                disabled={isLoading || isGeneratingImage || !prompt.trim()}
                className="w-full mt-6 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg"
            >
                {isLoading ? 'Generating Video...' : isGeneratingImage ? 'Generating Image...' : 'Generate Video'}
                {(!isLoading && !isGeneratingImage) && (
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                )}
            </button>
        </form>
    );
};

export default VideoGenerator;