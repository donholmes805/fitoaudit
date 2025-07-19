
import { ShieldCheckIcon } from './components/Icons';

export type Chain = "Fitochain" | "EVM" | "Solana";

export type FindingSeverity = "Low" | "Medium" | "High" | "Critical";

export interface Finding {
    severity: FindingSeverity;
    title: string;
    description: string;
    recommendation: string;
}

export type AuditGrade = "A" | "B" | "C" | "D";
export type KycStatus = "Verified" | "Needs Review" | "Rejected";
export type Grade = AuditGrade | KycStatus;

export type ServiceType = 'SMART_CONTRACT_AUDIT' | 'L1_L2_AUDIT' | 'PENETRATION_TEST' | 'KYC_SINGLE' | 'KYC_TEAM';

export const serviceTypeDetails: Record<ServiceType, { 
    name: string; 
    description: string; 
    longDescription: string;
    priceUSD: number;
    referralPriceUSD: number | null;
    referralPayoutUSD: number;
    icon: React.FC<{className?: string}>;
    iconBgColor: string;
    iconTextColor: string;
}> = {
    SMART_CONTRACT_AUDIT: {
        name: 'Smart-Contract Audit',
        description: 'In-depth static analysis and vulnerability scanning of your smart contract code.',
        longDescription: "Our AI-powered smart contract audit provides a line-by-line analysis of your Solidity or Rust code, identifying vulnerabilities before they can be exploited. We leverage Fito AI to detect common and complex issues, from reentrancy and integer overflows to flawed logic and access control vulnerabilities. The process is fast, comprehensive, and concludes with a detailed report containing an A-D grade, clear findings, and actionable recommendations to secure your on-chain assets and protect your users.",
        priceUSD: 750,
        referralPriceUSD: 250,
        referralPayoutUSD: 50,
        icon: ShieldCheckIcon,
        iconBgColor: "bg-green-900/50",
        iconTextColor: "text-green-400",
    },
    L1_L2_AUDIT: {
        name: 'L1/L2 Blockchain Audit',
        description: 'A comprehensive review of your blockchain\'s architecture, consensus, and economic model.',
        longDescription: "Go beyond the application layer and secure the foundation of your ecosystem. Our L1/L2 audit is a holistic review of your entire blockchain protocol, covering the consensus mechanism, network topology, cryptographic primitives, and economic models. Our AI simulates various network conditions and stress-tests your tokenomics to identify potential design flaws, centralization risks, and long-term sustainability issues, ensuring the core of your network is robust and secure.",
        priceUSD: 7500,
        referralPriceUSD: 2500,
        referralPayoutUSD: 350,
        icon: ShieldCheckIcon,
        iconBgColor: "bg-blue-900/50",
        iconTextColor: "text-blue-400",
    },
    PENETRATION_TEST: {
        name: 'Blockchain Penetration Testing',
        description: 'Simulate real-world attacks against your dApp, network, and infrastructure.',
        longDescription: "Static analysis is not enough. Our penetration testing service simulates a real-world attack on your entire dApp stack. Acting as malicious hackers, we actively probe your smart contracts, web frontend, APIs, and network infrastructure for exploitable weaknesses. This adversarial approach, guided by AI-driven attack vector analysis, uncovers vulnerabilities that only emerge under active exploitation, providing the ultimate test of your project's resilience.",
        priceUSD: 5000,
        referralPriceUSD: 1500,
        referralPayoutUSD: 175,
        icon: ShieldCheckIcon,
        iconBgColor: "bg-purple-900/50",
        iconTextColor: "text-purple-400",
    },
    KYC_SINGLE: {
        name: 'KYC Service (Single)',
        description: 'Automated identity verification for one project owner or team member.',
        longDescription: "Build trust and ensure regulatory compliance with our automated Know-Your-Customer service. Designed for Web3, we provide a streamlined and secure process for verifying the identities of your core team. Our AI analyzes government-issued IDs and other documents for authenticity, providing a clear and rapid assessment. Offering a 'KYC'd Team' badge is one of the strongest trust signals you can provide to your community and potential investors.",
        priceUSD: 250,
        referralPriceUSD: null,
        referralPayoutUSD: 50,
        icon: ShieldCheckIcon,
        iconBgColor: "bg-yellow-900/50",
        iconTextColor: "text-yellow-400",
    },
    KYC_TEAM: {
        name: 'KYC Service (Team of 5)',
        description: 'Identity verification for up to 5 team members at a discounted rate.',
        longDescription: "Build trust and ensure regulatory compliance with our automated Know-Your-Customer service. Designed for Web3, we provide a streamlined and secure process for verifying the identities of your core team. Our AI analyzes government-issued IDs and other documents for authenticity, providing a clear and rapid assessment. Offering a 'KYC'd Team' badge is one of the strongest trust signals you can provide to your community and potential investors.",
        priceUSD: 750,
        referralPriceUSD: null,
        referralPayoutUSD: 150,
        icon: ShieldCheckIcon,
        iconBgColor: "bg-yellow-900/50",
        iconTextColor: "text-yellow-400",
    },
};

export interface ServiceReport {
  id: string;
  userId: string;
  serviceType: ServiceType;
  projectName: string;
  details: Record<string, string>;
  grade: Grade;
  summary: string;
  findings: Finding[];
  isPublic: boolean;
  createdAt: string;
  referralCode?: string;
  // New fields for re-audits
  isReaudit?: boolean;
  parentAuditId?: string;
  remainingSubmissions?: number;
}

export interface User {
  id: string; // The user's wallet address, also used as a key
  address: string;
  isAdmin: boolean;
}
