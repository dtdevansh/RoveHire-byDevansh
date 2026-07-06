import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// ─────────────────────────────────────────────────────────────
// Non-Disclosure Agreement PDF Template
// ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    padding: 60,
    fontFamily: 'Helvetica',
    fontSize: 10,
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
  title: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center' as const,
    marginBottom: 20,
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  date: {
    marginBottom: 15,
    color: '#6b7280',
  },
  paragraph: {
    marginBottom: 10,
    textAlign: 'justify' as const,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginTop: 15,
    marginBottom: 8,
    color: '#1e40af',
  },
  listItem: {
    flexDirection: 'row' as const,
    marginBottom: 4,
    paddingLeft: 15,
  },
  bullet: {
    width: 15,
    color: '#2563eb',
  },
  listText: {
    flex: 1,
    textAlign: 'justify' as const,
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

export interface NDAData {
  candidateName: string;
  roleTitle: string;
  startDate: string;
}

export function NDA({ data }: { data: NDAData }) {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.companyName}>Rove</Text>
          <Text style={styles.subtitle}>Legal Document</Text>
        </View>

        <Text style={styles.title}>NON-DISCLOSURE AGREEMENT</Text>

        <Text style={styles.date}>Effective Date: {today}</Text>

        <Text style={styles.paragraph}>
          This Non-Disclosure Agreement (&quot;Agreement&quot;) is entered into
          between Rove (&quot;Company&quot;) and {data.candidateName}{' '}
          (&quot;Recipient&quot;), in connection with the Recipient&apos;s
          employment as {data.roleTitle}, commencing on {data.startDate}.
        </Text>

        <Text style={styles.sectionTitle}>
          1. Definition of Confidential Information
        </Text>
        <Text style={styles.paragraph}>
          &quot;Confidential Information&quot; includes all non-public
          information disclosed by the Company to the Recipient, whether orally,
          in writing, or by any other means, including but not limited to:
        </Text>
        <View style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.listText}>
            Trade secrets, business strategies, and operational plans
          </Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.listText}>
            Technical data, source code, algorithms, and product roadmaps
          </Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.listText}>
            Customer and vendor lists, financial data, and pricing information
          </Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.listText}>
            Employee information and internal communications
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          2. Obligations of the Recipient
        </Text>
        <Text style={styles.paragraph}>
          The Recipient agrees to: (a) hold all Confidential Information in
          strict confidence; (b) not disclose Confidential Information to any
          third party without prior written consent of the Company; (c) use
          Confidential Information solely for the purpose of performing duties as
          an employee of the Company; and (d) take all reasonable measures to
          protect the secrecy of the Confidential Information.
        </Text>

        <Text style={styles.sectionTitle}>3. Duration</Text>
        <Text style={styles.paragraph}>
          The obligations under this Agreement shall remain in effect during the
          Recipient&apos;s employment and for a period of two (2) years
          following termination of employment, regardless of the reason for
          termination.
        </Text>

        <Text style={styles.sectionTitle}>4. Return of Materials</Text>
        <Text style={styles.paragraph}>
          Upon termination of employment or upon the Company&apos;s request, the
          Recipient shall promptly return or destroy all materials containing
          Confidential Information and certify such return or destruction in
          writing.
        </Text>

        <Text style={styles.sectionTitle}>5. Governing Law</Text>
        <Text style={styles.paragraph}>
          This Agreement shall be governed by and construed in accordance with
          applicable laws. Any disputes arising under this Agreement shall be
          resolved through binding arbitration.
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
              {data.candidateName} — Recipient
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>
          This document is confidential and legally binding. Rove —
          Non-Disclosure Agreement
        </Text>
      </Page>
    </Document>
  );
}
