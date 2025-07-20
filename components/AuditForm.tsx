
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ServiceReport, ServiceType, serviceTypeDetails } from '../types';
import { useAppState } from '../contexts/WalletContext';
import { useAudits } from '../contexts/AuditContext';
import { ethers } from 'ethers';

const OWNER_WALLET = '0x51EA5875D6b7E3B517ddA9fbC1B4FE61d566BF98';

interface AuditFormProps {
    auditToReaudit?: ServiceReport;
    initialReferralCode?: string | null;
}

export const AuditForm: React.FC<AuditFormProps> = ({ auditToReaudit, initialReferralCode }) => {
    const navigate = useNavigate();
    const { user, signer, bnbPrice, addToast } = useAppState();
    const { submitServiceRequest, loading: isSubmitting } = useAudits();
    
    // State
    const [serviceType, setServiceType] = useState<ServiceType>('SMART_CONTRACT_AUDIT');
    const [details, setDetails] = useState<Record<string, string>>({
        projectName: auditToReaudit?.projectName || '',
        chain: auditToReaudit?.details?.chain || 'EVM',
        contractCode: auditToReaudit?.details?.contractCode || '',
        githubRepo: auditToReaudit?.details?.githubRepo || '',
        websiteUrl: auditToReaudit?.details?.websiteUrl || '',
        documentLinks: auditToReaudit?.details?.documentLinks || '',
        contactEmail: auditToReaudit?.details?.contactEmail || '',
    });
    const [referralCode, setReferralCode] = useState(initialReferralCode || '');
    const [isReferralValid, setIsReferralValid] = useState(false);

    // Derived state
    const isReaudit = !!(auditToReaudit && auditToReaudit.remainingSubmissions && auditToReaudit.remainingSubmissions > 0);
    
    // Effects
    useEffect(() => {
        if (auditToReaudit) {
            setServiceType(auditToReaudit.serviceType);
        }
    }, [auditToReaudit]);

    useEffect(() => {
        setIsReferralValid(ethers.isAddress(referralCode));
    }, [referralCode]);

    const serviceInfo = serviceTypeDetails[serviceType];
    const originalPriceUSD = serviceInfo.priceUSD;
    const referralPriceUSD = serviceInfo.referralPriceUSD;
    const hasReferralDiscount = isReferralValid && referralPriceUSD !== null;
    const finalPriceUSD = hasReferralDiscount ? referralPriceUSD : originalPriceUSD;
    const savingsUSD = hasReferralDiscount ? originalPriceUSD - referralPriceUSD : 0;

    const priceBNB = useMemo(() => {
        if (!bnbPrice || !finalPriceUSD) return null;
        return finalPriceUSD / bnbPrice;
    }, [finalPriceUSD, bnbPrice]);

    // Handlers
    const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user || !signer) {
            addToast('Please connect your wallet first.', 'error');
            return;
        }

        if (isSubmitting) return;

        // Admin can submit for free
        if (user.isAdmin) {
            addToast('Submitting as admin (free)...', 'info');
            const newReport = await submitServiceRequest(serviceType, details, undefined, auditToReaudit?.id);
            if (newReport) {
                addToast('Service submitted successfully!', 'success');
                navigate(`/report/${newReport.id}`);
            }
            return;
        }

        if (isReaudit) {
            addToast('Submitting re-audit...', 'info');
            const newReport = await submitServiceRequest(serviceType, details, undefined, auditToReaudit?.id);
            if (newReport) {
                addToast('Re-audit submitted successfully!', 'success');
                navigate(`/report/${newReport.id}`);
            }
            return;
        }

        if (!bnbPrice || !priceBNB || priceBNB <= 0) {
            addToast('BNB price is not available. Please try again later.', 'error');
            return;
        }

        try {
            const tx = await signer.sendTransaction({
                to: OWNER_WALLET,
                value: ethers.parseEther(priceBNB.toFixed(18)), // Send calculated BNB amount
            });
            
            addToast('Transaction sent... awaiting confirmation.', 'info');
            await tx.wait(); // Wait for the transaction to be mined
            addToast('Payment confirmed! Submitting service request...', 'success');

            const newReport = await submitServiceRequest(serviceType, details, isReferralValid ? referralCode : undefined);
             if (newReport) {
                addToast('Service submitted successfully!', 'success');
                navigate(`/report/${newReport.id}`);
            }

        } catch (error: any) {
            console.error("Transaction failed:", error);
            addToast(error?.reason || 'Transaction was rejected or failed.', 'error');
        }

    }, [
        user, signer, bnbPrice, priceBNB, serviceType, details, isReferralValid, referralCode, 
        isReaudit, auditToReaudit, isSubmitting, addToast, navigate, submitServiceRequest
    ]);
    
    const renderInputs = () => {
        switch (serviceType) {
            case 'SMART_CONTRACT_AUDIT':
                return <>
                    <InputField name="projectName" value={details.projectName} onChange={handleDetailChange} label="Project Name" disabled={isReaudit} required/>
                    <SelectField name="chain" value={details.chain} onChange={handleDetailChange} label="Chain" disabled={isReaudit} options={['EVM', 'Solana', 'Fitochain']}/>
                    <TextareaField name="contractCode" value={details.contractCode} onChange={handleDetailChange} label="Smart Contract Code" rows={10} required/>
                </>;
            case 'L1_L2_AUDIT':
                return <>
                    <InputField name="projectName" value={details.projectName} onChange={handleDetailChange} label="Project Name" disabled={isReaudit} required/>
                    <InputField name="githubRepo" value={details.githubRepo} onChange={handleDetailChange} label="Public GitHub Repository URL" disabled={isReaudit} required/>
                </>
            case 'PENETRATION_TEST':
                 return <>
                    <InputField name="projectName" value={details.projectName} onChange={handleDetailChange} label="Project Name" disabled={isReaudit} required/>
                    <InputField name="websiteUrl" value={details.websiteUrl} onChange={handleDetailChange} label="dApp / Website URL" disabled={isReaudit} required/>
                </>
            case 'KYC_SINGLE':
            case 'KYC_TEAM':
                 return <>
                    <InputField name="projectName" value={details.projectName} onChange={handleDetailChange} label="Project / Team Name" required/>
                    <InputField name="contactEmail" value={details.contactEmail} onChange={handleDetailChange} label="Primary Contact Email" type="email" required/>
                    <TextareaField name="documentLinks" value={details.documentLinks} onChange={handleDetailChange} label="Secure Links to Documents" rows={4} placeholder="e.g., links to a secure cloud storage folder with government IDs, proof of address, etc." required/>
                </>
            default:
                return null;
        }
    };
    
    // Loading/Button state text
    let buttonText = 'Submit Request';
    if(isSubmitting) {
        buttonText = 'Submitting...';
    } else if (user?.isAdmin) {
        buttonText = 'Submit as Admin (Free)';
    } else if (isReaudit) {
        buttonText = 'Submit Re-audit (Free)';
    } else if (!bnbPrice) {
        buttonText = 'Loading Price...';
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {!isReaudit && (
                 <div>
                    <label htmlFor="serviceType" className="block text-sm font-medium text-gray-300 mb-1">Service Type</label>
                    <select id="serviceType" name="serviceType" value={serviceType} onChange={(e) => setServiceType(e.target.value as ServiceType)} className="w-full bg-gray-800 border-gray-700 text-white rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500">
                        {Object.entries(serviceTypeDetails).map(([key, { name }]) => (
                            <option key={key} value={key}>{name}</option>
                        ))}
                    </select>
                </div>
            )}
            
            {renderInputs()}

            {!isReaudit && !user?.isAdmin && (
                <div>
                    <InputField name="referralCode" value={referralCode} onChange={e => setReferralCode(e.target.value)} label="Referral Code (Optional)" placeholder="Enter wallet address..."/>
                    {referralCode && (
                        <p className={`text-xs mt-1 ${isReferralValid ? 'text-green-400' : 'text-red-400'}`}>
                            {isReferralValid ? 'Valid referral code applied!' : 'Invalid referral address.'}
                        </p>
                    )}
                </div>
            )}

            {!isReaudit && !user?.isAdmin && (
                 <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 space-y-2">
                    <h3 className="text-lg font-bold text-white mb-2">Cost Summary</h3>
                    
                    <div className="flex justify-between items-center text-gray-400">
                        <span>Regular Price:</span>
                        <span className={`font-mono ${hasReferralDiscount ? 'line-through' : 'text-white'}`}>
                            ${originalPriceUSD.toFixed(2)}
                        </span>
                    </div>

                    {referralPriceUSD !== null && (
                        <div className="flex justify-between items-center text-gray-400">
                            <span>Referral Price:</span>
                            <span className="font-mono">${referralPriceUSD.toFixed(2)}</span>
                        </div>
                    )}
                    
                    {hasReferralDiscount && savingsUSD > 0 && (
                        <div className="flex justify-between items-center text-green-400 font-semibold">
                            <span>You Save:</span>
                            <span className="font-mono">${savingsUSD.toFixed(2)}</span>
                        </div>
                    )}
                    
                    <div className="flex justify-between items-center text-gray-300 pt-2 border-t border-gray-700/50">
                        <span className="font-bold">Total Due in BNB:</span>
                        {bnbPrice && priceBNB ? (
                            <span className="font-bold text-white font-mono">{priceBNB.toFixed(4)} BNB</span>
                        ) : (
                             <div className="w-24 h-6 bg-gray-700 rounded animate-pulse"></div>
                        )}
                    </div>
                </div>
            )}
            
            <button
                type="submit"
                disabled={isSubmitting || (!isReaudit && !user?.isAdmin && !bnbPrice)}
                className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex justify-center items-center"
            >
                {buttonText}
            </button>
        </form>
    );
};

// Helper components for form fields
const InputField: React.FC<any> = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input {...props} id={props.name} className="w-full bg-gray-800 border-gray-700 text-white rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-700" />
    </div>
);

const TextareaField: React.FC<any> = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <textarea {...props} id={props.name} className="w-full bg-gray-800 border-gray-700 text-white rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500" />
    </div>
);

const SelectField: React.FC<any> = ({ label, options, ...props }) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <select {...props} id={props.name} className="w-full bg-gray-800 border-gray-700 text-white rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-700">
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);
