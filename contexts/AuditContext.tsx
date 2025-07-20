
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { ServiceReport, ServiceType } from '../types';
import { useAppState } from './WalletContext';

interface AuditContextType {
    audits: ServiceReport[];
    loading: boolean;
    error: string | null;
    submitServiceRequest: (serviceType: ServiceType, details: Record<string, any>, referralCode?: string, parentAuditId?: string) => Promise<ServiceReport | null>;
    getAuditById: (id: string) => ServiceReport | undefined;
    toggleVisibility: (id: string) => void;
    deleteAudit: (id: string) => void;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

export const AuditProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [audits, setAudits] = useState<ServiceReport[]>(() => {
        try {
            const storedAudits = window.localStorage.getItem('fito_all_audits');
            return storedAudits ? JSON.parse(storedAudits) : [];
        } catch (error) {
            console.error("Failed to read audits from localStorage", error);
            return [];
        }
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { user, addToast } = useAppState();

    const getAuditById = useCallback((id: string) => audits.find(a => a.id === id), [audits]);

    const submitServiceRequest = useCallback(async (serviceType: ServiceType, details: Record<string, any>, referralCode?: string, parentAuditId?: string): Promise<ServiceReport | null> => {
        if (!user) {
            addToast("Please connect your wallet before submitting a request.", 'error');
            setError("Please connect your wallet before submitting a request.");
            return null;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ serviceType, details }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'The AI service returned an error.');
            }
            
            const isEligibleForReaudits = serviceType === 'SMART_CONTRACT_AUDIT' || serviceType === 'L1_L2_AUDIT';
            
            const newReport: ServiceReport = {
                id: `FA-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
                userId: user.address,
                serviceType,
                projectName: details.projectName,
                details,
                grade: data.grade,
                summary: data.summary,
                findings: data.findings,
                isPublic: true,
                createdAt: new Date().toISOString(),
                referralCode: referralCode,
                isReaudit: !!parentAuditId,
                parentAuditId: parentAuditId,
                remainingSubmissions: !parentAuditId && isEligibleForReaudits ? 2 : undefined,
            };
            
            setAudits(prev => {
                let updatedAudits = [...prev];
                if (parentAuditId) {
                    updatedAudits = updatedAudits.map(audit => {
                        if (audit.id === parentAuditId) {
                            return {
                                ...audit,
                                remainingSubmissions: (audit.remainingSubmissions ?? 1) - 1,
                            };
                        }
                        return audit;
                    });
                }
                const finalAudits = [newReport, ...updatedAudits];
                 try {
                    window.localStorage.setItem('fito_all_audits', JSON.stringify(finalAudits));
                } catch (error) {
                    console.error("Failed to save new audit to localStorage", error);
                    addToast("Could not save audit data.", "error");
                }
                return finalAudits;
            });
            return newReport;

        } catch (e: any) {
            const errorMessage = e.message || 'An unexpected error occurred.';
            setError(errorMessage);
            addToast(errorMessage, 'error');
            return null;
        } finally {
            setLoading(false);
        }
    }, [user, addToast]);
    
    const toggleVisibility = useCallback((id: string) => {
        setAudits(prevAudits => {
            const updatedAudits = prevAudits.map(a => a.id === id ? { ...a, isPublic: !a.isPublic } : a);
            try {
                window.localStorage.setItem('fito_all_audits', JSON.stringify(updatedAudits));
            } catch (error) {
                console.error("Failed to save visibility change to localStorage", error);
                addToast("Could not update report visibility.", "error");
            }
            return updatedAudits;
        });
    }, [addToast]);
    
    const deleteAudit = useCallback((id: string) => {
        setAudits(prevAudits => {
            const updatedAudits = prevAudits.filter(a => a.id !== id);
             try {
                window.localStorage.setItem('fito_all_audits', JSON.stringify(updatedAudits));
            } catch (error) {
                console.error("Failed to save deletion to localStorage", error);
                addToast("Could not delete report.", "error");
            }
            return updatedAudits;
        });
    }, [addToast]);

    const value = { audits, loading, error, submitServiceRequest, getAuditById, toggleVisibility, deleteAudit };

    return (
        <AuditContext.Provider value={value}>
            {children}
        </AuditContext.Provider>
    );
};

export const useAudits = (): AuditContextType => {
    const context = useContext(AuditContext);
    if (!context) {
        throw new Error('useAudits must be used within an AuditProvider');
    }
    return context;
};
