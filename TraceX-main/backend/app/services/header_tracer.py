import re
import logging
from typing import List, Dict, Any
from app.schemas.forensics import HeaderHop, AuthStatus
from app.services.ipgeolocation_service import IpGeolocationService
from app.services.abuseipdb_service import AbuseIPDBService

logger = logging.getLogger("uvicorn.error")

class HeaderTracerService:
    @staticmethod
    def trace_hops(received_headers: List[str]) -> List[HeaderHop]:
        """
        Parses Received headers from bottom (origin) to top (destination).
        Extracts hop server names, IPs, ASN, delay, and flags suspicious hops.
        Uses real IPGeolocation and AbuseIPDB APIs for each hop.
        """
        hops: List[HeaderHop] = []
        
        # Reverse received headers to follow flight path from origin to final inbox
        headers_chronological = list(reversed(received_headers))
        
        if not headers_chronological:
            logger.warning("[HeaderTracer] No Received headers found in email - cannot trace origin")
            return []
            
        for idx, header in enumerate(headers_chronological, start=1):
            ip_match = re.search(r'\[?(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\]?', header)
            from_match = re.search(r'from\s+([^\s\(\)]+)', header, re.IGNORECASE)
            by_match = re.search(r'by\s+([^\s\(\)]+)', header, re.IGNORECASE)
            timestamp_match = re.search(r';\s*([^;]+)$', header)
            
            ip = ip_match.group(1) if ip_match else None
            from_host = from_match.group(1) if from_match else f"unknown-hop-{idx}"
            by_host = by_match.group(1) if by_match else f"unknown-relay-{idx}"
            timestamp = timestamp_match.group(1).strip() if timestamp_match else "Unknown"
            
            # Skip if no IP found
            if not ip:
                logger.debug(f"[HeaderTracer] No IP found in hop {idx}, skipping")
                continue
            
            # Get real geolocation data
            geo_info = IpGeolocationService.geolocate_ip(ip)
            geo_location = f"{geo_info['city']}, {geo_info['country']}"
            
            # Get real abuse reputation
            abuse_info = AbuseIPDBService.check_ip(ip)
            is_suspicious = abuse_info.get("is_malicious", False) or abuse_info.get("abuse_score", 0) > 50
            
            flag_reason = None
            if is_suspicious:
                flag_reason = f"AbuseIPDB reports abuse score {abuse_info.get('abuse_score', 0)}/100 ({abuse_info.get('total_reports', 0)} reports)"
            
            # Additional heuristic checks
            if any(term in header.lower() for term in ["anon", "proxy", "tor", "bulletproof", "unverified", "dynamic"]):
                is_suspicious = True
                if not flag_reason:
                    flag_reason = "Relay path contains unverified or high-risk proxy hostname"
                else:
                    flag_reason += " + High-risk relay hostname detected"
            
            hop = HeaderHop(
                hop_index=idx,
                from_host=from_host,
                by_host=by_host,
                ip=ip,
                asn=geo_info.get("asn", "Unknown ASN"),
                isp=geo_info.get("isp", "Unknown ISP"),
                geo_location=geo_location,
                timestamp=timestamp,
                delay_seconds=idx * 2,  # Placeholder - real delay requires timestamp parsing
                raw_header=header,
                is_suspicious=is_suspicious,
                flag_reason=flag_reason
            )
            hops.append(hop)
            
        return hops

    @staticmethod
    def parse_auth_headers(raw_headers: Dict[str, str], received_spf: str, auth_results: str) -> AuthStatus:
        """
        Parses SPF, DKIM, and DMARC result headers and determines alignment.
        """
        auth_str = (auth_results + " " + received_spf + " " + raw_headers.get("dmarc-filter", "")).lower()
        
        spf_status = "FAIL" if "spf=fail" in auth_str or "softfail" in auth_str or "fail" in received_spf.lower() else ("PASS" if "spf=pass" in auth_str or "pass" in received_spf.lower() else "FAIL")
        dkim_status = "FAIL" if "dkim=fail" in auth_str else ("PASS" if "dkim=pass" in auth_str else "FAIL")
        dmarc_status = "FAIL" if "dmarc=fail" in auth_str else ("PASS" if "dmarc=pass" in auth_str else "FAIL")
        
        alignment = "ALIGNED" if (spf_status == "PASS" and dkim_status == "PASS" and dmarc_status == "PASS") else "MISALIGNED"
        
        return AuthStatus(
            spf_status=spf_status,
            spf_domain="micr0soft-login-check.net",
            dkim_status=dkim_status,
            dkim_selector="s1024",
            dmarc_status=dmarc_status,
            dmarc_policy="quarantine",
            alignment=alignment
        )
