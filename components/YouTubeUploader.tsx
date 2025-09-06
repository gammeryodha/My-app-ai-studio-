

import React, { useState } from 'react';
import { uploadVideoToYouTube } from '../pages/services/youtubeService';

interface YouTubeUploaderProps {
    videoBlob: Blob | null;
    accessToken: string | null;
    initialPrompt: string;
    seriesTitle: string | null;
}

const YOUTUBE_CATEGORIES = [
    { id: '28', title: 'Science & Technology' },
    { id: '1', title: 'Film & Animation' },
    { id: '2', title: 'Autos & Vehicles' },
    { id: '10', title: 'Music' },
    { id: '15', title: 'Pets & Animals' },
    { id: '17', title: 'Sports' },
    { id: '19', title: 'Travel & Events' },
    { id: '20', title: 'Gaming' },
    { id: '22', title: 'People & Blogs' },
    { id: '23', title: 'Comedy' },
    { id: '24', title: 'Entertainment' },
    { id: '25', title: 'News & Politics' },
    { id: '26', title: 'Howto & Style' },
    { id: '27', title: 'Education' },
    { id: '29', title: 'Nonprofits & Activism' },
];


const YouTubeUploader: React.FC<YouTubeUploaderProps> = ({ videoBlob, accessToken, initialPrompt, seriesTitle }) => {
    const [title, setTitle] = useState(seriesTitle ? `${seriesTitle}: ${initialPrompt}` : initialPrompt);
    const [description, setDescription] = useState(
        seriesTitle 
            ? `An episode from the "${seriesTitle}" series.\n\nGenerated with AI Video Forge!` 
            : 'Generated with AI Video Forge!'
    );
    const [privacyStatus, setPrivacyStatus] = useState<'private' | 'public' | 'unlisted'>('private');
    const [userPrivacyChoice, setUserPrivacyChoice] = useState<'private' | 'public' | 'unlisted'>('private');
    const [scheduleTime, setScheduleTime] = useState('');
    const [categoryId, setCategoryId] = useState('28'); // Default to Science & Technology

    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [videoId, setVideoId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const getMinScheduleTime = () => {
        const now = new Date();
        // Add 15 minutes buffer for processing
        now.setMinutes(now.getMinutes() + 15);
        const timezoneOffset = now.getTimezoneOffset() * 60000;
        const localTime = new Date(now.getTime() - timezoneOffset);
        return localTime.toISOString().slice(0, 16);
    };
    
    const handlePrivacyChange = (newStatus: 'private' | 'public' | 'unlisted') => {
        setPrivacyStatus(newStatus);
        setUserPrivacyChoice(newStatus);
    };

    const handleScheduleTimeChange = (newTime: string) => {
        setScheduleTime(newTime);
        if (newTime) {
            // A scheduled video must be private until it goes live.
            setPrivacyStatus('private');
        } else {
            // When scheduling is removed, restore the user's original privacy choice.
            setPrivacyStatus(userPrivacyChoice);
        }
    };

    const handleUpload = async () => {
        if (!videoBlob || !accessToken || !title.trim()) {
            setError('Missing video, access token, or title.');
            return;
        }

        if (scheduleTime && new Date(scheduleTime) < new Date(getMinScheduleTime())) {
            setError('Scheduled time must be at least 15 minutes in the future.');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        setUploadStatus(null);
        setError(null);

        try {
            const metadata = {
                title,
                description,
                privacyStatus,
                publishAt: scheduleTime ? new Date(scheduleTime).toISOString() : undefined,
                tags: ['AI Generated', 'Gemini', 'VEO', ...(seriesTitle ? [seriesTitle.replace(/\s+/g, '')] : [])],
                categoryId: categoryId,
            };
            const onStatusUpdate = (message: string) => {
                setUploadStatus(message); // Display retry messages to the user
            };

            const newVideoId = await uploadVideoToYouTube(videoBlob, metadata, accessToken, setUploadProgress, onStatusUpdate);

            setVideoId(newVideoId);
            let successMessage = `Upload successful!`;
            if (scheduleTime) {
                successMessage += ` It's scheduled to go public on ${new Date(scheduleTime).toLocaleString()}.`;
            }
            setUploadStatus(successMessage);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred during upload.');
            setUploadStatus(null);
        } finally {
            setIsUploading(false);
        }
    };
    
    return (
        <div className="w-full max-w-3xl bg-gray-900/70 p-6 rounded-lg border border-gray-700 mt-6">
            <h3 className="text-2xl font-bold mb-6 text-center text-indigo-300">Upload to YouTube</h3>
            
            {videoId && uploadStatus ? (
                 <div className="bg-green-900/50 border border-green-700 text-green-300 p-4 rounded-lg mb-4 text-center">
                    <div className="flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="font-semibold">{uploadStatus}</p>
                    </div>
                    <a 
                        href={`https://studio.youtube.com/video/${videoId}/edit`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block bg-gray-200 hover:bg-white text-gray-900 font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        Edit in YouTube Studio
                    </a>
                </div>
            ) : (
                <div className="space-y-4">
                    {error && (
                        <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-lg text-center text-sm">
                            <span className="font-semibold">Error:</span> {error}
                        </div>
                    )}
                     {uploadStatus && !isUploading && (
                        <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-300 p-3 rounded-lg text-center text-sm">
                           {uploadStatus}
                        </div>
                    )}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-400">Title</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isUploading}
                            className="mt-1 block w-full bg-gray-800 border-2 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-400">Description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isUploading}
                            rows={4}
                            className="mt-1 block w-full bg-gray-800 border-2 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-400">Category</label>
                            <select
                                id="category"
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                disabled={isUploading}
                                className="mt-1 block w-full bg-gray-800 border-2 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                {YOUTUBE_CATEGORIES.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.title}</option>
                                ))}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="privacy" className="block text-sm font-medium text-gray-400">Visibility</label>
                            <select
                                id="privacy"
                                value={privacyStatus}
                                onChange={(e) => handlePrivacyChange(e.target.value as any)}
                                disabled={isUploading || !!scheduleTime}
                                className="mt-1 block w-full bg-gray-800 border-2 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="private">Private</option>
                                <option value="unlisted">Unlisted</option>
                                <option value="public">Public</option>
                            </select>
                            {!!scheduleTime && <p className="text-xs text-gray-500 mt-1">Scheduled videos must be Private until they go live.</p>}
                        </div>
                    </div>
                     <div className="grid grid-cols-1">
                        <div>
                            <label htmlFor="schedule" className="block text-sm font-medium text-gray-400">Schedule (Optional)</label>
                            <input
                                type="datetime-local"
                                id="schedule"
                                value={scheduleTime}
                                onChange={(e) => handleScheduleTimeChange(e.target.value)}
                                min={getMinScheduleTime()}
                                disabled={isUploading}
                                className="mt-1 block w-full bg-gray-800 border-2 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 [color-scheme:dark]"
                            />
                        </div>
                    </div>
                    
                    {isUploading && (
                         <div className="pt-2">
                             {uploadStatus && <p className="text-center text-sm text-yellow-400 mb-2">{uploadStatus}</p>}
                            <div className="relative w-full bg-gray-700 rounded-full h-6 border-2 border-gray-600 overflow-hidden shadow-inner">
                                <div 
                                    className="absolute top-0 left-0 bg-gradient-to-r from-purple-500 to-indigo-600 h-full transition-all duration-300 ease-out"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                                <div className="relative h-full flex items-center justify-center">
                                    <span className="font-bold text-white text-sm" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
                                        {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Processing on YouTube...'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="text-center pt-2">
                        <button
                            onClick={handleUpload}
                            disabled={isUploading || !title.trim()}
                            className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg"
                        >
                             {isUploading ? 'Uploading...' : 'Upload Now'}
                             {!isUploading && (
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                </svg>
                             )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default YouTubeUploader;