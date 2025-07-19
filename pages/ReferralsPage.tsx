
import React from 'react';
import { useAppState } from '../contexts/WalletContext';
import { useAudits } from '../contexts/AuditContext';
import { WalletButton } from '../components/WalletButton';
import { serviceTypeDetails } from '../types';

export const ReferralsPage: React.FC = () => {
    const { user, bnbPrice, addToast } = useAppState();
    const { audits } = useAudits();

    if (!user) {
        return (
            <div className="text-center py-16">
                <h2 className="text-xl font-semibold text-gray-400">Connect Your Wallet</h2>
                <p className="text-gray-500 mt-2">Please connect your wallet to view your Fito Entrepreneur dashboard.</p>
                <div className="mt-6 inline-block">
                    <WalletButton />
                </div>
            </div>
        )
    }

    const myReferrals = audits.filter(a => a.referralCode && a.referralCode.toLowerCase() === user.address.toLowerCase());
    
    const totalEarnedUSD = myReferrals.reduce((sum, audit) => {
        const payout = serviceTypeDetails[audit.serviceType]?.referralPayoutUSD ?? 0;
        return sum + payout;
    }, 0);

    const copyReferralCode = () => {
        navigator.clipboard.writeText(user.address).then(() => {
            addToast('Entrepreneur ID copied to clipboard!', 'success');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            addToast('Could not copy your ID.', 'error');
        });
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-8">Fito Entrepreneur Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Referrals</h2>
                    <p className="text-3xl font-extrabold text-white mt-2">{myReferrals.length}</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Earned (USD)</h2>
                    <p className="text-3xl font-extrabold text-white mt-2">${totalEarnedUSD.toFixed(2)}</p>
                </div>
                 <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Earned (BNB)</h2>
                    {bnbPrice ? (
                       <p className="text-3xl font-extrabold text-white mt-2">
                           {(totalEarnedUSD / bnbPrice).toFixed(4)}
                       </p>
                    ) : (
                        <div className="h-[36px] mt-2 flex items-center">
                            <div className="w-24 h-6 bg-gray-700 rounded animate-pulse"></div>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
                <h2 className="text-lg font-bold text-white mb-2">Your Entrepreneur ID (Referral Code)</h2>
                <p className="text-gray-400 mb-4">Share your wallet address with other projects. When they use it as a referral code, you earn BNB!</p>
                <div className="flex items-center bg-gray-900 p-2 rounded-md">
                    <input type="text" readOnly value={user.address} className="bg-transparent text-gray-300 font-mono w-full outline-none px-2" />
                    <button onClick={copyReferralCode} className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 transition-colors flex-shrink-0">
                        Copy
                    </button>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-white mb-4">Referral History</h2>
                <div className="bg-gray-900 rounded-lg border border-gray-800">
                    {myReferrals.length > 0 ? (
                        <ul className="divide-y divide-gray-800">
                           {myReferrals.map(audit => (
                               <li key={audit.id} className="p-4 sm:p-6">
                                   <div className="flex items-center justify-between">
                                       <div>
                                            <p className="font-bold text-indigo-400">{audit.projectName}</p>
                                            <p className="text-sm text-gray-400 mt-1">{serviceTypeDetails[audit.serviceType].name}</p>
                                       </div>
                                       <div className="text-right">
                                           <p className="font-bold text-green-400">+${serviceTypeDetails[audit.serviceType].referralPayoutUSD.toFixed(2)}</p>
                                           <p className="text-sm text-gray-500">{new Date(audit.createdAt).toLocaleDateString()}</p>
                                       </div>
                                   </div>
                               </li>
                           ))}
                        </ul>
                    ) : (
                        <div className="text-center py-16 px-4">
                            <h3 className="text-xl font-semibold text-gray-400">No Referrals Yet</h3>
                            <p className="text-gray-500 mt-2">Start sharing your Entrepreneur ID to earn BNB.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};