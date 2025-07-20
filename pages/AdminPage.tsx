import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAudits } from '../contexts/AuditContext';
import { useAppState } from '../contexts/WalletContext';
import { EyeIcon, EyeOffIcon, Trash2Icon } from '../components/Icons';

export const AdminPage: React.FC = () => {
    const { audits, toggleVisibility, deleteAudit } = useAudits();
    const { user } = useAppState();

    if (!user || !user.isAdmin) {
        return <Navigate to="/" />;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h1>
            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-800">
                    <thead className="bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Project</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Grade</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {audits.map(audit => (
                            <tr key={audit.id} className="hover:bg-gray-800/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Link to={`/report/${audit.id}`} className="text-sm font-medium text-indigo-400 hover:text-indigo-300">{audit.projectName}</Link>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 truncate" style={{ maxWidth: '150px' }}>{audit.userId}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-300">{audit.grade}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(audit.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => toggleVisibility(audit.id)} className="text-gray-400 hover:text-white transition-colors" title={audit.isPublic ? 'Make Private' : 'Make Public'}>
                                            {audit.isPublic ? <EyeOffIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                                        </button>
                                        <button onClick={() => deleteAudit(audit.id)} className="text-red-500 hover:text-red-400 transition-colors" title="Delete Audit">
                                            <Trash2Icon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {audits.length === 0 && (
                     <div className="text-center py-16 text-gray-500">No audits found in the system.</div>
                 )}
            </div>
        </div>
    );
};