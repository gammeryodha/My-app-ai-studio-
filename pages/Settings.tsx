import React from 'react';
import type { UserProfile, User } from '../types';
import UserManagement from '../components/UserManagement';
import YouTubeConnect from '../components/YouTubeConnect';

interface SettingsProps {
    user: UserProfile | null;
    onLogout: () => void;
    users: User[];
    onAddUser: (user: User) => void;
    onUpdateUser: (username: string, updatedUser: User) => void;
    onDeleteUser: (username: string) => void;
    accessToken: string | null;
    requestGoogleAuth: () => void;
    onGoogleDisconnect: () => void;
}

const Settings: React.FC<SettingsProps> = ({ 
    user, onLogout, users, onAddUser, onUpdateUser, onDeleteUser,
    accessToken, requestGoogleAuth, onGoogleDisconnect 
}) => {
    return (
         <div className="w-full max-w-3xl mx-auto space-y-10">
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl shadow-2xl shadow-indigo-500/10 p-6 md:p-10 border border-gray-800">
                <h2 className="text-3xl font-bold mb-6 text-indigo-300">Account Settings</h2>

                {user ? (
                    <div className="space-y-6">
                        <div className="flex items-center space-x-4 p-4 bg-gray-800/60 rounded-lg border border-gray-700">
                             <div className="p-3 bg-gray-700 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                             </div>
                            <div>
                                <p className="text-xl font-semibold text-white">{user.username}</p>
                                <p className="text-gray-400 capitalize">{user.role} Account</p>
                            </div>
                        </div>
                        <p className="text-gray-400">
                           You are currently logged in. You can sign out below.
                        </p>
                         <button
                            onClick={onLogout}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-300 shadow-md hover:shadow-red-500/30"
                        >
                            Sign Out
                        </button>
                    </div>
                ) : (
                     <p className="text-gray-400 text-center">You are not signed in.</p>
                )}
            </div>
            
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl shadow-2xl shadow-indigo-500/10 p-6 md:p-10 border border-gray-800">
                 <h2 className="text-3xl font-bold mb-6 text-indigo-300">Connected Services</h2>
                 <YouTubeConnect
                    accessToken={accessToken}
                    requestGoogleAuth={requestGoogleAuth}
                    onDisconnect={onGoogleDisconnect}
                 />
            </div>

             {user && user.role === 'admin' && (
                <UserManagement
                    currentUser={user}
                    users={users}
                    onAddUser={onAddUser}
                    onUpdateUser={onUpdateUser}
                    onDeleteUser={onDeleteUser}
                />
            )}
        </div>
    );
};

export default Settings;