
import React from 'react';

type Page = 'generator' | 'series' | 'settings' | 'privacy';

interface SidebarProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
}

const NavItem: React.FC<{
    page: Page;
    label: string;
    icon: JSX.Element;
    currentPage: Page;
    onClick: (page: Page) => void;
}> = ({ page, label, icon, currentPage, onClick }) => {
    const isActive = currentPage === page;
    return (
        <li>
            <a
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    onClick(page);
                }}
                className={`flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
                    isActive
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
                aria-current={isActive ? 'page' : undefined}
            >
                {icon}
                <span className="ml-4 font-medium">{label}</span>
            </a>
        </li>
    );
};


const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isSidebarOpen, setIsSidebarOpen }) => {
    
    const handleNavigation = (page: Page) => {
        setCurrentPage(page);
        setIsSidebarOpen(false); // Close sidebar on navigation
    };

    return (
        <>
            {/* Overlay for mobile */}
            <div
                className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity duration-300 ${
                    isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setIsSidebarOpen(false)}
                aria-hidden="true"
            ></div>
            <aside className={`fixed top-0 left-0 h-full z-40 w-64 flex-shrink-0 bg-gray-900/80 backdrop-blur-xl border-r border-gray-800 p-4 flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <nav className="flex-grow">
                    <ul>
                        <NavItem
                            page="generator"
                            label="Generator"
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                            }
                            currentPage={currentPage}
                            onClick={handleNavigation}
                        />
                        <NavItem
                            page="series"
                            label="Series"
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3.75h3M3.375 6.375h17.25M3.375 12h17.25M3.375 17.625h17.25M5.625 4.5h12.75a1.125 1.125 0 010 2.25H5.625a1.125 1.125 0 010-2.25z" />
                                </svg>
                            }
                            currentPage={currentPage}
                            onClick={handleNavigation}
                        />
                        <NavItem
                            page="settings"
                            label="Settings"
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            }
                            currentPage={currentPage}
                            onClick={handleNavigation}
                        />
                         <NavItem
                            page="privacy"
                            label="Privacy Policy"
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" />
                                </svg>
                            }
                            currentPage={currentPage}
                            onClick={handleNavigation}
                        />
                    </ul>
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
