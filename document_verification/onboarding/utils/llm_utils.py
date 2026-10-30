# utils/llm_utils.py
# Gemini LLM for intelligent document extraction
# Falls back to rule-based if no API key or timeout

import os
import json
import re
import threading

# Load .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Try new google.genai package
GEMINI_AVAILABLE = False
try:
    from google import genai
    GEMINI_AVAILABLE = True
except ImportError:
    try:
        import google.generativeai as genai_old
        GEMINI_AVAILABLE = True
    except ImportError:
        pass


def get_llm():
    """Get Gemini LLM client if API key is available"""
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not GEMINI_AVAILABLE or not api_key or api_key == "your_gemini_api_key_here":
        return None
    try:
        client = genai.Client(api_key=api_key)
        return client
    except Exception:
        return None


def extract_info_with_llm(document_text: str, employee_name: str) -> dict:
    """
    Use Gemini to extract document info with a 8-second timeout.
    Falls back to rules if LLM unavailable or too slow.
    """
    client = get_llm()

    if not client:
        return _extract_with_rules(document_text, employee_name)

    # Run Gemini in a thread with timeout
    result_holder = [None]
    error_holder  = [None]

    def call_gemini():
        try:
            result_holder[0] = _call_gemini_api(client, document_text, employee_name)
        except Exception as e:
            error_holder[0] = str(e)

    thread = threading.Thread(target=call_gemini)
    thread.start()
    thread.join(timeout=8)   # Wait max 8 seconds

    if thread.is_alive():
        # Gemini timed out — use fallback
        print("  [LLM] Gemini timeout (8s) - using fallback")
        return _extract_with_rules(document_text, employee_name)

    if error_holder[0]:
        print(f"  [LLM] Gemini error - using fallback")
        return _extract_with_rules(document_text, employee_name)

    return result_holder[0]


def _call_gemini_api(client, document_text: str, employee_name: str) -> dict:
    """Direct Gemini API call"""
    prompt = f"""
You are a document verification assistant for employee onboarding.

Expected Employee Name: {employee_name}

Document Text:
{document_text[:1000]}

Return ONLY a valid JSON object:
{{
  "extracted_name": "full name found or null",
  "document_type": "Aadhar Card / Degree Certificate / Offer Letter / Bank Details",
  "name_match": true or false,
  "confidence": "high or medium or low",
  "issues": []
}}
"""
    # Try multiple models
    for model_name in ["gemini-flash-latest", "gemini-2.5-flash", "gemini-3.8-flash"]:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt
            )
            text = response.text.strip()
            text = re.sub(r"```json\s*", "", text)
            text = re.sub(r"```\s*",     "", text)

            result = json.loads(text)
            result["llm_used"] = True
            print(f"  [LLM] Gemini ({model_name}) extracted info")
            return result
        except Exception:
            continue   # Try next model

    # All models failed — use rules
    return _extract_with_rules(document_text, employee_name)


def _extract_with_rules(document_text: str, employee_name: str) -> dict:
    """Rule-based fallback"""
    print("  [LLM] Using rule-based extraction")
    extracted_name = _find_name(document_text)
    name_match     = _name_matches(extracted_name, employee_name)

    issues = []
    if not extracted_name:
        issues.append("Could not extract name from document")
    elif not name_match:
        issues.append(f"Name mismatch: expected '{employee_name}', found '{extracted_name}'")

    return {
        "extracted_name": extracted_name,
        "document_type":  "Unknown (rule-based)",
        "name_match":     name_match,
        "confidence":     "medium" if extracted_name else "low",
        "issues":         issues,
        "llm_used":       False,
    }


def _find_name(text: str) -> str | None:
    for line in text.strip().split("\n"):
        line = line.strip()
        words = line.split()
        if 2 <= len(words) <= 4 and all(w.isalpha() for w in words):
            return line.title()
    return None


def _name_matches(extracted: str | None, expected: str) -> bool:
    if not extracted:
        return False
    return all(part.lower() in extracted.lower() for part in expected.split())
