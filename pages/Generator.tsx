import React, { useState } from 'react';

import type { UserProfile, VideoData, Series, Video } from '../types';
import { generateVideoFromPrompt } from './services/geminiService';

import VideoGenerator from '../components/VideoGenerator';
import VideoEditor from '../components/VideoEditor';
import Loader from '../components/Loader';
import Features from '../components/Features';
import YouTubeUploader from '../components/YouTubeUploader';
import YouTubeConnect from '../components/YouTubeConnect';

interface GeneratorProps {
    user: UserProfile | null;
    seriesList: Series[];
    setSeriesList: React.Dispatch<React.SetStateAction<Series[]>>;
    accessToken: string | null;
    requestGoogleAuth: () => void;
    onGoogleDisconnect: () => void;
}

interface GeneratedInfo {
    videoData: VideoData;
    prompt: string;
    seriesId: string | null;
}

const Generator: React.FC<GeneratorProps> = ({ user, seriesList, setSeriesList, accessToken, requestGoogleAuth, onGoogleDisconnect }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [generatedInfo, setGeneratedInfo] = useState<GeneratedInfo | null>(null);
    const [editedVideo, setEditedVideo] = useState<VideoData | null>(null);
    const [showEditor, setShowEditor] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadingMessages = [
        "Warming up the AI's creative circuits...",
        "Teaching pixels to dance...",
        "Translating your vision into light and motion...",
        "The AI is dreaming up your video...",
        "Composing the final cut...",
        "Almost there, adding the final touches...",
    ];

    const handleGenerateVideo = async (prompt: string, imageFile: File | null, seriesId: string | null, quality: string, aspectRatio: string) => {
        setIsLoading(true);
        setError(null);
        setGeneratedInfo(null);
        setEditedVideo(null);

        let messageIndex = 0;
        setLoadingMessage(loadingMessages[messageIndex]);
        const intervalId = setInterval(() => {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            setLoadingMessage(loadingMessages[messageIndex]);
        }, 3000);

        try {
            const series = seriesId ? seriesList.find(s => s.id === seriesId) : null;
            const seriesTitle = series ? series.title : null;

            const finalPrompt = seriesTitle
                ? `Create a short video for a series titled "${seriesTitle}". The topic for this episode is: "${prompt}". Make it engaging for a YouTube audience.`
                : prompt;
            
            const result = await generateVideoFromPrompt(finalPrompt, imageFile, quality, aspectRatio);
            
            if (seriesId && series) {
                const newVideo: Video = {
                    id: `video_${Date.now()}`,
                    prompt: prompt,
                    description: seriesTitle 
                        ? `An episode from the "${seriesTitle}" series about "${prompt}".\n\nGenerated with AI Video Forge!` 
                        : `A video about "${prompt}".\n\nGenerated with AI Video Forge!`,
                    createdAt: new Date().toISOString()
                };

                setSeriesList(prevList => 
                    prevList.map(s => 
                        s.id === seriesId 
                        ? { ...s, videos: [...(s.videos || []), newVideo] } 
                        : s
                    )
                );
            }

            setGeneratedInfo({ videoData: result, prompt, seriesId });
            setShowEditor(true);

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An unknown error occurred during video generation.');
        } finally {
            clearInterval(intervalId);
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    const resetGenerator = () => {
        setGeneratedInfo(null);
        setEditedVideo(null);
        setShowEditor(false);
        setError(null);
    }
    
    const finalVideoData = editedVideo || generatedInfo?.videoData;

    return (
        <div className="w-full max-w-5xl mx-auto">
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl shadow-2xl shadow-indigo-500/10 p-6 md:p-10 border border-gray-800">
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-indigo-500">
                        AI Video Forge
                    </h1>
                    <p className="text-gray-400 mt-3 text-lg">Bring your ideas to life. Generate, edit, and upload videos with AI.</p>
                </div>

                {error && (
                    <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg mb-6 text-center">
                        <span className="font-semibold">Error:</span> {error}
                    </div>
                )}
                
                {isLoading ? (
                    <Loader message={loadingMessage} />
                ) : generatedInfo ? (
                    <div className="flex flex-col items-center">
                        <video key={finalVideoData?.url} src={finalVideoData?.url} controls className="w-full max-w-3xl rounded-lg shadow-lg mb-6 border-2 border-indigo-500/50"></video>
                        
                        {showEditor ? (
                            <VideoEditor 
                                originalVideo={generatedInfo.videoData}
                                onComplete={(newVideo) => {
                                    setEditedVideo(newVideo);
                                    setShowEditor(false);
                                }}
                                onSkip={() => setShowEditor(false)}
                            />
                        ) : user && finalVideoData?.blob ? (
                             !accessToken ? (
                                <div className="w-full max-w-3xl bg-yellow-900/50 p-6 rounded-lg border border-yellow-700 mt-6 text-center">
                                    <h3 className="text-xl font-bold mb-2 text-yellow-200">Connect to YouTube to Upload</h3>
                                    <p className="text-yellow-300">Please connect your Google account using the button at the top of the page to enable video uploads.</p>
                                </div>
                            ) : (
                                <YouTubeUploader
                                    videoBlob={finalVideoData.blob}
                                    accessToken={accessToken}
                                    initialPrompt={generatedInfo.prompt}
                                    seriesTitle={
                                        generatedInfo.seriesId 
                                        ? seriesList.find(s => s.id === generatedInfo.seriesId)?.title || null 
                                        : null
                                    }
                                />
                            )
                        ) : null}

                        <button
                            onClick={resetGenerator}
                            className="mt-8 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-5 rounded-lg transition-colors"
                        >
                            Generate Another Video
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className="mb-10">
                            <YouTubeConnect
                                accessToken={accessToken}
                                requestGoogleAuth={requestGoogleAuth}
                                onDisconnect={onGoogleDisconnect}
                            />
                        </div>
                        <Features />
                        <VideoGenerator onGenerate={handleGenerateVideo} isLoading={isLoading} seriesList={seriesList} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Generator;