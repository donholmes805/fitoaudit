import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-900 border-t border-gray-800">
            <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
                <div className="flex justify-center items-center gap-x-6 gap-y-2 flex-wrap mb-4">
                    <a href="https://fitotechnology.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">Fito Technology, LLC</a>
                    <a href="https://fitochain.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">Fitochain</a>
                    <Link to="/referrals" className="hover:text-gray-300 transition-colors">Affiliate</Link>
                    <a href="https://x.com/fitochain" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">X</a>
                    <a href="https://t.me/fitochain" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">Telegram</a>
                </div>
                <div className="flex justify-center items-center gap-2 mb-4">
                    <img src="https://fitochain.com/wp-content/uploads/2025/07/paypal-small.png" alt="PayPal Logo" className="h-4" />
                    <span className="text-gray-400">We Accept PayPal.</span>
                </div>
                <p className="mb-3">Fito Audit by Fito Technology, LLC 2025 &copy; Copyright. All Rights Reserved.</p>
                <p className="text-xs text-gray-600 max-w-3xl mx-auto">
                    Disclaimer: An audit by Fito AI is a technical assessment and not a financial endorsement or guarantee against fraud. Fito Technology, LLC is not liable for the actions of projects or individuals using our services. All payments are final and non-refundable.
                </p>
            </div>
        </footer>
    );
};
