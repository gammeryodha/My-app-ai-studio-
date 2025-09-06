import React, { useState, useEffect } from 'react';

import type { UserProfile, Series, User } from './types';
import { GOOGLE_CLIENT_ID, YOUTUBE_API_SCOPES, DEFAULT_USERS } from './constants';

import { Header } from './components/Header';
import Sidebar from './components/Sidebar';
import Generator from './pages/Generator';
import SeriesPage from './pages/Series';
import Settings from './pages/Settings';
import Privacy from './pages/Privacy';
import Login from './pages/Login';

// FIX: The original 'google' global type definition was conflicting with other Google API types.
// Replaced with module augmentation to correctly add oauth2 types
// without conflicting. This involves defining the necessary interfaces at the top level
// and then augmenting the existing `google.accounts` interface.
interface GoogleTokenClient {
    requestAccessToken: (overrideConfig?: any) => void;
}
interface GoogleTokenResponse {
    access_token: string;
    error?: string;
    error_description?: string;
    expires_in?: number;
    scope?: string;
}
interface GoogleTokenClientConfig {
    client_id: string;
    scope: string;
    callback: (tokenResponse: GoogleTokenResponse) => void;
}

declare global {
    namespace google {
        // This augments the existing `accounts` object/interface from other google @types.
        // It assumes `accounts` is declared as an interface or a const with a corresponding type.
        interface accounts {
            oauth2: {
                initTokenClient(config: GoogleTokenClientConfig): GoogleTokenClient;
                revoke(accessToken: string, done: () => void): void;
            }
        }
    }
}

type Page = 'generator' | 'series' | 'settings' | 'privacy';

const App: React.FC = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState<string | null>(null);
    // FIX: Updated to use the globally defined interface to avoid namespace conflicts.
    const [tokenClient, setTokenClient] = useState<GoogleTokenClient | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState<Page>('generator');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [seriesList, setSeriesList] = useState<Series[]>([]);

    useEffect(() => {
        try {
            const storedUser = sessionStorage.getItem('ai-video-forge-user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
            const storedToken = sessionStorage.getItem('yt-access-token');
            if (storedToken) {
                setAccessToken(storedToken);
            }
            const storedSeries = localStorage.getItem('ai-video-forge-series');
            if (storedSeries) {
                setSeriesList(JSON.parse(storedSeries));
            }
            const storedUsers = localStorage.getItem('ai-video-forge-users');
            if (storedUsers) {
                setUsers(JSON.parse(storedUsers));
            } else {
                setUsers(DEFAULT_USERS);
            }
        } catch (e) {
            console.error("Could not parse data from storage", e);
            sessionStorage.removeItem('ai-video-forge-user');
            sessionStorage.removeItem('yt-access-token');
            localStorage.removeItem('ai-video-forge-series');
            localStorage.removeItem('ai-video-forge-users');
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('ai-video-forge-series', JSON.stringify(seriesList));
    }, [seriesList]);

    useEffect(() => {
        if (users.length > 0) {
            localStorage.setItem('ai-video-forge-users', JSON.stringify(users));
        }
    }, [users]);

    useEffect(() => {
        // FIX: Changed window.google to google for consistency and to fix type errors.
        if (user && typeof google !== 'undefined' && GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.startsWith('YOUR_')) {
            try {
                 const client = google.accounts.oauth2.initTokenClient({
                    client_id: GOOGLE_CLIENT_ID,
                    scope: YOUTUBE_API_SCOPES,
                    callback: (tokenResponse) => {
                        if (tokenResponse.error) {
                            setError(`Google Auth Error: ${tokenResponse.error_description || tokenResponse.error}`);
                            return;
                        }
                        setAccessToken(tokenResponse.access_token);
                        sessionStorage.setItem('yt-access-token', tokenResponse.access_token);
                        setError(null);
                    },
                });
                setTokenClient(client);
            } catch(e) {
                console.error("Error initializing Google Token Client: ", e);
                setError("Could not initialize Google authentication. This may be due to an ad blocker or misconfiguration.");
            }
        }
    }, [user]);

    const handleLoginSuccess = (loggedInUser: User) => {
        const userProfile: UserProfile = { 
            username: loggedInUser.username,
            role: loggedInUser.role 
        };
        setUser(userProfile);
        sessionStorage.setItem('ai-video-forge-user', JSON.stringify(userProfile));
    };

    const handleGoogleDisconnect = () => {
        if (accessToken && typeof google?.accounts?.oauth2?.revoke === 'function') {
            google.accounts.oauth2.revoke(accessToken, () => {
                console.log('Access token revoked.');
            });
        }
        setAccessToken(null);
        sessionStorage.removeItem('yt-access-token');
    };

    const handleLogout = () => {
        handleGoogleDisconnect();
        setUser(null);
        sessionStorage.removeItem('ai-video-forge-user');
        setCurrentPage('generator');
    };

    const requestGoogleAuth = () => {
        setError(null);
        if (tokenClient) {
            tokenClient.requestAccessToken();
        } else {
            setError("Google Auth client is not ready. Please ensure your Google Client ID is configured correctly in `constants.ts` and refresh the page.");
        }
    };

    const handleAddUser = (user: User) => {
        if (users.some(u => u.username === user.username)) {
            throw new Error("Username already exists.");
        }
        setUsers([...users, user]);
    };

    const handleUpdateUser = (username: string, updatedUser: User) => {
        setUsers(users.map(u => u.username === username ? { ...u, ...updatedUser } : u));
    };

    const handleDeleteUser = (username: string) => {
        setUsers(users.filter(u => u.username !== username));
    };

    if (!user) {
        return <Login onLoginSuccess={handleLoginSuccess} users={users} />;
    }

    const renderPage = () => {
        switch (currentPage) {
            case 'generator':
                return <Generator 
                            user={user} 
                            seriesList={seriesList} 
                            setSeriesList={setSeriesList}
                            accessToken={accessToken}
                            requestGoogleAuth={requestGoogleAuth}
                            onGoogleDisconnect={handleGoogleDisconnect}
                        />;
            case 'series':
                return <SeriesPage seriesList={seriesList} setSeriesList={setSeriesList} />;
            case 'settings':
                return <Settings 
                            user={user} 
                            onLogout={handleLogout}
                            users={users}
                            onAddUser={handleAddUser}
                            onUpdateUser={handleUpdateUser}
                            onDeleteUser={handleDeleteUser}
                            accessToken={accessToken}
                            requestGoogleAuth={requestGoogleAuth}
                            onGoogleDisconnect={handleGoogleDisconnect}
                        />;
            case 'privacy':
                return <Privacy />;
            default:
                return <Generator 
                            user={user} 
                            seriesList={seriesList} 
                            setSeriesList={setSeriesList}
                            accessToken={accessToken}
                            requestGoogleAuth={requestGoogleAuth}
                            onGoogleDisconnect={handleGoogleDisconnect}
                        />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            <Header user={user} onLogout={handleLogout} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <div className="flex flex-1 container mx-auto max-w-7xl relative">
                <Sidebar
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                />
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {error && (
                        <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg mb-6 text-center" role="alert">
                            <span className="font-semibold">Error:</span> {error}
                        </div>
                    )}
                    {renderPage()}
                </main>
            </div>
        </div>
    );
};

export default App;