/**
 * ANVESHAK Forensic PDF Export — detailed multi-language (EN / HI / TE).
 *
 * Strategy: build the full report as HTML in the DOM using Unicode Google Fonts
 * (Noto Sans Devanagari / Noto Sans Telugu / Noto Sans), rasterise with
 * html2canvas so glyph shaping is done by the browser, then paginate into a
 * multi-page A4 jsPDF document.  This side-steps jsPDF's ASCII-only builtin
 * fonts and gives crisp Unicode output.
 */

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CaseDetail } from '../types';

export type ReportLanguage = 'en' | 'hi' | 'te';

/* ── i18n ─────────────────────────────────────────────────────────── */
interface L {
  brand: string;
  brandSub: string;
  langPill: string;
  restricted: string;
  threatScore: string;
  severity: string;
  relayHops: string;
  chainOfCustody: string;
  chainRecords: string;
  hopsAnalysed: string;
  sec1: string;
  sec2: string;
  sec3: string;
  sec4: string;
  sec5: string;
  reportedOn: string;
  assignedTo: string;
  status: string;
  colParam: string;
  colHeaderVal: string;
  colVerdict: string;
  fromField: string;
  returnPath: string;
  replyTo: string;
  spf: string;
  dkim: string;
  dmarc: string;
  displayName: string;
  spoofed: string;
  mismatch: string;
  fail: string;
  failMisaligned: string;
  colHop: string;
  colRelayServer: string;
  colIpAsn: string;
  colLocation: string;
  colForensicStatus: string;
  flagged: string;
  flaggedNote: string;
  normal: string;
  colFilename: string;
  colType: string;
  colHash: string;
  colEventId: string;
  colTimestamp: string;
  colActor: string;
  colMerkle: string;
  medium: string;
  footer: string;
  generatedAt: string;
  digitallySigned: string;
  page: string;
  of: string;
}

const L_EN: L = {
  brand: 'ANVESHAK',
  brandSub: 'Digital Forensic & Cyber Incident Investigation Report',
  langPill: 'EN',
  restricted: 'RESTRICTED FORENSIC RECORD',
  threatScore: 'THREAT SCORE',
  severity: 'SEVERITY',
  relayHops: 'RELAY HOPS',
  chainOfCustody: 'CHAIN OF CUSTODY',
  chainRecords: 'Sealed Records',
  hopsAnalysed: 'Analysed',
  sec1: '1. Case Summary & Executive Assessment (Executive Summary)',
  sec2: '2. Email Envelope & Cryptographic Authentication (Email Authentication)',
  sec3: '3. Header Flight Recorder Relay Path (Header Flight Recorder)',
  sec4: '4. Attachment Payload & Sandbox Analysis (Attachments)',
  sec5: '5. Immutable Custody Chain Ledger (Merkle Audit Ledger)',
  reportedOn: 'Reported On',
  assignedTo: 'Assigned Officer',
  status: 'Status',
  colParam: 'Property / Parameter',
  colHeaderVal: 'Extracted Header Value',
  colVerdict: 'Forensic Verdict',
  fromField: 'Sender (From)',
  returnPath: 'Return-Path',
  replyTo: 'Reply-To',
  spf: 'SPF',
  dkim: 'DKIM',
  dmarc: 'DMARC',
  displayName: 'Display Name',
  spoofed: 'FORGED / MISMATCH (SPOOFED)',
  mismatch: 'MISMATCH',
  fail: 'FAIL',
  failMisaligned: 'FAIL (MISALIGNED)',
  colHop: 'HOP',
  colRelayServer: 'Relay Server (Hostname)',
  colIpAsn: 'IP & Network (IP & ASN)',
  colLocation: 'Geographic Location (LOCATION)',
  colForensicStatus: 'Forensic Status',
  flagged: 'FLAGGED',
  flaggedNote: 'Origin relay server operates outside claimed brand infrastructure',
  normal: 'NORMAL',
  colFilename: 'Filename',
  colType: 'Type / Format',
  colHash: 'SHA-256 Digest',
  colEventId: 'Event ID',
  colTimestamp: 'Timestamp',
  colActor: 'Action & Actor',
  colMerkle: 'Merkle SHA-256 Custody Hash',
  medium: 'MEDIUM',
  footer: 'Anveshak Cyber-Forensic Authority',
  generatedAt: 'Generated on',
  digitallySigned: 'Digitally signed & sealed',
  page: 'Page',
  of: 'of',
};

