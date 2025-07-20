import { GoogleGenAI, Type } from "@google/genai";

// Self-contained type definitions to ensure the function is portable and has no external dependencies.
type ServiceType = 'SMART_CONTRACT_AUDIT' | 'L1_L2_AUDIT' | 'PENETRATION_TEST' | 'KYC_SINGLE' | 'KYC_TEAM';

// Define simple types for the request and response objects to avoid needing Vercel-specific packages.
interface VercelRequest {
    method: string;
    body: {
        serviceType: ServiceType;
        details: Record<string, any>;
    };
}

interface VercelResponse {
    status: (code: number) => {
        json: (data: any) => void;
    };
}

const generateSystemInstruction = (serviceType: ServiceType, details: Record<string, any>): string => {
    let prompt = `You are an AI assistant specialized in blockchain security auditing. Your task is to analyze the provided information and produce a highly detailed, verbose, and exhaustive security report. Your analysis must be thorough, professional, and actionable. Each finding's description and recommendation should be multi-paragraph and include as much detail as possible. The summary should be a comprehensive overview that justifies the final grade/status.
Respond ONLY with a single, valid JSON object that strictly adheres to the provided schema. Do not include any additional text, comments, formatting, or markdown code fences.`;

    switch (serviceType) {
        case 'SMART_CONTRACT_AUDIT':
            prompt += `\n\nService: Smart Contract Audit
            Analyze the following smart contract code. For the 'grade' field, you must return one of these exact string values: "A", "B", "C", or "D".
            Your analysis must be exhaustive. For each function, analyze gas usage, logic, and potential edge cases. For each identified vulnerability, provide a multi-paragraph description explaining the technical details of the flaw, a practical exploit scenario, its potential business impact, and a clear, step-by-step recommendation with specific code examples for mitigation. Cover all common vulnerabilities including but not limited to: reentrancy, integer overflow/underflow, access control issues, front-running, unchecked external calls, gas optimization flaws, and logical errors.
            Project Name: ${details.projectName}
            Chain: ${details.chain}
            Contract Code:
            \`\`\`
            ${details.contractCode}
            \`\`\`
            `;
            break;
        case 'L1_L2_AUDIT':
            prompt += `\n\nService: L1/L2 Blockchain Audit
            Analyze the following blockchain architecture based on its public repository. For the 'grade' field, you must return one of these exact string values: "A", "B", "C", or "D".
            Provide a deep-dive analysis. Your review of the consensus mechanism should include its security properties, trade-offs, and comparison to established alternatives. The tokenomics review must include stress-test scenarios for price volatility, network load, and potential economic exploits. Discuss any potential centralization vectors in governance, validator set, or infrastructure. Your findings should be backed by evidence from the repository and documentation.
            Project Name: ${details.projectName}
            GitHub Repository: ${details.githubRepo}
            `;
            break;
        case 'PENETRATION_TEST':
            prompt += `\n\nService: Blockchain Penetration Test Plan
            Based on the provided dApp URL, devise a comprehensive penetration testing plan suitable for a professional security team. Do not perform the test. For the 'grade' field, you must return one of these exact string values: "A", "B", "C", or "D", reflecting a pre-test assessment of the project's attack surface.
            Outline specific tools (e.g., Foundry, Hardhat, ZAP, Burp Suite) and techniques for each step. For web security, detail tests for the OWASP Top 10 vulnerabilities. For smart contract interaction, describe how you would stage attacks like oracle manipulation or transaction ordering attacks on a forked mainnet. The grade must be justified by a detailed breakdown of potential weak points.
            Project Name: ${details.projectName}
            Website URL: ${details.websiteUrl}
            `;
            break;
        case 'KYC_SINGLE':
        case 'KYC_TEAM':
            prompt += `\n\nService: AI-Powered KYC Document Analysis
            Analyze the provided information as a highly cautious compliance officer trying to prevent sophisticated fraud. For the 'grade' field, you must return one of these exact string values: "Verified", "Needs Review", or "Rejected".
            The summary must explain the reasoning process behind the status. List every single observation as a finding, no matter how minor. For a 'Needs Review' status, provide a precise checklist of manual verification steps and required additional information. For a 'Rejected' status, provide a clear, non-negotiable reason.
            Project Name: ${details.projectName}
            Document Links Description: ${details.documentLinks}
            Contact Email: ${details.contactEmail}
            `;
            break;
    }
    return prompt;
};

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        grade: { type: Type.STRING, description: "For audits, an overall grade from A (best) to D (worst). For KYC, a status of Verified, Needs Review, or Rejected.", enum: ["A", "B", "C", "D", "Verified", "Needs Review", "Rejected"] },
        summary: { type: Type.STRING, description: "A concise, one or two-sentence summary of the overall security posture and justification for the grade/status." },
        findings: {
            type: Type.ARRAY,
            description: "A list of specific vulnerabilities or issues found.",
            items: {
                type: Type.OBJECT,
                properties: {
                    severity: { type: Type.STRING, description: "The severity of the finding.", enum: ["Low", "Medium", "High", "Critical"] },
                    title: { type: Type.STRING, description: "A short, descriptive title for the finding." },
                    description: { type: Type.STRING, description: "A detailed explanation of the vulnerability or issue." },
                    recommendation: { type: Type.STRING, description: "Actionable steps to fix the issue." },
                },
                required: ["severity", "title", "description", "recommendation"],
            },
        },
    },
    required: ["grade", "summary", "findings"],
};


export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!process.env.API_KEY) {
        return res.status(500).json({ error: 'API key is not configured on the server.' });
    }

    try {
        const { serviceType, details } = req.body;

        if (!serviceType || !details) {
            return res.status(400).json({ error: 'Missing serviceType or details in request body.' });
        }

        const systemInstruction = generateSystemInstruction(serviceType, details);
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: systemInstruction,
            config: {
                temperature: 0.2,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const geminiJson = JSON.parse(response.text);
        return res.status(200).json(geminiJson);

    } catch (e: any) {
        console.error("Gemini API Error:", e);
        return res.status(500).json({ error: 'Failed to get a response from the AI service.', details: e.message });
    }
}