import React from 'react';
import { useLocation } from 'react-router-dom';
import { AuditForm } from '../components/AuditForm';
import { FileTextIcon } from '../components/Icons';
import { useAudits } from '../contexts/AuditContext';

export const SubmitPage: React.FC = () => {
    const location = useLocation();
    const { getAuditById } = useAudits();
    
    const searchParams = new URLSearchParams(location.search);
    const reauditOfId = searchParams.get('reauditOf');
    const referralCode = searchParams.get('ref');
    
    const auditToReaudit = reauditOfId ? getAuditById(reauditOfId) : undefined;
    const isReaudit = !!(auditToReaudit && auditToReaudit.remainingSubmissions && auditToReaudit.remainingSubmissions > 0);

    return (
        <div>
            <div className="text-center mb-8">
                <div className="inline-block p-4 bg-gray-800 rounded-full border-2 border-gray-700">
                    <FileTextIcon className="h-8 w-8 text-indigo-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mt-4">{isReaudit ? 'Submit Re-audit' : 'Request a Security Service'}</h1>
                <p className="mt-2 text-gray-400 max-w-2xl mx-auto">
                    {isReaudit 
                        ? 'Update the details for your project below to use one of your remaining re-audit submissions.'
                        : 'Select a service and fill in the project details below to begin the AI-powered analysis.'}
                </p>
            </div>
            <div className="max-w-4xl mx-auto bg-gray-900 p-8 rounded-xl border border-gray-800">
                <AuditForm auditToReaudit={auditToReaudit} initialReferralCode={referralCode} />
            </div>
        </div>
    );
};