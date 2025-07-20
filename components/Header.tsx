
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { WalletButton } from './WalletButton';
import { ShieldCheckIcon, MenuIcon, XIcon } from './Icons';
import { useAppState } from '../contexts/WalletContext';

export const Header: React.FC = () => {
    const { user } = useAppState();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
        }`;
    
    const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
        `block px-3 py-2 rounded-md text-base font-medium ${
            isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
        }`;
    
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <NavLink to="/" className="flex-shrink-0 flex items-center gap-2 text-white" onClick={closeMobileMenu}>
                            <ShieldCheckIcon className="h-8 w-8 text-indigo-400" />
                            <div className="flex flex-col">
                                <span className="font-bold text-lg leading-tight">Fito Audit</span>
                                <span className="text-xs text-gray-400 leading-tight">by Fito Technology, LLC</span>
                            </div>
                        </NavLink>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <NavLink to="/" className={navLinkClass}>Home</NavLink>
                                <NavLink to="/submit" className={navLinkClass}>Submit Audit</NavLink>
                                <NavLink to="/search" className={navLinkClass}>Search Reports</NavLink>
                                {user && <NavLink to="/my-audits" className={navLinkClass}>My Audits</NavLink>}
                                {user && <NavLink to="/referrals" className={navLinkClass}>Fito Entrepreneur</NavLink>}
                                {user?.isAdmin && <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>}
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <WalletButton />
                    </div>
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            type="button"
                            className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                            aria-controls="mobile-menu"
                            aria-expanded={isMobileMenuOpen}
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMobileMenuOpen ? (
                                <XIcon className="block h-6 w-6" />
                            ) : (
                                <MenuIcon className="block h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile menu, show/hide based on menu state. */}
            {isMobileMenuOpen && (
                 <div className="md:hidden" id="mobile-menu">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <NavLink to="/" className={mobileNavLinkClass} onClick={closeMobileMenu}>Home</NavLink>
                        <NavLink to="/submit" className={mobileNavLinkClass} onClick={closeMobileMenu}>Submit Audit</NavLink>
                        <NavLink to="/search" className={mobileNavLinkClass} onClick={closeMobileMenu}>Search Reports</NavLink>
                        {user && <NavLink to="/my-audits" className={mobileNavLinkClass} onClick={closeMobileMenu}>My Audits</NavLink>}
                        {user && <NavLink to="/referrals" className={mobileNavLinkClass} onClick={closeMobileMenu}>Fito Entrepreneur</NavLink>}
                        {user?.isAdmin && <NavLink to="/admin" className={mobileNavLinkClass} onClick={closeMobileMenu}>Admin</NavLink>}
                    </div>
                    <div className="pt-4 pb-3 border-t border-gray-700">
                        <div className="px-2">
                            <div className="w-full">
                                <WalletButton />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};