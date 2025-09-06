import React from 'react';

interface YouTubeConnectProps {
    accessToken: string | null;
    requestGoogleAuth: () => void;
    onDisconnect: () => void;
}

const YouTubeConnect: React.FC<YouTubeConnectProps> = ({ accessToken, requestGoogleAuth, onDisconnect }) => {
    return (
        <div className="bg-gray-800/60 p-6 rounded-lg border border-gray-700">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                         <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21.543 6.498C22 8.28 22 12 22 12s0 3.72-.457 5.502c-.254.985-.997 1.76-1.982 2.023C17.938 20 12 20 12 20s-5.938 0-7.561-.475c-.985-.263-1.728-1.038-1.982-2.023C2 15.72 2 12 2 12s0-3.72.457-5.502c.254-.985.997-1.76 1.982-2.023C6.062 4 12 4 12 4s5.938 0 7.561.475c.985.263 1.728 1.038 1.982 2.023zM10 15.5l6-3.5-6-3.5v7z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-white">YouTube Connection</h3>
                        {accessToken ? (
                            <p className="text-sm text-green-400">Status: Connected</p>
                        ) : (
                            <p className="text-sm text-yellow-400">Status: Disconnected</p>
                        )}
                    </div>
                </div>

                {accessToken ? (
                     <button
                        onClick={onDisconnect}
                        className="w-full sm:w-auto bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-5 rounded-lg transition-colors"
                    >
                        Disconnect
                    </button>
                ) : (
                    <button
                        onClick={requestGoogleAuth}
                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-lg transition-colors flex items-center justify-center"
                    >
                        Connect with Google
                    </button>
                )}
            </div>
            <p className="text-xs text-gray-500 mt-4">
                 You must connect your Google account to grant permission to upload videos directly to your YouTube channel.
            </p>
        </div>
    );
};

export default YouTubeConnect;