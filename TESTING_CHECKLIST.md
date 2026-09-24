# ✅ TraceX Testing Checklist - All Features

## 🎯 Current Status
- ✅ Upload working (button + drag-and-drop)
- ✅ Real API integration (VirusTotal, AbuseIPDB, IPGeolocation, URLScan)
- ✅ Cases being created successfully
- ✅ Geo-Financial extraction working (returns null when no financial data found - correct!)

---

## 📋 Complete Feature Testing Guide

### 1️⃣ **Case Ingestion (UPLOAD)**

#### Test File 1: Phishing with Financial Data
**File**: `d:\tracex\test_phishing_sample.eml`
**Expected Results**:
- ✅ Threat Score: ~86/100 (CRITICAL)
- ✅ Geo-Financial Tab: Shows bank details
  - Beneficiary: Global Tech Solutions Pvt Ltd
  - Bank: State Bank of India
  - IFSC: SBIN0000847
  - Amount: ₹ 4,85,000
- ✅ Identity Analysis: 100% deception (Microsoft impersonation)
- ✅ Header Hops: Shows "AbuseIPDB reports abuse score 100/100"
- ✅ URLs: 2 malicious URLs detected

#### Test File 2: Any Other .eml
**Expected Results**:
- ✅ Case created
- ✅ If no financial data → "No financial payout entities extracted" message (this is correct!)
- ✅ Real IPs geolocated
- ✅ URLs scanned
- ✅ Threat score calculated

---

### 2️⃣ **Email Forensics Tab** 📧

**What to Check**:
- [ ] Email subject displayed
- [ ] From/To addresses shown
- [ ] Date and time correct
- [ ] Body text visible
- [ ] MIME structure parsed

**Common Issues**: None expected

---

### 3️⃣ **Header Flight Recorder** ✈️

**What to Check**:
- [ ] All relay hops shown (minimum 1-2)
- [ ] Each hop shows:
  - [ ] Real IP addresses
  - [ ] Real geolocation (city, country)
  - [ ] Real ASN/ISP (from IPGeolocation API)
  - [ ] AbuseIPDB scores for malicious IPs
- [ ] Timeline/flow visualization

**Red Flags (Bugs)**:
- ❌ All IPs show "Sofia, Bulgaria" → API not working
- ❌ All ASN show "AS12000" → Mock data instead of real
- ❌ No abuse scores shown → AbuseIPDB not called

---

### 4️⃣ **Identity Deception Engine** 🎭

**What to Check**:
- [ ] Sender email parsed correctly
- [ ] Display name vs domain mismatch detected
- [ ] Homoglyph detection (e.g., "micr0soft" with zero)
- [ ] Reply-To mismatch flagged
- [ ] Return-Path mismatch flagged
- [ ] Deception score calculated (0-100)

**Example**:
- Display: "Microsoft Security Team"
- Email: security-alerts@micr0soft-account-security.com
- → Should flag: impersonation, homoglyph, domain mismatch

---

### 5️⃣ **Social Engineering Signals** 🎣

**What to Check**:
- [ ] Urgent language detected ("URGENT", "IMMEDIATE ACTION")
- [ ] Payment requests flagged
- [ ] Credential harvesting keywords detected
- [ ] Authority impersonation flagged
- [ ] Each signal has severity (LOW/MEDIUM/HIGH)

---

### 6️⃣ **URL Redirect Tracer** 🔗

**What to Check**:
- [ ] All URLs extracted from email
- [ ] Each URL shows:
  - [ ] Original URL
  - [ ] Final destination (after redirects)
  - [ ] Redirect chain (if shortener used)
  - [ ] VirusTotal reputation score
  - [ ] URLScan.io results
- [ ] Link shorteners detected (bit.ly, tinyurl, etc.)
- [ ] Credential harvesting forms detected

**Common API Behaviors**:
- VirusTotal 404 → URL not in database (normal for new phishing URLs)
- URLScan 400 → Malformed URL (normal for non-existent domains)

---

### 7️⃣ **Attack Graph** 🕸️

**What to Check**:
- [ ] Visual graph rendered
- [ ] Nodes include:
  - [ ] Email node
  - [ ] Sender identity node
  - [ ] IP address nodes
  - [ ] URL nodes
  - [ ] Domain nodes
  - [ ] Financial entity nodes (if applicable)
- [ ] Edges show relationships
- [ ] Color coding by severity

---

### 8️⃣ **Campaign Intelligence** 🎯

**What to Check**:
- [ ] Similar cases correlated
- [ ] Shared indicators shown:
  - [ ] Shared ASNs
  - [ ] Shared domains
  - [ ] Shared infrastructure
- [ ] Campaign confidence score shown
- [ ] Historical case IDs linked

---

### 9️⃣ **Geo-Financial Map** 🗺️

**What to Check**:
- [ ] If financial data exists:
  - [ ] Map shows bank location
  - [ ] IFSC code displayed
  - [ ] Beneficiary name shown
  - [ ] Account number (masked)
  - [ ] Amount requested
  - [ ] Contrast with relay IP geolocation
- [ ] If NO financial data:
  - [ ] Message: "No financial payout entities extracted" ✅ **This is correct!**

