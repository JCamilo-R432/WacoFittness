export const COMPLIANCE_FRAMEWORKS = {
  SOC2: {
    id: 'SOC2',
    name: 'SOC 2 Type II',
    controls: [
      { id: 'CC6.1', name: 'Logical Access - Authentication', category: 'Access Control', automated: true },
      { id: 'CC6.2', name: 'Logical Access - New/Changed/Removed', category: 'Access Control', automated: true },
      { id: 'CC6.3', name: 'Role-Based Access Control', category: 'Access Control', automated: true },
      { id: 'CC7.1', name: 'System Monitoring', category: 'System Operations', automated: true },
      { id: 'CC7.2', name: 'Anomaly Detection', category: 'System Operations', automated: true },
      { id: 'CC8.1', name: 'Change Management', category: 'Change Management', automated: false },
      { id: 'CC9.1', name: 'Risk Mitigation', category: 'Risk Management', automated: false },
      { id: 'A1.1', name: 'Availability - Performance Monitoring', category: 'Availability', automated: true },
      { id: 'A1.2', name: 'Availability - Recovery Testing', category: 'Availability', automated: false },
      { id: 'PI1.1', name: 'Data Processing Integrity', category: 'Processing Integrity', automated: true },
      { id: 'C1.1', name: 'Confidentiality - Data Classification', category: 'Confidentiality', automated: false },
      { id: 'P1.1', name: 'Privacy Notice', category: 'Privacy', automated: false },
      { id: 'P4.1', name: 'Data Retention/Disposal', category: 'Privacy', automated: true },
    ],
  },
  HIPAA: {
    id: 'HIPAA',
    name: 'HIPAA',
    controls: [
      { id: 'PHI-ENC-01', name: 'PHI Encryption at Rest', category: 'Technical Safeguards', automated: true },
      { id: 'PHI-ENC-02', name: 'PHI Encryption in Transit', category: 'Technical Safeguards', automated: true },
      { id: 'PHI-AUD-01', name: 'PHI Access Audit Logs', category: 'Technical Safeguards', automated: true },
      { id: 'PHI-AUT-01', name: 'Unique User Identification', category: 'Technical Safeguards', automated: true },
      { id: 'PHI-AUTH-01', name: 'Emergency Access Procedure', category: 'Technical Safeguards', automated: false },
      { id: 'PHI-BAA-01', name: 'Business Associate Agreements', category: 'Administrative Safeguards', automated: false },
      { id: 'PHI-TRN-01', name: 'Workforce Training', category: 'Administrative Safeguards', automated: false },
    ],
  },
  GDPR: {
    id: 'GDPR',
    name: 'GDPR',
    controls: [
      { id: 'ART-6', name: 'Lawful Basis for Processing', category: 'Lawfulness', automated: false },
      { id: 'ART-7', name: 'Consent Management', category: 'Consent', automated: true },
      { id: 'ART-13', name: 'Privacy Notice at Collection', category: 'Transparency', automated: false },
      { id: 'ART-17', name: 'Right to Erasure', category: 'Data Subject Rights', automated: true },
      { id: 'ART-20', name: 'Data Portability', category: 'Data Subject Rights', automated: true },
      { id: 'ART-25', name: 'Data Protection by Design', category: 'Privacy by Design', automated: false },
      { id: 'ART-32', name: 'Security of Processing', category: 'Security', automated: true },
      { id: 'ART-33', name: 'Breach Notification', category: 'Breach Response', automated: false },
      { id: 'ART-35', name: 'Data Protection Impact Assessment', category: 'DPIA', automated: false },
    ],
  },
} as const;

export type ComplianceFramework = keyof typeof COMPLIANCE_FRAMEWORKS;