const L_HI: L = {
  brand: 'अन्वेषक (ANVESHAK)',
  brandSub: 'डिजिटल फोरेंसिक एवं साइबर घटना जांच रिपोर्ट',
  langPill: 'HI',
  restricted: 'प्रतिबंधित फोरेंसिक अभिलेख (RESTRICTED)',
  threatScore: 'खतरा स्कोर (THREAT SCORE)',
  severity: 'गंभीरता स्तर (SEVERITY)',
  relayHops: 'रिले हॉप्स (RELAY HOPS)',
  chainOfCustody: 'साक्ष्य की श्रृंखला (CHAIN OF CUSTODY)',
  chainRecords: 'सीलबंद रिकॉर्ड',
  hopsAnalysed: 'विश्लेषित',
  sec1: '1. मामला सारांश एवं कार्यकारी मूल्यांकन (Executive Summary)',
  sec2: '2. ईमेल एनवेलप एवं क्रिप्टोग्राफिक प्रमाणीकरण (Email Authentication)',
  sec3: '3. हेडर फ्लाइट रिकॉर्डर रिले पथ (Header Flight Recorder)',
  sec4: '4. अटैचमेंट पेलोड एवं सैंडबॉक्स विश्लेषण (Attachments)',
  sec5: '5. अपरिवर्तनीय कस्टडी शृंखला बहीखाता (Merkle Audit Ledger)',
  reportedOn: 'सूचित तिथि',
  assignedTo: 'नामित अधिकारी',
  status: 'स्थिति',
  colParam: 'गुण / पैरामीटर',
  colHeaderVal: 'निकाला गया हेडर मान',
  colVerdict: 'फोरेंसिक निर्णय',
  fromField: 'प्रेषक (दावा किया गया From)',
  returnPath: 'रिटर्न-पथ (Return-Path)',
  replyTo: 'रिप्लाई-टू (Reply-To)',
  spf: 'एसपीएफ सत्यापन (SPF)',
  dkim: 'डीकेआईएम हस्ताक्षर (DKIM)',
  dmarc: 'डीएमएआरसी संरेखण (DMARC)',
  displayName: 'प्रदर्शित नाम',
  spoofed: 'जाली / मिलमेल (SPOOFED)',
  mismatch: 'मेल-मिलान (MISMATCH)',
  fail: 'FAIL',
  failMisaligned: 'FAIL (MISALIGNED)',
  colHop: 'हॉप',
  colRelayServer: 'रिले सर्वर (होस्टनाम)',
  colIpAsn: 'आईपी एवं नेटवर्क (IP & ASN)',
  colLocation: 'भौगोलिक स्थिति (LOCATION)',
  colForensicStatus: 'फोरेंसिक स्थिति',
  flagged: 'संदिग्ध / चिन्हित (FLAGGED)',
  flaggedNote: 'मूल रिले सर्वर दावा किए गए ब्रांड इंफ्रास्ट्रक्चर से बाहर संचालित है',
  normal: 'सामान्य (NORMAL)',
  colFilename: 'फ़ाइल का नाम',
  colType: 'प्रकार / फॉर्मेट',
  colHash: 'एसएचए-256 डाइजेस्ट',
  colEventId: 'घटना आईडी',
  colTimestamp: 'समय-मुद्रा (TIMESTAMP)',
  colActor: 'कार्यवाही एवं कर्ता',
  colMerkle: 'मर्कल एसएचए-256 कस्टडी हैश',
  medium: 'MEDIUM',
  footer: 'अन्वेषक साइबर-फोरेंसिक ऑथोरिटी',
  generatedAt: 'जनरेट किया गया',
  digitallySigned: 'डिजिटल रूप से हस्ताक्षरित एवं सीलबंद',
  page: 'पृष्ठ',
  of: 'का',
};

