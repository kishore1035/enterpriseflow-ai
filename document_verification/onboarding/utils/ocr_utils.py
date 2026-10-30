# utils/ocr_utils.py
import pymupdf as fitz
import os


def extract_text(file_path: str) -> str:
    """Extract text from PDF using PyMuPDF - no Tesseract needed"""
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".pdf":
        return _extract_from_pdf(file_path)
    return ""


def _extract_from_pdf(pdf_path: str) -> str:
    text = ""
    doc = fitz.open(pdf_path)
    for page in doc:
        text += page.get_text() + "\n"
    doc.close()
    return text


def find_document(folder: str, doc_name: str) -> str | None:
    """Find document file in uploads folder"""
    for ext in [".pdf", ".png", ".jpg", ".jpeg"]:
        path = os.path.join(folder, doc_name + ext)
        if os.path.exists(path):
            return path
    return None