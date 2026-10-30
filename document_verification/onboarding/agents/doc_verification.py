# agents/doc_verification.py
# Member 2 - Document Verification Agent
# Features: LLM extraction (Gemini) + graceful recovery

from shared.state import OnboardingState
from utils.ocr_utils import extract_text, find_document
from utils.llm_utils import extract_info_with_llm
from datetime import datetime

REQUIRED_DOCS = [
    "aadhar_card",
    "degree_certificate",
    "offer_letter_signed",
    "bank_details",
]


def document_verification_agent(state: OnboardingState) -> dict:
    """
    Member 2 - Document Verification Agent
    Reads:  employee_name, upload_folder
    Writes: docs_verified, doc_issues, doc_results,
            needs_human_review, audit_log, pending_approvals
    """
    print("\n[Doc Verification Agent] Starting...")

    employee_name = state["employee_name"]
    upload_folder = state["upload_folder"]
    audit_log     = list(state.get("audit_log", []))
    pending       = list(state.get("pending_approvals", []))
    issues        = []
    results       = []

    for doc_name in REQUIRED_DOCS:
        try:
            # Step 1: Find document
            path = find_document(upload_folder, doc_name)

            if not path:
                msg = f"Missing document: {doc_name}"
                print(f"  [MISSING] {msg}")
                issues.append(msg)
                results.append(_result(doc_name, False, None, False, [msg]))
                continue

            # Step 2: Extract text (graceful recovery)
            try:
                text = extract_text(path)
            except Exception as e:
                msg = f"Failed to read {doc_name}: {str(e)}"
                print(f"  [READ ERROR] {msg}")
                issues.append(msg)
                results.append(_result(doc_name, False, None, False, [msg]))
                continue

            if len(text.strip()) < 10:
                msg = f"{doc_name} is blank or unreadable"
                print(f"  [BLANK] {msg}")
                issues.append(msg)
                results.append(_result(doc_name, False, None, False, [msg]))
                continue

            # Step 3: LLM extraction (graceful recovery)
            try:
                llm_result = extract_info_with_llm(text, employee_name)
            except Exception as e:
                print(f"  [LLM FAILED] {e} - using fallback")
                llm_result = {
                    "extracted_name": None,
                    "document_type":  "Unknown",
                    "name_match":     False,
                    "confidence":     "low",
                    "issues":         [f"LLM error: {str(e)}"],
                    "llm_used":       False,
                }

            doc_issues = llm_result.get("issues", [])
            issues.extend(doc_issues)

            tag    = "(Gemini)" if llm_result.get("llm_used") else "(rules)"
            status = "[OK]" if llm_result["name_match"] else "[MISMATCH]"
            print(f"  {status} {doc_name} {tag} | "
                  f"name: {llm_result.get('extracted_name')} | "
                  f"confidence: {llm_result.get('confidence')}")

            results.append(_result(
                doc_name,
                readable=True,
                extracted_name=llm_result.get("extracted_name"),
                name_match=llm_result["name_match"],
                doc_issues=doc_issues,
                document_type=llm_result.get("document_type", "Unknown"),
                confidence=llm_result.get("confidence", "medium"),
                llm_used=llm_result.get("llm_used", False),
            ))

        except Exception as e:
            # Unexpected error - log and keep going (never crash)
            msg = f"Unexpected error on {doc_name}: {str(e)}"
            print(f"  [CRITICAL RECOVERED] {msg}")
            issues.append(msg)
            results.append(_result(doc_name, False, None, False, [msg]))

    # Final decision
    passed = len(issues) == 0

    audit_log.append({
        "agent":     "Document Verification Agent",
        "action":    "Verified all documents using LLM + OCR",
        "issues":    issues,
        "status":    "passed" if passed else "needs_human_review",
        "timestamp": datetime.now().isoformat(),
    })

    if not passed:
        pending.append({
            "agent":    "Document Verification Agent",
            "message":  f"Issues found for '{employee_name}': {issues}",
            "approved": False,
        })
        print(f"\n  [FLAGGED] HR review needed - {len(issues)} issue(s)")
    else:
        print("\n  [PASSED] All documents verified!")

    return {
        **state,
        "docs_verified":      passed,
        "doc_issues":         issues,
        "doc_results":        results,
        "needs_human_review": not passed,
        "audit_log":          audit_log,
        "pending_approvals":  pending,
    }


def _result(doc_name, readable, extracted_name, name_match, doc_issues,
            document_type="Unknown", confidence="low", llm_used=False) -> dict:
    return {
        "document":       doc_name,
        "document_type":  document_type,
        "readable":       readable,
        "extracted_name": extracted_name,
        "name_match":     name_match,
        "confidence":     confidence,
        "llm_used":       llm_used,
        "issues":         doc_issues,
    }