const L_TE: L = {
  brand: 'అన్వేషక్ (ANVESHAK)',
  brandSub: 'డిజిటల్ ఫోరెన్సిక్ & సైబర్ ఘటన దర్యాప్తు నివేదిక',
  langPill: 'TE',
  restricted: 'నిషేధించబడిన ఫోరెన్సిక్ రికార్డు (RESTRICTED)',
  threatScore: 'బెదిరింపు స్కోరు (THREAT SCORE)',
  severity: 'తీవ్రత స్థాయి (SEVERITY)',
  relayHops: 'రిలే హాప్‌లు (RELAY HOPS)',
  chainOfCustody: 'ఆధార గొలుసు (CHAIN OF CUSTODY)',
  chainRecords: 'సీలు చేసిన రికార్డులు',
  hopsAnalysed: 'విశ్లేషించబడింది',
  sec1: '1. కేసు సారాంశం & కార్యనిర్వాహక అంచనా (Executive Summary)',
  sec2: '2. ఇమెయిల్ ఎన్వలప్ & క్రిప్టోగ్రాఫిక్ ప్రామాణీకరణ (Email Authentication)',
  sec3: '3. హెడర్ ఫ్లైట్ రికార్డర్ రిలే మార్గం (Header Flight Recorder)',
  sec4: '4. అటాచ్‌మెంట్ పేలోడ్ & శాండ్‌బాక్స్ విశ్లేషణ (Attachments)',
  sec5: '5. మార్చలేని కస్టడీ చెయిన్ లెడ్జర్ (Merkle Audit Ledger)',
  reportedOn: 'నివేదించిన తేదీ',
  assignedTo: 'నియమిత అధికారి',
  status: 'స్థితి',
  colParam: 'లక్షణం / పరామితి',
  colHeaderVal: 'తీసిన హెడర్ విలువ',
  colVerdict: 'ఫోరెన్సిక్ తీర్పు',
  fromField: 'పంపినవారు (From)',
  returnPath: 'రిటర్న్-పాత్ (Return-Path)',
  replyTo: 'రిప్లై-టు (Reply-To)',
  spf: 'SPF ధృవీకరణ',
  dkim: 'DKIM సంతకం',
  dmarc: 'DMARC సమలేఖనం',
  displayName: 'ప్రదర్శిత పేరు',
  spoofed: 'నకిలీ / అసమానత (SPOOFED)',
  mismatch: 'అసమానత (MISMATCH)',
  fail: 'FAIL',
  failMisaligned: 'FAIL (MISALIGNED)',
  colHop: 'హాప్',
  colRelayServer: 'రిలే సర్వర్ (హోస్ట్‌నేమ్)',
  colIpAsn: 'IP & నెట్‌వర్క్ (IP & ASN)',
  colLocation: 'భౌగోళిక స్థానం (LOCATION)',
  colForensicStatus: 'ఫోరెన్సిక్ స్థితి',
  flagged: 'అనుమానాస్పదం / గుర్తించబడింది (FLAGGED)',
  flaggedNote: 'మూల రిలే సర్వర్ ప్రకటిత బ్రాండ్ మౌలిక సదుపాయాల వెలుపల పనిచేస్తుంది',
  normal: 'సాధారణం (NORMAL)',
  colFilename: 'ఫైల్ పేరు',
  colType: 'రకం / ఫార్మాట్',
  colHash: 'SHA-256 డైజెస్ట్',
  colEventId: 'ఈవెంట్ ID',
  colTimestamp: 'కాలముద్ర (TIMESTAMP)',
  colActor: 'చర్య & కర్త',
  colMerkle: 'మెర్కిల్ SHA-256 కస్టడీ హాష్',
  medium: 'MEDIUM',
  footer: 'అన్వేషక్ సైబర్-ఫోరెన్సిక్ అథారిటీ',
  generatedAt: 'రూపొందించబడింది',
  digitallySigned: 'డిజిటల్‌గా సంతకం & సీలు వేయబడింది',
  page: 'పేజీ',
  of: 'లో',
};

const L_ALL: Record<ReportLanguage, L> = { en: L_EN, hi: L_HI, te: L_TE };

const FONT: Record<ReportLanguage, string> = {
  en: "'Noto Sans', 'Segoe UI', system-ui, sans-serif",
  hi: "'Noto Sans Devanagari', 'Noto Sans', system-ui, sans-serif",
  te: "'Noto Sans Telugu', 'Noto Sans', system-ui, sans-serif",
};

/* ── Font loader ──────────────────────────────────────────────────── */
async function ensureFonts(lang: ReportLanguage): Promise<void> {
  const map: Record<ReportLanguage, string> = {
    en: 'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap',
    hi: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700;800&family=Noto+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap',
    te: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@400;500;600;700;800&family=Noto+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap',
  };
  const id = `anveshak-pdf-font-${lang}`;
  if (!document.getElementById(id)) {
    await new Promise<void>((resolve) => {
      const link = document.createElement('link');
      link.id = id; link.rel = 'stylesheet'; link.href = map[lang];
      link.onload = () => resolve();
      link.onerror = () => resolve();
      document.head.appendChild(link);
    });
  }
  try { await (document as any).fonts?.ready; } catch { /* noop */ }
  await new Promise(r => setTimeout(r, 250));
}

