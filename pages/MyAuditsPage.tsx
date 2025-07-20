import React from 'react';
import { Link } from 'react-router-dom';
import { useAudits } from '../contexts/AuditContext';
import { useAppState } from '../contexts/WalletContext';
import { ChevronRightIcon } from '../components/Icons';
import { serviceTypeDetails } from '../types';
import { WalletButton } from '../components/WalletButton';

export const MyAuditsPage: React.FC = () => {
    const { audits } = useAudits();
    const { user } = useAppState();

    if (!user) {
        return (
            <div className="text-center py-16">
                <h2 className="text-xl font-semibold text-gray-400">Connect Your Wallet</h2>
                <p className="text-gray-500 mt-2">Please connect your wallet to view your service history.</p>
                <div className="mt-6 inline-block">
                    <WalletButton />
                </div>
            </div>
        )
    }

    const myAudits = audits
        .filter(audit => audit.userId.toLowerCase() === user.address.toLowerCase())
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());


    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">My Service History</h1>
            <div className="bg-gray-900 rounded-lg border border-gray-800">
                {myAudits.length > 0 ? (
                    <ul className="divide-y divide-gray-800">
                        {myAudits.map(audit => (
                            <li key={audit.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-gray-800/50 transition-colors group">
                                <Link to={`/report/${audit.id}`} className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3">
                                        <p className="text-lg font-bold text-indigo-400 truncate">{audit.projectName}</p>
                                        <span className="text-xs font-bold text-gray-400 bg-gray-800 px-2 py-1 rounded-md whitespace-nowrap">
                                            {serviceTypeDetails[audit.serviceType].name}
                                        </span>
                                        {audit.isReaudit && (
                                            <span className="text-xs font-bold text-blue-300 bg-blue-900/50 px-2 py-1 rounded-md whitespace-nowrap">
                                                Re-audit
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400 mt-2">
                                        {audit.details.chain && <span>Chain: <span className="font-medium text-gray-300">{audit.details.chain}</span></span>}
                                        <span>Grade: <span className="font-medium text-gray-300">{audit.grade}</span></span>
                                        <span>Date: <span className="font-medium text-gray-300">{new Date(audit.createdAt).toLocaleDateString()}</span></span>
                                    </div>
                                </Link>
                                <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                                    {audit.remainingSubmissions !== undefined && audit.remainingSubmissions > 0 && !audit.isReaudit && (
                                        <Link
                                            to={`/submit?reauditOf=${audit.id}`}
                                            className="text-sm font-medium bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 transition-colors whitespace-nowrap"
                                        >
                                            Use Re-audit ({audit.remainingSubmissions} left)
                                        </Link>
                                    )}
                                    <ChevronRightIcon className="h-5 w-5 text-gray-500 group-hover:text-white transition-colors" />
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-16 px-4">
                        <h2 className="text-xl font-semibold text-gray-400">No Service History Yet</h2>
                        <p className="text-gray-500 mt-2">You haven't requested any services yet.</p>
                        <Link to="/submit" className="mt-6 inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-500 transition">
                            Request Your First Service
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};