
import React from 'react';

const Privacy: React.FC = () => {
    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl shadow-2xl shadow-indigo-500/10 p-6 md:p-10 border border-gray-800 text-gray-300">
                <h2 className="text-3xl font-bold mb-6 text-indigo-300">Privacy Policy for AI Video Forge</h2>
                <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="space-y-6 prose prose-invert max-w-none prose-h3:text-indigo-400 prose-a:text-purple-400 hover:prose-a:text-purple-300">
                    <p>
                        Welcome to AI Video Forge. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our application.
                    </p>

                    <h3>1. Information We Collect</h3>
                    <p>
                        To provide our services, we may collect the following information:
                    </p>
                    <ul>
                        <li><strong>Google Account Information:</strong> When you sign in, we use Google OAuth to authenticate your identity. We receive your name, email address, and profile picture. This is solely for identifying you within the app and connecting to your YouTube account. We do not store your Google password.</li>
                        <li><strong>User-Generated Content:</strong> We process the text prompts you provide, any images you upload for video generation, and the final generated videos. This content is handled temporarily to perform the generation and upload services and is not stored on our servers long-term.</li>
                        <li><strong>YouTube Data:</strong> To upload videos on your behalf, we require access to your YouTube account via OAuth scopes. This permission allows the app to upload the videos you create. We do not access, store, or view any other part of your YouTube account.</li>
                    </ul>

                    <h3>2. How We Use Your Information</h3>
                    <p>
                        We use the information we collect for the following purposes:
                    </p>
                    <ul>
                        <li>To provide and maintain the core functionality of AI Video Forge, including video generation and direct uploads.</li>
                        <li>To personalize your experience by displaying your user information within the app.</li>
                        <li>To communicate with you about your account or our services, if necessary.</li>
                    </ul>
                    
                    <h3>3. Data Sharing</h3>
                    <p>
                        We do not sell, trade, or rent your personal information to others. We only share data with third-party services as necessary to provide the app's functionality:
                    </p>
                    <ul>
                        <li><strong>Google Gemini API:</strong> Your prompts and uploaded images are sent to the Google Gemini API to generate video content.</li>
                        <li><strong>Google YouTube API:</strong> Your generated video and its metadata (title, description) are sent to the YouTube API when you choose to upload.</li>
                    </ul>
                    <p>
                        Your interaction with these services is subject to their respective privacy policies.
                    </p>
                    
                    <h3>4. Data Security</h3>
                    <p>
                        We use industry-standard security measures to protect your information. Your connection to our service is encrypted using SSL. Authentication is handled securely through Google's OAuth 2.0 protocol.
                    </p>

                    <h3>5. Your Rights</h3>
                    <p>
                        You have control over your data. You can revoke the app's access to your Google Account at any time through your Google Account security settings. If you do so, you will be logged out of the application and will need to grant permissions again to use the YouTube upload feature.
                    </p>

                    <h3>6. Changes to This Policy</h3>
                    <p>
                        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page. You are advised to review this Privacy Policy periodically for any changes.
                    </p>

                    <h3>7. Contact Us</h3>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us. (Note: This is a demo application, and there is no real contact method.)
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Privacy;
