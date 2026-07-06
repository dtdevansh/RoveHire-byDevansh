import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// ─────────────────────────────────────────────────────────────
// Offer Letter PDF Template
// ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    padding: 60,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.6,
    color: '#1a1a1a',
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 15,
  },
  companyName: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  date: {
    marginBottom: 20,
    color: '#6b7280',
  },
  greeting: {
    marginBottom: 15,
    fontFamily: 'Helvetica-Bold',
  },
  paragraph: {
    marginBottom: 12,
    textAlign: 'justify' as const,
  },
  termsSection: {
    marginTop: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
  },
  termsTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 12,
    color: '#1e40af',
  },
  termRow: {
    flexDirection: 'row' as const,
    marginBottom: 8,
  },
  termLabel: {
    width: 150,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
  },
  termValue: {
    flex: 1,
    color: '#1a1a1a',
  },
  signatureSection: {
    marginTop: 40,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
  signatureBlock: {
    width: 200,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#9ca3af',
    marginBottom: 5,
    marginTop: 40,
  },
  signatureLabel: {
    fontSize: 9,
    color: '#6b7280',
  },
  footer: {
    position: 'absolute' as const,
    bottom: 30,
    left: 60,
    right: 60,
    fontSize: 8,
    color: '#9ca3af',
    textAlign: 'center' as const,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
});

export interface OfferLetterData {
  candidateName: string;
  roleTitle: string;
  salaryCurrency: string;
  salaryAmount: number;
  startDate: string;
  managerName: string;
  location: string;
}

export function OfferLetter({ data }: { data: OfferLetterData }) {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedSalary = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: data.salaryCurrency,
    minimumFractionDigits: 0,
  }).format(data.salaryAmount);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.companyName}>Rove</Text>
          <Text style={styles.subtitle}>Official Offer of Employment</Text>
        </View>

        <Text style={styles.date}>{today}</Text>

        <Text style={styles.greeting}>Dear {data.candidateName},</Text>

        <Text style={styles.paragraph}>
          We are delighted to extend this formal offer of employment to you for
          the position of {data.roleTitle} at Rove. After careful consideration
          of your qualifications, experience, and interview performance, we are
          confident that you will be an outstanding addition to our team.
        </Text>

        <Text style={styles.paragraph}>
          Please review the terms of employment outlined below. This offer is
          contingent upon successful completion of all required pre-employment
          processes, including the execution of a Non-Disclosure Agreement.
        </Text>

        <View style={styles.termsSection}>
          <Text style={styles.termsTitle}>Terms of Employment</Text>
          <View style={styles.termRow}>
            <Text style={styles.termLabel}>Position:</Text>
            <Text style={styles.termValue}>{data.roleTitle}</Text>
          </View>
          <View style={styles.termRow}>
            <Text style={styles.termLabel}>Compensation:</Text>
            <Text style={styles.termValue}>
              {formattedSalary} per annum ({data.salaryCurrency})
            </Text>
          </View>
          <View style={styles.termRow}>
            <Text style={styles.termLabel}>Start Date:</Text>
            <Text style={styles.termValue}>{data.startDate}</Text>
          </View>
          <View style={styles.termRow}>
            <Text style={styles.termLabel}>Reporting Manager:</Text>
            <Text style={styles.termValue}>{data.managerName}</Text>
          </View>
          <View style={styles.termRow}>
            <Text style={styles.termLabel}>Work Location:</Text>
            <Text style={styles.termValue}>{data.location}</Text>
          </View>
        </View>

        <Text style={styles.paragraph}>
          We kindly request that you confirm your acceptance of this offer at
          your earliest convenience. Should you have any questions or require
          clarification on any of the terms, please do not hesitate to contact
          us.
        </Text>

        <Text style={styles.paragraph}>
          We look forward to welcoming you to the Rove team and are excited
          about the contributions you will make.
        </Text>

        <View style={styles.signatureSection}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>
              Authorized Signatory — Rove
            </Text>
          </View>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>
              {data.candidateName} — Candidate
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>
          This document is confidential and intended solely for the named
          recipient. Rove — Confidential
        </Text>
      </Page>
    </Document>
  );
}
