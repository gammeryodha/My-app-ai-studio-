
import React from 'react';

const features = [
    {
        title: 'AI-Powered Generation',
        description: "Describe any scene, and our AI will create a high-quality video for you in minutes.",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
        )
    },
    {
        title: 'Image to Video',
        description: "Bring static images to life. Provide a picture to guide the AI's video creation process.",
        icon: (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
        )
    },
    {
        title: 'Create a Series',
        description: "Organize content by creating video series. We'll help with titles, descriptions, and tags.",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3.75h3M3.375 6.375h17.25M3.375 12h17.25M3.375 17.625h17.25M5.625 4.5h12.75a1.125 1.125 0 010 2.25H5.625a1.125 1.125 0 010-2.25z" />
            </svg>
        )
    },
    {
        title: 'Direct YouTube Upload',
        description: "Sign in with Google and upload your creations directly to your YouTube channel with one click.",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
        )
    }
];

const Features: React.FC = () => {
    return (
        <section className="mb-12 w-full">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-300">
                Explore What You Can Do
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature, index) => (
                    <div key={index} className="group relative bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-all duration-300 transform hover:-translate-y-1">
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                        <div className="relative">
                            <div className="flex items-center mb-3">
                                <div className="p-2 bg-gray-800/80 rounded-lg">
                                    {feature.icon}
                                </div>
                                <h3 className="ml-4 text-lg font-semibold text-white">{feature.title}</h3>
                            </div>
                            <p className="text-gray-400 text-sm">{feature.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Features;