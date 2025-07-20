
import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ServiceReport, AuditGrade, KycStatus, FindingSeverity, serviceTypeDetails } from '../types';
import { AuditCard } from './AuditCard';
import { DownloadIcon, EyeIcon, EyeOffIcon, ShieldCheckIcon, CheckCircleIcon, AlertTriangleIcon, XCircleIcon } from './Icons';
import { useAudits } from '../contexts/AuditContext';
import { useAppState } from '../contexts/WalletContext';

// Add this to make typescript happy about the autoTable plugin
declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
    }
}

interface AuditReportDisplayProps {
    report: ServiceReport;
}

const gradeConfig: Record<AuditGrade, { color: string; ringColor: string; bgColor: string; }> = {
    'A': { color: 'text-green-300', ringColor: 'ring-green-500', bgColor: 'bg-green-900/30' },
    'B': { color: 'text-teal-300', ringColor: 'ring-teal-500', bgColor: 'bg-teal-900/30' },
    'C': { color: 'text-yellow-300', ringColor: 'ring-yellow-500', bgColor: 'bg-yellow-900/30' },
    'D': { color: 'text-orange-300', ringColor: 'ring-orange-500', bgColor: 'bg-orange-900/30' },
};

const kycStatusConfig: Record<KycStatus, { color: string; ringColor: string; bgColor: string; icon: React.FC<{className?: string}> }> = {
    'Verified': { color: 'text-green-300', ringColor: 'ring-green-500', bgColor: 'bg-green-900/30', icon: CheckCircleIcon },
    'Needs Review': { color: 'text-yellow-300', ringColor: 'ring-yellow-500', bgColor: 'bg-yellow-900/30', icon: AlertTriangleIcon },
    'Rejected': { color: 'text-red-300', ringColor: 'ring-red-500', bgColor: 'bg-red-900/30', icon: XCircleIcon },
};

const severityOrder: Record<FindingSeverity, number> = {
    'Critical': 4,
    'High': 3,
    'Medium': 2,
    'Low': 1,
};

export const AuditReportDisplay: React.FC<AuditReportDisplayProps> = ({ report }) => {
    const { toggleVisibility } = useAudits();
    const { user } = useAppState();

    const downloadPdf = () => {
        const doc = new jsPDF();
        
        const svgIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>';
        const iconDataUrl = 'data:image/svg+xml;base64,' + btoa(svgIcon);
        
        doc.addImage(iconDataUrl, 'SVG', 14, 15, 12, 12);
        
        doc.setFontSize(20);
        doc.text('Fito Audit', 30, 22);
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128); // Set text to gray
        doc.text('by Fito Technology, LLC', 30, 27);
        doc.setTextColor(0, 0, 0); // Reset text color

        doc.setFontSize(16);
        doc.text(`Project: ${report.projectName}`, 14, 42);
        
        doc.setFontSize(12);
        doc.text(`Report ID: ${report.id}`, 14, 52);
        doc.text(`${serviceTypeDetails[report.serviceType].name} Result: ${report.grade}`, 14, 58);
        doc.text(`Date: ${new Date(report.createdAt).toLocaleDateString()}`, 14, 64);

        doc.setFontSize(11);
        const summaryLines = doc.splitTextToSize(report.summary, 180);
        doc.text(summaryLines, 14, 76);

        const tableColumn = ["Severity", "Title", "Description"];
        const tableRows: any[] = [];

        report.findings.forEach(finding => {
            const findingData = [
                finding.severity,
                finding.title,
                finding.description + '\n\nRecommendation:\n' + finding.recommendation,
            ];
            tableRows.push(findingData);
        });

        doc.autoTable({
            startY: 88,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            styles: { cellPadding: 2, fontSize: 8 },
            headStyles: { fillColor: [46, 46, 78] },
        });

        doc.save(`${report.projectName}_audit_report.pdf`);
    };
    
    const sortedFindings = [...report.findings].sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);
    
    const isOwner = user?.address.toLowerCase() === report.userId.toLowerCase();
    const isKyc = report.serviceType === 'KYC_SINGLE' || report.serviceType === 'KYC_TEAM';

    const renderResultDisplay = () => {
        if (isKyc) {
            const config = kycStatusConfig[report.grade as KycStatus];
            if (!config) return null;
            const Icon = config.icon;
            return (
                <div className={`p-6 rounded-xl border border-gray-800 ${config.bgColor}`}>
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className={`w-32 h-32 rounded-full flex items-center justify-center ring-4 ${config.ringColor} bg-gray-900`}>
                            <Icon className={`w-16 h-16 ${config.color}`} />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className={`text-2xl font-bold ${config.color} mb-2`}>{report.grade}</h2>
                            <p className="text-gray-300">{report.summary}</p>
                        </div>
                    </div>
                </div>
            )
        }
        
        const config = gradeConfig[report.grade as AuditGrade];
        if (!config) return null;
        return (
             <div className={`p-6 rounded-xl border border-gray-800 ${config.bgColor}`}>
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center ring-4 ${config.ringColor} bg-gray-900`}>
                        <span className={`text-6xl font-bold ${config.color}`}>{report.grade}</span>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-2xl font-bold text-white mb-2">Overall Summary</h2>
                        <p className="text-gray-300">{report.summary}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mb-1">
                           <h1 className="text-3xl font-bold text-white">{report.projectName}</h1>
                           <span className="flex items-center gap-1.5 bg-gray-800 text-indigo-300 px-3 py-1 rounded-full text-sm font-mono whitespace-nowrap">
                               <ShieldCheckIcon className="w-4 h-4 flex-shrink-0" />
                               <span>{report.id}</span>
                           </span>
                        </div>
                        <p className="text-gray-400">{serviceTypeDetails[report.serviceType].name} Report - Generated {new Date(report.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                         {isOwner && (
                            <button 
                                onClick={() => toggleVisibility(report.id)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                {report.isPublic ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                <span>{report.isPublic ? 'Make Private' : 'Make Public'}</span>
                            </button>
                        )}
                        <button 
                            onClick={downloadPdf}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors"
                        >
                            <DownloadIcon className="w-4 h-4" />
                            <span>Download PDF</span>
                        </button>
                    </div>
                </div>
            </div>

            {renderResultDisplay()}

            <div>
                <h2 className="text-2xl font-bold text-white mb-4">Findings ({sortedFindings.length})</h2>
                {sortedFindings.length > 0 ? (
                    <div className="space-y-4">
                        {sortedFindings.map((finding, index) => (
                            <AuditCard key={index} finding={finding} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-900 rounded-lg border border-dashed border-gray-700">
                        <h3 className="text-xl font-semibold text-gray-400">No Findings</h3>
                        <p className="text-gray-500 mt-2">The AI analysis did not identify any vulnerabilities or issues. Great job!</p>
                    </div>
                )}
            </div>
        </div>
    );
};
