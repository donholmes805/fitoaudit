
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAudits } from '../contexts/AuditContext';
import { AuditReportDisplay } from '../components/AuditReportDisplay';

export const ReportPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { getAuditById } = useAudits();

    if (!id) {
        return <div className="text-center text-red-400">No audit ID provided.</div>;
    }

    const report = getAuditById(id);

    if (!report) {
        return (
            <div className="text-center py-16">
                <h1 className="text-2xl font-bold text-red-400">Audit Not Found</h1>
                <p className="text-gray-400 mt-2">The report with ID '{id}' could not be found.</p>
                <Link to="/my-audits" className="mt-6 inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-500 transition">
                    Back to My Audits
                </Link>
            </div>
        );
    }
    
    return <AuditReportDisplay report={report} />;
};
