
import React from 'react';
import { Link } from 'react-router-dom';
import { useAudits } from '../contexts/AuditContext';
import { ChevronRightIcon, FileTextIcon } from '../components/Icons';
import { serviceTypeDetails } from '../types';

export const LatestReportsPage: React.FC = () => {
    const { audits } = useAudits();

    // Filter for public reports and sort them by most recent first
    const publicAudits = audits
        .filter(audit => audit.isPublic)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div>
            <div className="text-center mb-8">
                 <div className="inline-block p-4 bg-gray-800 rounded-full border-2 border-gray-700">
                    <FileTextIcon className="h-8 w-8 text-indigo-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mt-4">Latest Public Reports</h1>
                <p className="mt-2 text-gray-400 max-w-2xl mx-auto">
                    Browse the most recent security reports made public by our users.
                </p>
            </div>
            <div className="bg-gray-900 rounded-lg border border-gray-800">
                {publicAudits.length > 0 ? (
                    <ul className="divide-y divide-gray-800">
                        {publicAudits.map(audit => (
                            <li key={audit.id}>
                                <Link to={`/report/${audit.id}`} className="block hover:bg-gray-800/50 transition-colors">
                                    <div className="flex items-center justify-between p-4 sm:p-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <p className="text-lg font-bold text-indigo-400">{audit.projectName}</p>
                                                <span className="text-xs font-bold text-gray-400 bg-gray-800 px-2 py-1 rounded-md">
                                                    {serviceTypeDetails[audit.serviceType].name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-400 mt-2">
                                                <span>Grade: <span className="font-medium text-gray-300">{audit.grade}</span></span>
                                                <span>Date: <span className="font-medium text-gray-300">{new Date(audit.createdAt).toLocaleDateString()}</span></span>
                                            </div>
                                        </div>
                                        <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-16 px-4">
                        <h2 className="text-xl font-semibold text-gray-400">No Public Reports Yet</h2>
                        <p className="text-gray-500 mt-2">Check back later to see the latest public audits.</p>
                        <Link to="/" className="mt-6 inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-500 transition">
                            Back to Home
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};