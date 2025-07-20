import React, { createContext, useState, useContext, useMemo, ReactNode, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { User } from '../types';

declare global {
    interface Window {
        ethereum?: any;
    }
}

export interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}

const ADMIN_ADDRESS = '0x51EA5875D6b7E3B517ddA9fbC1B4FE61d566BF98';

interface WalletContextType {
    user: User | null;
    provider: ethers.BrowserProvider | null;
    signer: ethers.Signer | null;
    bnbPrice: number | null;
    loading: boolean;
    connectWallet: () => Promise<void>;
    toasts: Toast[];
    addToast: (message: string, type?: Toast['type']) => void;
    removeToast: (id: number) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [signer, setSigner] = useState<ethers.Signer | null>(null);
    const [bnbPrice, setBnbPrice] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: number) => {
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, []);
    
    const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
        const id = Date.now();
        setToasts(prevToasts => [...prevToasts, { id, message, type }]);
        setTimeout(() => {
            removeToast(id);
        }, 5000);
    }, [removeToast]);
    
    const handleAccountsChanged = useCallback(async (accounts: string[]) => {
        if (accounts.length === 0) {
            setUser(null);
            setSigner(null);
        } else {
            const address = accounts[0];
            const lowerCaseAddress = address.toLowerCase();
            const lowerCaseAdminAddress = ADMIN_ADDRESS.toLowerCase();
            setUser({
                id: address,
                address: address,
                isAdmin: lowerCaseAddress === lowerCaseAdminAddress,
            });
            if (provider) {
                setSigner(await provider.getSigner());
            }
        }
    }, [provider]);

    useEffect(() => {
        const fetchBnbPrice = async () => {
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd');
                if (!response.ok) throw new Error('Failed to fetch BNB price');
                const data = await response.json();
                setBnbPrice(data.binancecoin.usd);
            } catch (error) {
                console.error("Could not fetch BNB price:", error);
                addToast("Price API failed. Check connection or ad-blocker.", "error");
            }
        };

        fetchBnbPrice();
        const interval = setInterval(fetchBnbPrice, 300000);
        return () => clearInterval(interval);
    }, [addToast]);
    
    const connectWallet = useCallback(async () => {
        if (window.ethereum) {
            try {
                const newProvider = new ethers.BrowserProvider(window.ethereum);
                setProvider(newProvider);
                const accounts = await newProvider.send('eth_requestAccounts', []);
                await handleAccountsChanged(accounts);
            } catch (error) {
                console.error("Failed to connect wallet:", error);
                addToast("Failed to connect wallet.", "error");
            }
        } else {
            addToast("Please install a Web3 wallet like MetaMask.", "error");
        }
    }, [handleAccountsChanged, addToast]);

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            };
        }
    }, [handleAccountsChanged]);
    
     useEffect(() => {
        // Attempt to connect silently on page load
        const trySilentConnect = async () => {
             if (window.ethereum) {
                try {
                    const newProvider = new ethers.BrowserProvider(window.ethereum);
                    const accounts = await newProvider.listAccounts();
                    if (accounts.length > 0) {
                        setProvider(newProvider);
                        const signer = await newProvider.getSigner();
                        setSigner(signer);
                        const address = await signer.getAddress();
                         setUser({
                            id: address,
                            address: address,
                            isAdmin: address.toLowerCase() === ADMIN_ADDRESS.toLowerCase(),
                        });
                    }
                } catch (e) {
                    console.log("Could not silently connect wallet.");
                }
            }
            setLoading(false);
        };
        trySilentConnect();
    }, []);

    const value = { user, provider, signer, bnbPrice, loading, connectWallet, toasts, addToast, removeToast };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
};

export const useAppState = (): WalletContextType => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useAppState must be used within an AppStateProvider');
    }
    return context;
};