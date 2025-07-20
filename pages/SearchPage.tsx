
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAudits } from '../contexts/AuditContext';
import { ChevronRightIcon, SearchIcon } from '../components/Icons';
import { serviceTypeDetails } from '../types';

export const SearchPage: React.FC = () => {
    const { audits } = useAudits();
    const [searchTerm, setSearchTerm] = useState('');

    const publicAudits = useMemo(() => {
        return audits
            .filter(audit => audit.isPublic)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [audits]);

    const searchResults = useMemo(() => {
        if (!searchTerm.trim()) {
            return publicAudits;
        }
        const lowercasedTerm = searchTerm.toLowerCase().trim();
        return publicAudits.filter(audit =>
            audit.projectName.toLowerCase().includes(lowercasedTerm) ||
            audit.id.toLowerCase().includes(lowercasedTerm)
        );
    }, [searchTerm, publicAudits]);

    const renderEmptyState = () => {
        // If there are no public audits in the system at all, show this message first.
        if (publicAudits.length === 0) {
            return (
                <div className="text-center py-16 px-4 flex items-center justify-center flex-col min-h-[300px]">
                    <h2 className="text-xl font-semibold text-gray-400">No Public Reports Yet</h2>
                    <p className="text-gray-500 mt-2 max-w-md">
                        When project owners make their audit reports public, they will appear here.
                    </p>
                </div>
            );
        }
        // If there are public audits, but the search term yielded no results.
        if (searchResults.length === 0) {
             return (
                <div className="text-center py-16 px-4 flex items-center justify-center flex-col min-h-[300px]">
                    <h2 className="text-xl font-semibold text-gray-400">No Results Found</h2>
                    <p className="text-gray-500 mt-2 max-w-md">No public reports matched your search term.</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div>
            <div className="text-center mb-8">
                <div className="inline-block p-4 bg-gray-800 rounded-full border-2 border-gray-700">
                    <SearchIcon className="h-8 w-8 text-indigo-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mt-4">Search Public Reports</h1>
                <p className="mt-2 text-gray-400 max-w-2xl mx-auto">
                    Browse all public audit reports below, or use the search bar to filter by project name or ID.
                </p>
            </div>
            
            <div className="max-w-2xl mx-auto mb-8">
                <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Filter reports by project name or ID..."
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-md p-3 pl-10 focus:ring-indigo-500 focus:border-indigo-500"
                        aria-label="Filter reports"
                    />
                </div>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 min-h-[300px]">
                {searchResults.length > 0 ? (
                    <ul className="divide-y divide-gray-800">
                        {searchResults.map(audit => (
                            <li key={audit.id}>
                                <Link to={`/report/${audit.id}`} className="block hover:bg-gray-800/50 transition-colors group">
                                    <div className="flex items-center justify-between p-4 sm:p-6">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <p className="text-lg font-bold text-indigo-400 truncate">{audit.projectName}</p>
                                                <span className="text-xs font-bold text-gray-400 bg-gray-800 px-2 py-1 rounded-md whitespace-nowrap">
                                                    {serviceTypeDetails[audit.serviceType].name}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400 mt-2">
                                                <span>Grade: <span className="font-medium text-gray-300">{audit.grade}</span></span>
                                                <span>Date: <span className="font-medium text-gray-300">{new Date(audit.createdAt).toLocaleDateString()}</span></span>
                                            </div>
                                        </div>
                                        <ChevronRightIcon className="h-5 w-5 text-gray-500 ml-4 group-hover:text-white transition-colors" />
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    renderEmptyState()
                )}
            </div>
        </div>
    );
};