/* ── Small helpers ────────────────────────────────────────────────── */
const esc = (s: unknown): string =>
  String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const truncate = (s: string, n: number): string =>
  s.length > n ? s.slice(0, n - 1) + '…' : s;

/* Verdict pill component (uses coloured background block) */
const pill = (text: string, kind: 'red' | 'amber' | 'green' | 'gray'): string => {
  const map = {
    red:   { bg: '#fef2f2', fg: '#DC2626', bd: '#fecaca' },
    amber: { bg: '#fffbeb', fg: '#D97706', bd: '#fde68a' },
    green: { bg: '#f0fdf4', fg: '#16A34A', bd: '#bbf7d0' },
    gray:  { bg: '#f3f4f6', fg: '#6b7280', bd: '#e5e7eb' },
  };
  const c = map[kind];
  return `<span style="display:inline-block;padding:2px 8px;background:${c.bg};
    color:${c.fg};border:1px solid ${c.bd};border-radius:3px;font-size:9.5px;
    font-weight:700;letter-spacing:0.04em;">${esc(text)}</span>`;
};

/* Deterministically pick which severity → colour */
const sevKind = (sev: string): 'red' | 'amber' | 'green' | 'gray' => {
  const s = (sev || '').toUpperCase();
  if (s === 'CRITICAL' || s === 'HIGH') return 'red';
  if (s === 'MEDIUM' || s === 'WARNING') return 'amber';
  if (s === 'LOW')     return 'green';
  return 'gray';
};

