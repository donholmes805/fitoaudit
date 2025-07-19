
import React from 'react';
import { Finding, FindingSeverity } from '../types';

interface AuditCardProps {
    finding: Finding;
}

const severityConfig: Record<FindingSeverity, { color: string; bgColor: string }> = {
    'Critical': { color: 'text-red-300', bgColor: 'bg-red-900/50' },
    'High': { color: 'text-orange-300', bgColor: 'bg-orange-900/50' },
    'Medium': { color: 'text-yellow-300', bgColor: 'bg-yellow-900/50' },
    'Low': { color: 'text-blue-300', bgColor: 'bg-blue-900/50' },
};

export const AuditCard: React.FC<AuditCardProps> = ({ finding }) => {
    const { color, bgColor } = severityConfig[finding.severity];

    return (
        <div className={`border border-gray-700 rounded-lg overflow-hidden ${bgColor}`}>
            <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-100">{finding.title}</h3>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${color} ${bgColor.replace('50', '80')}`}>
                        {finding.severity}
                    </span>
                </div>
                
                <div className="space-y-4 text-gray-300 text-sm">
                    <div>
                        <h4 className="font-semibold text-gray-400 mb-1">Description</h4>
                        <p>{finding.description}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-400 mb-1">Recommendation</h4>
                        <p>{finding.recommendation}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
