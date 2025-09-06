import type { User } from './types';

// IMPORTANT: You must configure these values for the application to work.
// 1. Get a Gemini API Key from Google AI Studio: https://aistudio.google.com/app/apikey
// 2. Create a Google Cloud project, enable the YouTube Data API v3, and create an OAuth 2.0 Client ID.
//    https://developers.google.com/youtube/v3/getting-started

// Your Gemini API Key
export const API_KEY = 'AIzaSyAG-qSRNDEBeOeW-xMSI6_Zqc9DRgbZCN4';

// Your Google Client ID for OAuth from Google Cloud Console
export const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

// Scopes required for YouTube upload
export const YOUTUBE_API_SCOPES = 'https://www.googleapis.com/auth/youtube.upload';

// Default user credentials for local accounts if none are in local storage.
export const DEFAULT_USERS: User[] = [
    { username: 'yodha', password: 'Yodhasri@2', role: 'admin' },
];