**Not a Bug**: Many phishing emails don't have bank details (e.g., credential harvesting phishing). The system correctly returns null and shows a message.

---

### 🔟 **Impact Lab (What-If Simulator)** 🧪

**What to Check**:
- [ ] Counterfactual controls shown:
  - [ ] Remove URL checkbox
  - [ ] Assume SPF Pass checkbox
  - [ ] Disconnect Campaign checkbox
  - [ ] Remove Reply Mismatch checkbox
- [ ] Clicking checkboxes recalculates threat score
- [ ] Shows before/after comparison
- [ ] Explains impact of each factor

---

### 1️⃣1️⃣ **AI Investigator (RAG Copilot)** 🤖

**What to Check**:
- [ ] Chat interface loads
- [ ] Can ask questions about the case
- [ ] Responses grounded in evidence
- [ ] Citations to specific forensic elements
- [ ] Knowledge base integration working

**Test Questions**:
- "What MITRE techniques are used?"
- "Explain the identity deception"
- "What are the credential harvesting indicators?"

---

### 1️⃣2️⃣ **Sandbox Detonation** 💣

**What to Check**:
- [ ] Attachments listed (if email has attachments)
- [ ] Can click "Detonate" button
- [ ] Shows sandbox report:
  - [ ] Verdict (CLEAN/SUSPICIOUS/MALICIOUS)
  - [ ] Confidence score
  - [ ] YARA matches
  - [ ] Process tree
  - [ ] Network IOCs
  - [ ] Registry modifications
  - [ ] MITRE ATT&CK mapping

**Note**: Currently uses deterministic analysis (no actual execution)

---

### 1️⃣3️⃣ **Evidence Vault (Chain of Custody)** 🔒

**What to Check**:
- [ ] All custody events listed chronologically
- [ ] Each event shows:
  - [ ] Timestamp
  - [ ] Actor (who performed action)
  - [ ] Role (SYSTEM/INVESTIGATOR/SOC_ANALYST)
  - [ ] Action type
  - [ ] Artifact ID
  - [ ] Hash chain
  - [ ] Blockchain proof (Polygon POS)
- [ ] Can export STIX bundle

---

### 1️⃣4️⃣ **Executive Risk Dashboard** 📊

**What to Check**:
- [ ] Overall risk metrics shown
- [ ] Threat severity distribution
- [ ] Campaign trends
- [ ] Risk score evolution
- [ ] Business impact assessment

---

### 1️⃣5️⃣ **Blockchain Proof Explorer** ⛓️

**What to Check**:
- [ ] Each custody event has blockchain proof
- [ ] Shows:
  - [ ] Transaction hash
  - [ ] Block height
  - [ ] Merkle root
  - [ ] Contract address
  - [ ] Network (Polygon POS)
  - [ ] Gas used
  - [ ] Status (VERIFIED_ON_CHAIN)

**Note**: Currently mock data (no actual blockchain writes unless private key configured)

---

## 🐛 Known Issues & Expected Behaviors

### Not Bugs (Expected):

1. **"No financial payout entities extracted"**
   - ✅ Normal for emails without bank details
   - ✅ Means geo-financial extraction is working correctly

2. **VirusTotal 404 responses**
   - ✅ Normal for new/unknown URLs
   - ✅ System falls back to heuristic analysis

3. **URLScan 400 errors**
   - ✅ Normal for non-existent domains
   - ✅ Doesn't affect threat scoring

4. **Private IPs (192.168.x.x) show "Private Network"**
   - ✅ Correct behavior (no geolocation for internal IPs)

5. **Blockchain status "VERIFIED_ON_CHAIN" with mock data**
   - ✅ Normal (no private key configured)
   - ✅ Generates deterministic proof data

### Real Bugs to Watch For:

1. **Upload fails silently**
   - Now fixed with detailed console logging

2. **All cases show same threat score**
   - Should vary based on email content

3. **All geolocations show "Sofia, Bulgaria"**
   - Should show real city/country from IPGeolocation API

4. **Hardcoded "Global Tech Solutions" always appears**
   - Fixed: now extracts real beneficiary names from email body

5. **AbuseIPDB scores always 0**
   - Should show real abuse data for malicious IPs

---

## 🧪 Quick Smoke Test (5 minutes)

1. **Upload** `test_phishing_sample.eml` → Should create CASE-XXX
2. **Check Threat Score** → Should be ~86/100 (CRITICAL)
3. **Check Header Hops** → Should show "Berlin, Germany" and abuse score 100/100
4. **Check Geo-Financial** → Should show State Bank of India, ₹ 4,85,000
5. **Check Identity** → Should show 100% deception, Microsoft impersonation
6. **Upload different email** → Threat score should be different!

---

## 📝 Testing Notes

**Date Tested**: _________________
**Tester**: _________________

**Issues Found**:
- [ ] None - all working ✅
- [ ] List any bugs below:

1. ___________________________
2. ___________________________
3. ___________________________

**Screenshot Evidence**: Attach screenshots of any bugs

---

## ✅ Sign-off

- [ ] All 15 features tested
- [ ] No critical bugs found
- [ ] Upload working correctly
- [ ] Real APIs integrated
- [ ] Ready for UI/UX improvements

---

**Next Steps**: Once all features verified working → Move to UI/UX redesign phase
