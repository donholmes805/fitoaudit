import React from 'react';
import { useAppState } from '../contexts/WalletContext';

export const WalletButton: React.FC = () => {
    const { user, connectWallet } = useAppState();

    const formatAddress = (address: string) => {
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    };

    if (user) {
        return (
            <div className="bg-gray-800 text-sm text-gray-300 font-mono px-4 py-2 rounded-lg">
                {formatAddress(user.address)}
            </div>
        );
    }

    return (
        <button
            onClick={connectWallet}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 transition-colors"
        >
            Connect Wallet
        </button>
    );
};