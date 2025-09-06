
import React, { useState, useRef } from 'react';
import type { Series, Video } from '../types';

interface SeriesPageProps {
    seriesList: Series[];
    setSeriesList: React.Dispatch<React.SetStateAction<Series[]>>;
}

const SeriesPage: React.FC<SeriesPageProps> = ({ seriesList, setSeriesList }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [expandedSeriesId, setExpandedSeriesId] = useState<string | null>(null);
    const [editingVideo, setEditingVideo] = useState<{ seriesId: string; videoId: string } | null>(null);
    const [editingText, setEditingText] = useState('');

    // Drag and Drop state
    const dragItem = useRef<string | null>(null);
    const dragOverItem = useRef<string | null>(null);


    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            const newSeries: Series = {
                id: `series_${Date.now()}`,
                title: title.trim(),
                description: description.trim(),
                videos: [],
            };
            setSeriesList(prev => [...prev, newSeries]);
            setTitle('');
            setDescription('');
        }
    };

    const handleDeleteSeries = (id: string) => {
        if (window.confirm("Are you sure you want to delete this entire series and all its video entries?")) {
            setSeriesList(prev => prev.filter(series => series.id !== id));
        }
    };
    
    const toggleExpand = (seriesId: string) => {
        setExpandedSeriesId(expandedSeriesId === seriesId ? null : seriesId);
    };

    const handleEditVideoClick = (seriesId: string, video: Video) => {
        setEditingVideo({ seriesId, videoId: video.id });
        setEditingText(video.description);
    };

    const handleCancelEdit = () => {
        setEditingVideo(null);
        setEditingText('');
    };

    const handleSaveEdit = () => {
        if (!editingVideo) return;
        setSeriesList(prevList => prevList.map(series => {
            if (series.id === editingVideo.seriesId) {
                return {
                    ...series,
                    videos: series.videos.map(video => 
                        video.id === editingVideo.videoId 
                        ? { ...video, description: editingText }
                        : video
                    )
                };
            }
            return series;
        }));
        handleCancelEdit();
    };

    const handleDeleteVideo = (seriesId: string, videoId: string) => {
        if (window.confirm("Are you sure you want to delete this video entry?")) {
             setSeriesList(prevList => prevList.map(series => {
                if (series.id === seriesId) {
                    return {
                        ...series,
                        videos: series.videos.filter(video => video.id !== videoId)
                    };
                }
                return series;
            }));
        }
    };

    const handleDragSort = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;

        const seriesListCopy = [...seriesList];
        const draggedItemIndex = seriesList.findIndex(s => s.id === dragItem.current);
        const dragOverItemIndex = seriesList.findIndex(s => s.id === dragOverItem.current);
        
        // Remove and re-insert item
        const [reorderedItem] = seriesListCopy.splice(draggedItemIndex, 1);
        seriesListCopy.splice(dragOverItemIndex, 0, reorderedItem);
        
        // Reset refs
        dragItem.current = null;
        dragOverItem.current = null;

        setSeriesList(seriesListCopy);
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-10">
            {/* Create Series Section */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl shadow-2xl shadow-indigo-500/10 p-6 md:p-8 border border-gray-800">
                <h2 className="text-3xl font-bold mb-6 text-indigo-300">Create a New Series</h2>
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="series-title" className="block text-sm font-medium text-gray-300">Title (Required)</label>
                        <input
                            type="text"
                            id="series-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="mt-1 block w-full bg-gray-800 border-2 border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            placeholder="e.g., Weekly AI Discoveries"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="series-description" className="block text-sm font-medium text-gray-300">Description</label>
                        <textarea
                            id="series-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="mt-1 block w-full bg-gray-800 border-2 border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-colors"
                            placeholder="A short summary of what this series is about."
                        ></textarea>
                    </div>
                     <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:opacity-50 transition-all"
                    >
                        Create Series
                    </button>
                </form>
            </div>

            {/* Existing Series Section */}
             <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl shadow-2xl shadow-indigo-500/10 p-6 md:p-8 border border-gray-800">
                <h2 className="text-3xl font-bold mb-6 text-indigo-300">Your Series</h2>
                {seriesList.length > 0 ? (
                    <div className="space-y-4">
                        {seriesList.map(series => (
                            <div key={series.id} 
                                className="bg-gray-800/70 rounded-lg border border-gray-700 transition-shadow duration-300"
                                draggable
                                onDragStart={() => dragItem.current = series.id}
                                onDragEnter={() => dragOverItem.current = series.id}
                                onDragEnd={handleDragSort}
                                onDragOver={(e) => e.preventDefault()}
                            >
                                <div className="p-4 flex justify-between items-center cursor-pointer" >
                                    <div className="flex-grow" onClick={() => toggleExpand(series.id)}>
                                        <div className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-3 transition-transform ${expandedSeriesId === series.id ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <div>
                                                <h3 className="font-bold text-lg text-white">{series.title}</h3>
                                                <p className="text-gray-400 text-sm mt-1">{series.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteSeries(series.id)}
                                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-900/50 rounded-full transition-colors"
                                        aria-label={`Delete series ${series.title}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                                {expandedSeriesId === series.id && (
                                     <div className="border-t border-gray-700 p-4 space-y-3">
                                        {series.videos && series.videos.length > 0 ? series.videos.map(video => (
                                            <div key={video.id} className="bg-gray-900 p-3 rounded-md">
                                                <p className="font-semibold text-indigo-300 text-sm">Prompt:</p>
                                                <p className="text-gray-300 mb-2 italic">"{video.prompt}"</p>
                                                
                                                {editingVideo?.videoId === video.id ? (
                                                    <div>
                                                        <textarea 
                                                            value={editingText}
                                                            onChange={(e) => setEditingText(e.target.value)}
                                                            rows={3}
                                                            className="w-full bg-gray-800 border-2 border-gray-600 rounded-md py-1 px-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                        />
                                                        <div className="flex gap-2 mt-2">
                                                            <button onClick={handleSaveEdit} className="text-xs bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-2 rounded">Save</button>
                                                            <button onClick={handleCancelEdit} className="text-xs bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded">Cancel</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="font-semibold text-indigo-300 text-sm">Description:</p>
                                                        <p className="text-gray-400 whitespace-pre-wrap">{video.description}</p>
                                                        <div className="flex gap-2 mt-2">
                                                            <button onClick={() => handleEditVideoClick(series.id, video)} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-2 rounded">Edit</button>
                                                            <button onClick={() => handleDeleteVideo(series.id, video.id)} className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">Delete</button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )) : <p className="text-gray-500 text-sm">No videos have been generated for this series yet.</p>}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center">You haven't created any series yet. Use the form above to get started!</p>
                )}
            </div>
        </div>
    );
};

export default SeriesPage;