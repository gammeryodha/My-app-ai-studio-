
import React from 'react';
import type { UserProfile } from '../types';

interface HeaderProps {
    user: UserProfile | null;
    onLogout: () => void;
    onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, onToggleSidebar }) => {
    return (
        <header className="w-full p-4 bg-black/30 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-20">
            <div className="container mx-auto flex justify-between items-center max-w-7xl">
                <div className="flex items-center gap-2">
                     <button
                        onClick={onToggleSidebar}
                        className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white md:hidden"
                        aria-label="Open sidebar"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                    <div className="flex items-center gap-2">
                        <svg className="w-8 h-8 text-indigo-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 15.5V8.5L16 12L10 15.5Z" fill="currentColor" />
                            <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-xl font-bold text-white hidden sm:inline">AI Video Forge</span>
                    </div>
                </div>

                <div className="flex items-center">
                    {user ? (
                        <div className="relative group">
                            <button className="flex items-center gap-2 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 bg-gray-800 hover:bg-gray-700">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                                <span className="font-medium text-white">{user.username}</span>
                            </button>
                             <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                <div className="py-1">
                                     <div className="px-4 py-2 border-b border-gray-700">
                                        <p className="text-sm font-semibold text-white truncate">Signed in as</p>
                                        <p className="text-xs text-gray-400 truncate">{user.username}</p>
                                    </div>
                                    <button
                                        onClick={onLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-red-600/50 hover:text-white transition-colors"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </header>
    );
};