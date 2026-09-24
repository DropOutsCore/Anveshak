import re
from typing import Optional, Dict, Any
from app.schemas.forensics import GeoFinancialEntity

class GeoFinancialService:
    # Known Indian IFSC prefix database mapping for forensic branch resolution
    IFSC_BRANCH_MAP = {
        "SBIN": {"bank_name": "State Bank of India", "branch": "Hyderabad Main Branch", "city": "Hyderabad", "state": "Telangana", "lat": 17.3850, "lng": 78.4867},
        "HDFC": {"bank_name": "HDFC Bank Ltd", "branch": "Connaught Place Branch", "city": "New Delhi", "state": "Delhi", "lat": 28.6315, "lng": 77.2167},
        "ICIC": {"bank_name": "ICICI Bank Ltd", "branch": "Bandra Kurla Complex", "city": "Mumbai", "state": "Maharashtra", "lat": 19.0657, "lng": 72.8686},
        "PUNB": {"bank_name": "Punjab National Bank", "branch": "Sector 17 Branch", "city": "Chandigarh", "state": "Punjab", "lat": 30.7414, "lng": 76.7791},
        "AXIS": {"bank_name": "Axis Bank Ltd", "branch": "MG Road Branch", "city": "Bengaluru", "state": "Karnataka", "lat": 12.9716, "lng": 77.5946},
        "VITP": {"bank_name": "VIT-AP Bank", "branch": "Amaravati Main Branch", "city": "Amaravati", "state": "Andhra Pradesh", "lat": 16.5079, "lng": 80.6460}
    }

    @staticmethod
    def extract_geo_financial(body_text: str, ip_geo: str = "Sofia, Bulgaria", ip_lat: float = 42.6977, ip_lng: float = 23.3219) -> Optional[GeoFinancialEntity]:
        """
        Extracts financial entities (IFSC codes, beneficiary names, requested amounts) from email body text.
        Resolves IFSC prefix to bank branch coordinates and contrasts with network IP origin.
        Returns None if no financial indicators found (not all phishing emails contain financial data).
        """
        ifsc_pattern = r'\b([A-Z]{4}0[A-Z0-9]{6})\b'
        ifsc_match = re.search(ifsc_pattern, body_text)
        
        # Look for beneficiary / account keywords with more flexible patterns
        beneficiary_patterns = [
            r'(?:Beneficiary|Payee|Account Name|Account Holder|Pay to):\s*([^\n\r]+)',
            r'(?:Transfer to|Send to|Wire to):\s*([^\n\r]+)',
            r'(?:Company|Business|Vendor|Supplier):\s*([^\n\r]+)',
            r'FINANCIAL BENEFICIARY\s+([^\n\r]+)',
            r'(?:University|Institution|Organization):\s*([^\n\r]+)'
        ]
        beneficiary_match = None
        for pattern in beneficiary_patterns:
            beneficiary_match = re.search(pattern, body_text, re.IGNORECASE)
            if beneficiary_match:
                break
        
        account_patterns = [
            r'(?:Account Number|A/C No|A/C|Account #|Acct):\s*([0-9X\-]{8,18})',
            r'(?:IBAN|Swift):\s*([A-Z0-9]{15,34})'
        ]
        account_match = None
        for pattern in account_patterns:
            account_match = re.search(pattern, body_text, re.IGNORECASE)
            if account_match:
                break
        
        amount_patterns = [
            r'(?:Amount|Total|Payment Due|Pay|Due|Invoice Total):\s*([₹\$\€\£\s0-9,\.]+)',
            r'([₹\$\€\£]\s*[0-9,\.]+)',
            r'(?:INR|USD|EUR|GBP)\s*([0-9,\.]+)'
        ]
        amount_match = None
        for pattern in amount_patterns:
            amount_match = re.search(pattern, body_text, re.IGNORECASE)
            if amount_match:
                break
        
        # If no financial indicators found, return None
        if not ifsc_match and not beneficiary_match and not account_match and not amount_match:
            return None
        
        ifsc_code = ifsc_match.group(1) if ifsc_match else None
        beneficiary_name = beneficiary_match.group(1).strip() if beneficiary_match else "Unknown Beneficiary"
        account_num = account_match.group(1).strip() if account_match else "Account Not Specified"
        amount_req = amount_match.group(1).strip() if amount_match else "Amount Not Specified"
        
        # Resolve IFSC to branch location
        if ifsc_code:
            prefix = ifsc_code[:4].upper()
            branch_info = GeoFinancialService.IFSC_BRANCH_MAP.get(prefix, {
                "bank_name": "Unknown Bank",
                "branch": "Unknown Branch",
                "city": "Unknown",
                "state": "Unknown",
                "lat": 0.0,
                "lng": 0.0
            })
        else:
            # No IFSC found - use generic placeholder
            branch_info = {
                "bank_name": "Bank Not Identified",
                "branch": "Branch Not Specified",
                "city": "Unknown",
                "state": "Unknown",
                "lat": 0.0,
                "lng": 0.0
            }
        
        return GeoFinancialEntity(
            entity_id="GEO-FIN-001",
            beneficiary_name=beneficiary_name,
            bank_name=branch_info["bank_name"],
            ifsc_code=ifsc_code or "Not Specified",
            branch_name=branch_info["branch"],
            branch_city=branch_info["city"],
            branch_state=branch_info["state"],
            lat=branch_info["lat"],
            lng=branch_info["lng"],
            account_number_masked=account_num,
            amount_requested=amount_req,
            ip_geolocation=ip_geo,
            ip_lat=ip_lat,
            ip_lng=ip_lng,
            location_mismatch=True,
            uncertainty_disclaimer="Cross-region infrastructure and financial destination clues observed. Bank IFSC location indicates payout routing destination, NOT physical perpetrator location."
        )
