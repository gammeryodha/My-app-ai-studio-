import React, { useState, useRef, useEffect } from 'react';
import type { VideoData } from '../types';
import Loader from './Loader';

interface Clip {
  id: number;
  start: number;
  end: number;
}

interface VideoEditorProps {
  originalVideo: VideoData;
  onComplete: (editedVideo: VideoData) => void;
  onSkip: () => void;
}

const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00.0';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    const ms = Math.floor((seconds - Math.floor(seconds)) * 10);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${ms}`;
};

const VideoEditor: React.FC<VideoEditorProps> = ({ originalVideo, onComplete, onSkip }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);
    
    const [clips, setClips] = useState<Clip[]>([]);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [endTime, setEndTime] = useState<number | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMerging, setIsMerging] = useState(false);
    
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const onLoadedMetadata = () => setDuration(video.duration);
        const onTimeUpdate = () => setCurrentTime(video.currentTime);

        video.addEventListener('loadedmetadata', onLoadedMetadata);
        video.addEventListener('timeupdate', onTimeUpdate);

        return () => {
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('timeupdate', onTimeUpdate);
        };
    }, []);

    const handleSetStart = () => videoRef.current && setStartTime(videoRef.current.currentTime);
    const handleSetEnd = () => videoRef.current && setEndTime(videoRef.current.currentTime);
    
    const handleAddClip = () => {
        const start = startTime ?? 0;
        const end = endTime ?? duration;
        if (start >= end) {
            alert("Start time must be before end time.");
            return;
        }
        const newClip: Clip = { id: Date.now(), start, end };
        setClips([...clips, newClip]);
        setStartTime(null);
        setEndTime(null);
    };

    const handleDeleteClip = (id: number) => {
        setClips(clips.filter(clip => clip.id !== id));
    };

    const handleDragSort = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        
        const clipsCopy = [...clips];
        const draggedItemIndex = clips.findIndex(c => c.id === dragItem.current);
        const dragOverItemIndex = clips.findIndex(c => c.id === dragOverItem.current);
        
        const [reorderedItem] = clipsCopy.splice(draggedItemIndex, 1);
        clipsCopy.splice(dragOverItemIndex, 0, reorderedItem);
        
        dragItem.current = null;
        dragOverItem.current = null;
        setClips(clipsCopy);
    };

    const handleMerge = async () => {
        setIsMerging(true);
        const videoNode = videoRef.current;
        const canvasNode = canvasRef.current;
        
        if (!videoNode || !canvasNode || clips.length === 0) {
            alert("Please create at least one clip to merge.");
            setIsMerging(false);
            return;
        }

        canvasNode.width = videoNode.videoWidth;
        canvasNode.height = videoNode.videoHeight;
        const ctx = canvasNode.getContext('2d', { alpha: false });
        if (!ctx) {
             alert("Could not create canvas context for rendering.");
             setIsMerging(false);
             return;
        }

        const stream = canvasNode.captureStream(30); // 30 FPS
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        const recordedChunks: Blob[] = [];

        recorder.ondataavailable = e => e.data.size > 0 && recordedChunks.push(e.data);

        recorder.onstop = () => {
            const finalBlob = new Blob(recordedChunks, { type: 'video/webm' });
            const finalUrl = URL.createObjectURL(finalBlob);
            onComplete({ blob: finalBlob, url: finalUrl });
            setIsMerging(false);
        };
        
        videoNode.pause();
        videoNode.muted = true;
        recorder.start();

        for (const clip of clips) {
            await new Promise<void>(resolve => {
                let frameHandler: number;
                
                const onSeeked = () => {
                    if (videoNode.currentTime < clip.end) {
                        ctx.drawImage(videoNode, 0, 0, canvasNode.width, canvasNode.height);
                        // Advance frame by seeking. 1/30 for 30fps.
                        videoNode.currentTime += (1/30); 
                    } else {
                        videoNode.removeEventListener('seeked', onSeeked);
                        resolve();
                    }
                };

                videoNode.addEventListener('seeked', onSeeked);
                videoNode.currentTime = clip.start;
            });
        }
        
        recorder.stop();
        videoNode.muted = false;
    };

    if (isMerging) {
        return <Loader message="Merging clips... This may take a moment." />;
    }

    return (
        <div className="w-full max-w-3xl bg-gray-900/70 p-6 rounded-lg border border-gray-700 mt-6">
            <h3 className="text-2xl font-bold mb-6 text-center text-indigo-300">Edit Your Video</h3>
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
            <div className="space-y-4">
                <input
                    type="range"
                    min="0"
                    max={duration}
                    value={currentTime}
                    onChange={e => { if(videoRef.current) videoRef.current.currentTime = parseFloat(e.target.value)}}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between items-center text-sm font-mono text-gray-400">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                     <button onClick={handleSetStart} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">Set Start {startTime !== null && `(${formatTime(startTime)})`}</button>
                     <button onClick={handleSetEnd} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">Set End {endTime !== null && `(${formatTime(endTime)})`}</button>
                     <button onClick={handleAddClip} disabled={startTime === null || endTime === null || startTime >= endTime} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors">Add Clip</button>
                </div>
                <div className="min-h-[6rem] bg-gray-800/50 p-2 rounded-lg border border-gray-700">
                    <h4 className="text-sm font-semibold mb-2 text-gray-400">Your Clips (Drag to reorder):</h4>
                    {clips.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                           {clips.map((clip, index) => (
                                <div key={clip.id} 
                                    draggable 
                                    onDragStart={() => dragItem.current = clip.id}
                                    onDragEnter={() => dragOverItem.current = clip.id}
                                    onDragEnd={handleDragSort}
                                    onDragOver={e => e.preventDefault()}
                                    className="flex items-center gap-2 bg-gray-700 p-2 rounded-md text-sm cursor-grab active:cursor-grabbing"
                                >
                                    <span className="font-mono text-white">[{index + 1}] {formatTime(clip.start)} → {formatTime(clip.end)}</span>
                                    <button onClick={() => handleDeleteClip(clip.id)} className="text-red-400 hover:text-red-300">&times;</button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center text-sm p-4">No clips added yet.</p>
                    )}
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                     <button onClick={onSkip} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors">Skip to Upload</button>
                     <button onClick={handleMerge} disabled={clips.length === 0} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all">Merge Clips &amp; Continue</button>
                </div>
            </div>
            <video ref={videoRef} src={originalVideo.url} className="hidden"></video>
        </div>
    );
};

export default VideoEditor;
