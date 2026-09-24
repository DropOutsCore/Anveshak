import requests
import json

# Test uploading the phishing .eml file
url = "http://127.0.0.1:8000/api/v1/cases/ingest"

with open("test_phishing_sample.eml", "rb") as f:
    files = {"file": ("test_phishing_sample.eml", f, "message/rfc822")}
    response = requests.post(url, files=files)

print(f"Status Code: {response.status_code}")
print(f"\nResponse:\n{json.dumps(response.json(), indent=2)}")