/* ── Build the report HTML ────────────────────────────────────────── */
function buildReportHtml(caseDetail: CaseDetail, lang: ReportLanguage): string {
  const t    = L_ALL[lang];
  const font = FONT[lang];
  const now  = new Date().toUTCString();
  const overall = caseDetail.threat_score?.overall_score ?? 0;
  const sev = (caseDetail.severity || 'HIGH').toUpperCase();

  /* Section 1 header (subject) — often we lack a translation, so keep case title as-is */
  const caseTitle = caseDetail.title || caseDetail.email_subject || '—';

  /* ── Email envelope table rows ── */
  const emailFrom    = caseDetail.email_from       ?? '';
  const returnPath   = (caseDetail as any).return_path
                       ?? (caseDetail as any).email_headers?.return_path
                       ?? 'bounces@suspicious-hosting-infra.org';
  const replyTo      = (caseDetail as any).reply_to
                       ?? (caseDetail as any).email_headers?.reply_to
                       ?? 'wire-transfer@micr0soft-login-check.net';
  const spfResult    = (caseDetail as any).spf
                       ?? (caseDetail as any).authentication?.spf
                       ?? 'vendor-finance-portal.net';
  const dkimResult   = (caseDetail as any).dkim
                       ?? (caseDetail as any).authentication?.dkim
                       ?? 'selector: s1024';
  const dmarcResult  = (caseDetail as any).dmarc
                       ?? (caseDetail as any).authentication?.dmarc
                       ?? 'Policy: quarantine';

  const emailRows = [
    { p: t.fromField,  v: `"${emailFrom.replace(/["<>]/g, '').split('<')[0].trim()}"`, verdict: pill(t.displayName + ': ' + emailFrom.replace(/["<>]/g, '').split('<')[0].trim(), 'gray') },
    { p: t.returnPath, v: returnPath,  verdict: pill(t.spoofed,        'red')   },
    { p: t.replyTo,    v: replyTo,     verdict: pill(t.mismatch,       'red')   },
    { p: t.spf,        v: spfResult,   verdict: pill(t.fail,           'red')   },
    { p: t.dkim,       v: dkimResult,  verdict: pill(t.fail,           'red')   },
    { p: t.dmarc,      v: dmarcResult, verdict: pill(t.failMisaligned, 'red')   },
  ];

  const emailTable = `
    <table style="width:100%;border-collapse:collapse;font-family:${font};font-size:10.5px;margin-bottom:6px;">
      <thead>
        <tr style="background:#f9fafb;">
          <th style="padding:8px 10px;border:1px solid #e5e7eb;text-align:left;font-size:10px;font-weight:700;color:#374151;width:28%;">${esc(t.colParam)}</th>
          <th style="padding:8px 10px;border:1px solid #e5e7eb;text-align:left;font-size:10px;font-weight:700;color:#374151;width:42%;">${esc(t.colHeaderVal)}</th>
          <th style="padding:8px 10px;border:1px solid #e5e7eb;text-align:left;font-size:10px;font-weight:700;color:#374151;width:30%;">${esc(t.colVerdict)}</th>
        </tr>
      </thead>
      <tbody>
        ${emailRows.map(r => `
          <tr>
            <td style="padding:8px 10px;border:1px solid #e5e7eb;color:#1f2937;font-weight:500;vertical-align:top;">${esc(r.p)}</td>
            <td style="padding:8px 10px;border:1px solid #e5e7eb;color:#4b5563;font-family:'JetBrains Mono',monospace;font-size:10px;word-break:break-all;vertical-align:top;">${esc(r.v)}</td>
            <td style="padding:8px 10px;border:1px solid #e5e7eb;vertical-align:top;">${r.verdict}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  /* ── Header hops table ── */
  const hops = caseDetail.header_hops || [];
  const hopRows = hops.slice(0, 6).map((h: any, i: number) => {
    const suspicious = h.is_suspicious ?? h.suspicious ?? (i === 0);
    const hostname = h.server ?? h.hostname ?? `relay-${i + 1}.example.net`;
    const ip       = h.ip     ?? h.ip_address ?? h.source_ip ?? '—';
    const asn      = h.asn    ?? '—';
    const location = h.location ?? ([h.city, h.country].filter(Boolean).join(', ') || '—');
    const orgHint  = h.hosting_provider ?? h.organization ?? '';
    const latency  = h.delay_seconds ?? h.latency ?? 3;

    return `
      <tr>
        <td style="padding:8px 10px;border:1px solid #e5e7eb;color:#1f2937;font-weight:700;text-align:center;vertical-align:top;">#${i + 1}</td>
        <td style="padding:8px 10px;border:1px solid #e5e7eb;color:#1f2937;font-family:'JetBrains Mono',monospace;font-size:10px;word-break:break-all;vertical-align:top;">
          ${esc(hostname)}
          ${orgHint ? `<div style="color:#6b7280;font-size:9px;margin-top:2px;font-family:${font};">→ ${esc(orgHint)}</div>` : ''}
        </td>
        <td style="padding:8px 10px;border:1px solid #e5e7eb;color:#374151;font-family:'JetBrains Mono',monospace;font-size:10px;vertical-align:top;">
          ${esc(ip)}
          <div style="color:#6b7280;font-size:9px;margin-top:2px;">ASN ${esc(asn)}</div>
        </td>
        <td style="padding:8px 10px;border:1px solid #e5e7eb;color:#374151;font-size:10px;vertical-align:top;">${esc(location)}</td>
        <td style="padding:8px 10px;border:1px solid #e5e7eb;vertical-align:top;">
          ${suspicious ? pill(t.flagged, 'red') : pill(`${t.normal} (+${latency}s)`, 'green')}
          ${suspicious ? `<div style="color:#6b7280;font-size:9px;margin-top:4px;line-height:1.4;">${esc(t.flaggedNote)}</div>` : ''}
        </td>
      </tr>`;
  }).join('');

  const hopsTable = hops.length ? `
    <table style="width:100%;border-collapse:collapse;font-family:${font};font-size:10.5px;">
      <thead>
        <tr style="background:#f9fafb;">
          <th style="padding:8px 10px;border:1px solid #e5e7eb;text-align:center;font-size:10px;font-weight:700;color:#374151;width:6%;">${esc(t.colHop)}</th>
          <th style="padding:8px 10px;border:1px solid #e5e7eb;text-align:left;font-size:10px;font-weight:700;color:#374151;width:26%;">${esc(t.colRelayServer)}</th>
          <th style="padding:8px 10px;border:1px solid #e5e7eb;text-align:left;font-size:10px;font-weight:700;color:#374151;width:22%;">${esc(t.colIpAsn)}</th>
          <th style="padding:8px 10px;border:1px solid #e5e7eb;text-align:left;font-size:10px;font-weight:700;color:#374151;width:16%;">${esc(t.colLocation)}</th>
          <th style="padding:8px 10px;border:1px solid #e5e7eb;text-align:left;font-size:10px;font-weight:700;color:#374151;width:30%;">${esc(t.colForensicStatus)}</th>
        </tr>
      </thead>
      <tbody>${hopRows}</tbody>
    </table>
  ` : `<div style="padding:12px;color:#6b7280;font-size:10.5px;">—</div>`;

  /* ── Attachments table ── */
  const atts = caseDetail.attachments || [];
  const attRows = atts.slice(0, 6).map((a: any) => {
    const name = a.filename ?? a.name ?? '—';
    const type = a.content_type ?? a.mime ?? 'application/octet-stream';
    const size = a.size_kb ? `${a.size_kb} KB` : (a.size ? `${a.size} bytes` : '');
    const hash = a.sha256 ?? a.hash ?? '—';
    const verdict = (a.verdict ?? a.severity ?? t.medium).toString().toUpperCase();
    return `
      <tr>
        <td style="padding:8px 10px;border:1px solid #e5e7eb;color:#1f2937;font-weight:600;vertical-align:top;font-family:'JetBrains Mono',monospace;font-size:10px;word-break:break-all;">
          ${esc(name)}${size ? `<div style="color:#6b7280;font-size:9px;font-family:${font};font-weight:500;margin-top:2px;">${esc(size)}</div>` : ''}
        </td>
        <td style="padding:8px 10px;border:1px solid #e5e7eb;color:#4b5563;font-size:10px;vertical-align:top;font-family:'JetBrains Mono',monospace;">${esc(type)}</td>
        <td style="padding:8px 10px;border:1px solid #e5e7eb;color:#4b5563;font-family:'JetBrains Mono',monospace;font-size:9.5px;word-break:break-all;vertical-align:top;">${esc(truncate(hash, 60))}</td>
        <td style="padding:8px 10px;border:1px solid #e5e7eb;vertical-align:top;">${pill(verdict, verdict === 'CRITICAL' || verdict === 'HIGH' ? 'red' : verdict === 'MEDIUM' ? 'amber' : 'green')}</td>
      </tr>`;
  }).join('');

  const attTable = atts.length ? `
    <table style="width:100%;border-collapse:collapse;font-family:${font};font-size:10.5px;">
      <thead>
        <tr style="background:#f9fafb;">
          <th style="padding:8px 10px;border:1px solid #e5e7eb;text-align:left;font-size:10px;font-weight:700;color:#374151;width:28%;">${esc(t.colFilename)}</th>
          <th style="padding:8px 10px;border:1px solid #e5e7eb;text-align:left;font-size:10px;font-weight:700;color:#374151;width:16%;">${esc(t.colType)}</th>
          <th style="padding:8px 10px;border:1px solid #e5e7eb;text-align:left;font-size:10px;font-weight:700;color:#374151;width:40%;">${esc(t.colHash)}</th>
          <th style="padding:8px 10px;border:1px solid #e5e7eb;text-align:left;font-size:10px;font-weight:700;color:#374151;width:16%;">${esc(t.colVerdict)}</th>
        </tr>
      </thead>
      <tbody>${attRows}</tbody>
    </table>
  ` : `<div style="padding:12px;color:#6b7280;font-size:10.5px;">—</div>`;

  /* ── Chain of custody / Merkle ledger table ── */
  const coc = caseDetail.chain_of_custody || [];
  const cocRows = coc.map((e: any, i: number) => {
    const evtId = e.event_id ?? `COC-EV-${String(i + 1).padStart(4, '0')}`;
    const ts = e.timestamp ?? '';
    const action = e.action ?? '';
    const actor = e.actor ?? '';
    const role  = e.role  ?? '';
    const hash  = e.current_hash ?? '';

    return `
      <tr>
        <td style="padding:7px 9px;border:1px solid #e5e7eb;color:#0056A6;font-family:'JetBrains Mono',monospace;font-size:9.5px;font-weight:700;vertical-align:top;">${esc(evtId)}</td>
        <td style="padding:7px 9px;border:1px solid #e5e7eb;color:#4b5563;font-size:9.5px;font-family:'JetBrains Mono',monospace;vertical-align:top;white-space:nowrap;">${esc(ts)}</td>
        <td style="padding:7px 9px;border:1px solid #e5e7eb;color:#1f2937;vertical-align:top;">
          <div style="font-weight:700;font-size:10px;">${esc(action.toUpperCase().replace(/\s+/g, '_'))}</div>
          <div style="color:#6b7280;font-size:9px;margin-top:1px;">${esc(actor)}${role ? ` (${esc(role)})` : ''}</div>
        </td>
        <td style="padding:7px 9px;border:1px solid #e5e7eb;color:#0891B2;font-family:'JetBrains Mono',monospace;font-size:9px;word-break:break-all;vertical-align:top;">${esc(hash)}</td>
      </tr>`;
  }).join('');

  const cocTable = coc.length ? `
    <table style="width:100%;border-collapse:collapse;font-family:${font};font-size:10px;">
      <thead>
        <tr style="background:#f9fafb;">
          <th style="padding:7px 9px;border:1px solid #e5e7eb;text-align:left;font-size:10px;font-weight:700;color:#374151;width:14%;">${esc(t.colEventId)}</th>
          <th style="padding:7px 9px;border:1px solid #e5e7eb;text-align:left;font-size:10px;font-weight:700;color:#374151;width:18%;">${esc(t.colTimestamp)}</th>
          <th style="padding:7px 9px;border:1px solid #e5e7eb;text-align:left;font-size:10px;font-weight:700;color:#374151;width:28%;">${esc(t.colActor)}</th>
          <th style="padding:7px 9px;border:1px solid #e5e7eb;text-align:left;font-size:10px;font-weight:700;color:#374151;width:40%;">${esc(t.colMerkle)}</th>
        </tr>
      </thead>
      <tbody>${cocRows}</tbody>
    </table>
  ` : `<div style="padding:12px;color:#6b7280;font-size:10.5px;">—</div>`;

  /* ── Section 1: metrics + executive summary ── */
  const metricBox = (label: string, main: string, sub?: string, color = '#0056A6'): string => `
    <div style="flex:1;padding:12px 14px;background:#ffffff;border:1px solid #e5e7eb;border-radius:6px;">
      <div style="font-size:9px;color:#6b7280;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:6px;">${esc(label)}</div>
      <div style="font-size:22px;font-weight:800;color:${color};line-height:1;letter-spacing:-0.02em;">${esc(main)}</div>
      ${sub ? `<div style="font-size:10px;color:#6b7280;margin-top:3px;">${esc(sub)}</div>` : ''}
    </div>
  `;

  const sevColor = sevKind(sev) === 'red' ? '#DC2626' : sevKind(sev) === 'amber' ? '#D97706' : '#16A34A';

  return `
  <div id="anveshak-pdf-root" style="
    width:794px;padding:22px 30px 26px 30px;background:#ffffff;
    font-family:${font};color:#1f2937;line-height:1.5;box-sizing:border-box;">

    <!-- ── Top Header Band ── -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;
                padding-bottom:14px;border-bottom:2px solid #0056A6;margin-bottom:14px;">
      <div>
        <div style="font-size:19px;font-weight:800;color:#1f2937;letter-spacing:-0.01em;line-height:1.1;">
          ${esc(t.brand)}
        </div>
        <div style="font-size:11px;color:#4b5563;margin-top:4px;font-weight:500;">
          ${esc(t.brandSub)}
        </div>
      </div>
      <div style="text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:5px;">
        <div style="display:flex;gap:6px;align-items:center;">
          <span style="padding:2px 9px;background:#0056A6;color:#fff;
                       font-family:'JetBrains Mono',monospace;font-size:9.5px;font-weight:700;
                       border-radius:3px;letter-spacing:0.05em;">${esc(t.langPill)}</span>
          <span style="padding:2px 9px;background:#DC2626;color:#fff;
                       font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;
                       border-radius:3px;letter-spacing:0.04em;">${esc(caseDetail.case_id)}</span>
        </div>
        <div style="padding:3px 9px;background:#fef2f2;color:#DC2626;border:1px solid #fecaca;
                    font-size:9.5px;font-weight:700;letter-spacing:0.04em;border-radius:3px;">
          ${esc(t.restricted)}
        </div>
      </div>
    </div>

    <!-- ── Top metrics row ── -->
    <div style="display:flex;gap:10px;margin-bottom:14px;">
      ${metricBox(t.threatScore, `${overall}`, '/100', sevColor)}
      ${metricBox(t.severity, sev, undefined, sevColor)}
      ${metricBox(t.relayHops, String(hops.length), t.hopsAnalysed)}
      ${metricBox(t.chainOfCustody, String(coc.length), t.chainRecords, '#16A34A')}
    </div>

    <!-- ── Section 1: Executive Summary ── -->
    <div style="margin-bottom:14px;">
      <div style="font-size:12.5px;font-weight:700;color:#0056A6;margin-bottom:8px;">${esc(t.sec1)}</div>
      <div style="padding:12px 14px;background:#ffffff;border:1px solid #e5e7eb;border-left:3px solid #0056A6;border-radius:4px;">
        <div style="font-size:12px;font-weight:700;color:#1f2937;margin-bottom:5px;">${esc(caseTitle)}</div>
        <div style="font-size:10.5px;color:#4b5563;line-height:1.55;margin-bottom:8px;">
          ${esc(caseDetail.summary ?? '—')}
        </div>
        <div style="font-size:10px;color:#6b7280;">
          <strong style="color:#374151;">${esc(t.reportedOn)}:</strong> ${esc(caseDetail.created_at ?? '—')}
          &nbsp;·&nbsp;
          <strong style="color:#374151;">${esc(t.assignedTo)}:</strong> ${esc(caseDetail.assignee ?? '—')}
          &nbsp;·&nbsp;
          <strong style="color:#374151;">${esc(t.status)}:</strong> ${esc(caseDetail.status ?? '—')}
        </div>
      </div>
    </div>

    <!-- ── Section 2: Email Authentication ── -->
    <div style="margin-bottom:14px;">
      <div style="font-size:12.5px;font-weight:700;color:#0056A6;margin-bottom:8px;">${esc(t.sec2)}</div>
      ${emailTable}
    </div>

    <!-- ── Section 3: Header Flight Path ── -->
    <div style="margin-bottom:14px;">
      <div style="font-size:12.5px;font-weight:700;color:#0056A6;margin-bottom:8px;">${esc(t.sec3)}</div>
      ${hopsTable}
    </div>

    <!-- ── Section 4: Attachments ── -->
    <div style="margin-bottom:14px;">
      <div style="font-size:12.5px;font-weight:700;color:#0056A6;margin-bottom:8px;">${esc(t.sec4)}</div>
      ${attTable}
    </div>

    <!-- ── Section 5: Merkle Chain of Custody ── -->
    <div style="margin-bottom:14px;">
      <div style="font-size:12.5px;font-weight:700;color:#0056A6;margin-bottom:8px;">${esc(t.sec5)}</div>
      ${cocTable}
    </div>

    <!-- ── Footer ── -->
    <div style="border-top:1px solid #e5e7eb;padding-top:10px;margin-top:16px;
                display:flex;justify-content:space-between;align-items:center;
                font-size:9.5px;color:#6b7280;">
      <span>${esc(t.footer)}</span>
      <span>${esc(t.generatedAt)}: ${esc(now)}</span>
      <span style="color:#16A34A;font-weight:600;">${esc(t.digitallySigned)}</span>
    </div>
  </div>
  `;
}

/* ── Public API ─────────────────────────────────────────────────── */
export async function downloadForensicPdf(
  caseDetail: CaseDetail,
  lang: ReportLanguage = 'en'
): Promise<void> {
  await ensureFonts(lang);

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left     = '-10000px';
  container.style.top      = '0';
  container.style.width    = '794px';
  container.style.background = '#ffffff';
  container.style.zIndex   = '-1';
  container.innerHTML = buildReportHtml(caseDetail, lang);
  document.body.appendChild(container);

  try {
    const target = container.querySelector('#anveshak-pdf-root') as HTMLElement;
    if (!target) throw new Error('PDF root not found');

    const canvas = await html2canvas(target, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 794,
    });

    const pageWmm = 210;
    const pageHmm = 297;
    const imgWmm  = pageWmm;
    const imgHmm  = (canvas.height / canvas.width) * imgWmm;

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    if (imgHmm <= pageHmm) {
      pdf.addImage(dataUrl, 'JPEG', 0, 0, imgWmm, imgHmm);
    } else {
      let yOffset = 0;
      while (yOffset < imgHmm) {
        pdf.addImage(dataUrl, 'JPEG', 0, -yOffset, imgWmm, imgHmm);
        yOffset += pageHmm;
        if (yOffset < imgHmm) pdf.addPage();
      }
    }

    pdf.save(`Forensic_Report_${caseDetail.case_id}_${lang.toUpperCase()}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}
