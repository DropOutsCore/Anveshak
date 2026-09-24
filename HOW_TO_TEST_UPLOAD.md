# How to Test Email Upload in TraceX

## 🔧 Fix Applied

**Problem**: Upload button was not triggering file picker  
**Solution**: Added proper `useRef` handler and click event to "UPLOAD EVIDENCE FILE" button

---

## ✅ Testing Steps

### Option 1: Upload via UI Button

1. **Open Frontend**: http://localhost:5173

2. **Navigate to Case Desk**:
   - Click "INGEST" in the top navigation
   - Or click the "CASE DESK" tab in the sidebar

3. **Click Upload Button**:
   - Make sure "[ DROP FILE ]" tab is selected (default)
   - Click the white **"UPLOAD EVIDENCE FILE"** button
   - File picker should now open

4. **Select Test File**:
   - Navigate to `d:\tracex\test_phishing_sample.eml`
   - Select it and click Open

5. **Watch Processing**:
   - You should see "INGESTING & PARSING EVIDENCE..." progress bar
   - After 2-3 seconds, a new case appears (CASE-210 or higher)

6. **Verify Real Data**:
   - Click on the new case card
   - Check the threat score (should be ~86.2/100 CRITICAL)
   - Look for real IP geolocation (Berlin, Germany, not Sofia, Bulgaria)
   - Check "AbuseIPDB reports abuse score 100/100" in header hops

---

### Option 2: Drag and Drop

1. **Open File Explorer**: Navigate to `d:\tracex\`

2. **Drag `test_phishing_sample.eml`** onto the dropzone area (the dashed border box)

3. **Drop the file** - processing should start automatically

---

### Option 3: Python Script (Backend Direct)

```bash
cd d:\tracex
python test_upload.py
```

This bypasses the frontend and tests the backend API directly.

---

## 🔍 What to Look For

### In the Frontend (Case Details):

**Header Hops** → Should show:
```
IP: 185.220.101.45
Location: Berlin, Germany (NOT Sofia, Bulgaria)
ASN: Stiftung Erneuerbare Freiheit
Flag: "AbuseIPDB reports abuse score 100/100 (178 reports)"
```

**Identity Analysis** → Should show:
```
Deception Score: 100/100 (CRITICAL)
Sender: security-alerts@micr0soft-account-security.com
Display Name: Microsoft Security Team
Homoglyph detected: "0" in "micr0soft"
Reply-To Mismatch: cybercash-processor.xyz
```

**Geo-Financial** → Should show:
```
Beneficiary: Global Tech Solutions Pvt Ltd
Bank: State Bank of India
IFSC: SBIN0000847
Amount: ₹ 4,85,000
```

**Threat Score** → Should show:
```
Overall: 86.2/100
Severity: CRITICAL
```

---

## ⚠️ Troubleshooting

### Upload Button Not Working?

**Check 1**: Make sure frontend reloaded after the fix
- You should see HMR update in the Vite console
- If not, restart frontend: `Ctrl+C` in frontend terminal, then `npm run dev`

**Check 2**: Browser console errors
- Open browser DevTools (F12)
- Look for any red errors in Console tab
- If you see CORS errors, restart backend

**Check 3**: Backend running?
- Open http://127.0.0.1:8000/docs
- Should show FastAPI Swagger documentation
- If not, restart backend: `python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload`

### File Uploads But Shows Mock Data?

This should NOT happen anymore, but if it does:

**Check Backend Logs** for API calls:
```
INFO: [ThreatIntel-AbuseIPDB] Checking IP reputation...
INFO: [GeoIP-ipgeolocation] Resolving IP coordinates...
INFO: [ThreatIntel-VirusTotal] Querying URL...
```

If you don't see these logs, the APIs aren't being called.

**Check .env file** has all API keys:
```bash
cat backend\.env
```

Should show:
- VIRUSTOTAL_API_KEY=be40a9fd...
- ABUSEIPDB_API_KEY=f6c7ec02...
- URLSCAN_API_KEY=01a08b74...
- IPGEOLOCATION_API_KEY=e784504557e94bf7a6826c48d4fb1f46

---

## 🎯 Expected Backend Logs (Success)

When you upload an .eml file, you should see:

```
INFO: 127.0.0.1:xxxxx - "POST /api/v1/cases/ingest HTTP/1.1" 200 OK
INFO: [GeoIP-ipgeolocation] Resolving IP coordinates. ip=185.220.101.45
INFO: [ThreatIntel-AbuseIPDB] Checking IP reputation. ip=185.220.101.45 case_context=active
INFO: [ThreatIntel-VirusTotal] Querying URL. hash_id=e1c63c0e case_context=active
INFO: [ThreatIntel-URLScan] Submitting URL scan. url=https://bit.ly/ms-verify-urgent
```

**Status 200** = Success ✅  
**Status 400/500** = Error ❌

---

## 📁 Test Files

**Sample Phishing Email**: `d:\tracex\test_phishing_sample.eml`
- Contains: Microsoft impersonation, malicious URLs, financial fraud
- Expected Threat Score: 86.2/100 (CRITICAL)

**Upload Test Script**: `d:\tracex\test_upload.py`
- Direct backend API test
- Useful for debugging backend issues

---

## ✅ Success Checklist

- [ ] Upload button opens file picker
- [ ] OR drag-and-drop accepts .eml files
- [ ] Progress bar shows "INGESTING & PARSING EVIDENCE..."
- [ ] New case appears in case list
- [ ] Threat score is calculated (not 0)
- [ ] Real IP geolocation shown (not "Sofia, Bulgaria" for all cases)
- [ ] AbuseIPDB abuse scores shown for malicious IPs
- [ ] Financial data extracted from email body (not always "Global Tech Solutions")
- [ ] Backend logs show API calls to VirusTotal, AbuseIPDB, IPGeolocation

---

## 🚀 Next Steps

Once upload is confirmed working:
1. Test with your own phishing .eml files
2. Verify threat scores are different for different emails
3. Check that geolocations match the actual relay IPs
4. Ready for UI/UX improvements!

---

**Current Status**: Upload button fix deployed via HMR ✅  
**Servers**: Both running (backend:8000, frontend:5173) ✅  
**APIs**: All 4 external APIs integrated ✅
