

interface VideoMetadata {
    title: string;
    description: string;
    privacyStatus: 'private' | 'public' | 'unlisted';
    publishAt?: string; // ISO 8601 format string
    tags?: string[];
    categoryId?: string;
}

/**
 * Parses a YouTube API error response to generate a user-friendly message.
 * @param errorBody The raw error object from the API.
 * @returns A descriptive error string.
 */
const parseYouTubeApiError = (errorBody: any): string => {
    if (!errorBody?.error?.errors?.[0]) {
        // Fallback for unexpected error structures
        return errorBody?.error?.message || 'An unknown YouTube API error occurred. Please check the console for details.';
    }

    const errorDetails = errorBody.error.errors[0];
    const reason = errorDetails.reason;
    const message = errorDetails.message;
    const location = errorDetails.location; // Extract the location of the error

    // Helper to make the field name more readable
    const getReadableFieldName = (loc: string) => {
        const fieldName = loc.split('.').pop() || 'metadata';
        return fieldName.replace(/([A-Z])/g, ' $1').toLowerCase();
    };

    switch (reason) {
        case 'quotaExceeded':
            return 'YouTube API daily quota exceeded. You have uploaded too many videos today. Please try again tomorrow.';
        case 'youtubeSignupRequired':
            return 'You must have a YouTube channel to upload videos. Please visit YouTube to create one, then try again.';
        case 'termsOfServiceNotAccepted':
            return 'You must accept the YouTube Terms of Service before uploading. Please visit the YouTube website to review and accept the terms.';
        case 'uploadRejected':
            return `Upload rejected by YouTube. Reason: "${message}". This may be due to content policy violations or other issues.`;
        case 'duplicate':
            return 'This video has already been uploaded. YouTube does not allow duplicate videos.';
        case 'channelSuspended':
            return 'Cannot upload video because the associated YouTube channel is suspended.';
        case 'forbidden':
             return 'Access to the YouTube API was denied. Please ensure you have granted the necessary permissions and that the YouTube Data API v3 is enabled in your Google Cloud project.';
        case 'unauthorized':
            return 'Your authorization has expired or is invalid. Please try signing out and signing back in.';
        case 'insufficientPermissions':
            return 'You do not have sufficient permissions to upload videos to this YouTube channel.';
        case 'videoForbidden':
            return 'The video content is forbidden by YouTube policies.';
        case 'processingFailure':
             return `YouTube could not process the video. Reason: "${message}". Please try a different video format or content.`;
        case 'tooLong':
            if (location) {
                // FIX: Changed 'loc' to 'location' to fix a reference error.
                return `The video ${getReadableFieldName(location)} is too long. Please shorten it and try again.`;
            }
            return `The video metadata is too long. Please shorten the title, description, or tags.`;
        case 'requestTooLarge':
            return 'The video file is too large to be uploaded. Please try a smaller file.';
        case 'badRequest':
        case 'invalidRequest':
            if (location) {
                return `Invalid video ${getReadableFieldName(location)}. YouTube's response: "${message}". Please correct the field and try again.`;
            }
            return `Invalid video metadata provided. YouTube API says: "${message}". Please review the video details.`;
        default:
            return message || 'An unexpected error occurred during the YouTube upload process.';
    }
};

export const uploadVideoToYouTube = async (
    videoBlob: Blob,
    metadata: VideoMetadata,
    accessToken: string,
    onProgress: (percentage: number) => void,
    onStatusUpdate: (message: string) => void
): Promise<string> => {
    const YOUTUBE_API_URL = 'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status';

    const status: {
        privacyStatus: 'private' | 'public' | 'unlisted';
        publishAt?: string;
    } = {
        // If scheduling, the initial status must be 'private'. It will become public at the specified time.
        privacyStatus: metadata.publishAt ? 'private' : metadata.privacyStatus,
    };

    if (metadata.publishAt) {
        status.publishAt = metadata.publishAt;
    }

    const videoResource = {
        snippet: {
            title: metadata.title,
            description: metadata.description,
            tags: metadata.tags ?? ['AI Generated', 'Gemini', 'VEO'],
            categoryId: metadata.categoryId ?? '28', // Category for Science & Technology
        },
        status: status,
    };

    const MAX_RETRIES = 3;
    const INITIAL_DELAY_MS = 2000;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            // 1. Initiate Resumable Upload
            const initResponse = await fetch(YOUTUBE_API_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json; charset=UTF-8',
                },
                body: JSON.stringify(videoResource),
            });
            
            // If we get a server error (5xx), it's a candidate for a retry.
            if (initResponse.status >= 500 && initResponse.status < 600) {
                 throw new Error('NetworkError');
            }

            if (!initResponse.ok) {
                const errorBody = await initResponse.json();
                console.error('YouTube API Error (Init):', errorBody);
                throw new Error(parseYouTubeApiError(errorBody));
            }

            const locationUrl = initResponse.headers.get('Location');
            if (!locationUrl) {
                throw new Error('Could not get upload URL from YouTube API.');
            }

            // 2. Upload the video file using XMLHttpRequest for progress tracking
            return await new Promise<string>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('PUT', locationUrl, true);

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percentage = Math.round((event.loaded / event.total) * 100);
                        onProgress(percentage);
                    }
                };

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const responseData = JSON.parse(xhr.responseText);
                        resolve(responseData.id);
                    } else {
                        try {
                            const errorBody = JSON.parse(xhr.responseText);
                            console.error('YouTube API Error (Upload):', errorBody);
                            reject(new Error(parseYouTubeApiError(errorBody)));
                        } catch (e) {
                            reject(new Error(`Failed to upload video file. Status: ${xhr.status} ${xhr.statusText}`));
                        }
                    }
                };

                xhr.onerror = () => {
                    // This is a network error, signal to the outer catch block to retry.
                    reject(new Error('NetworkError'));
                };

                xhr.send(videoBlob);
            });

        } catch (error: any) {
            console.error(`Error during YouTube upload process (Attempt ${attempt + 1}):`, error);
            if (error.message === 'NetworkError' && attempt < MAX_RETRIES - 1) {
                const delayTime = INITIAL_DELAY_MS * Math.pow(2, attempt);
                onStatusUpdate(`Upload failed. Retrying in ${Math.round(delayTime / 1000)}s... (Attempt ${attempt + 2}/${MAX_RETRIES})`);
                await new Promise(res => setTimeout(res, delayTime));
                continue; // Continue to the next iteration of the loop
            } else {
                 if (error.message === 'NetworkError') {
                    throw new Error('Upload failed due to a network error after multiple retries. Please check your internet connection.');
                }
                // The error is not a 'NetworkError' or it's the last retry, so we throw it.
                throw error;
            }
        }
    }
    // This line should be unreachable if the loop is correct, but it satisfies TypeScript.
    throw new Error('Upload failed after all retries.');
};