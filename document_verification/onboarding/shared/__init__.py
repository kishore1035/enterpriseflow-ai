
import fitz                   
import pytesseract
from PIL import Image
import io, os

# Change this path if Tesseract is installed elsewhere
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def extract_text(file_path: str) -> str:
    """Extract text from PDF or image file using OCR"""
    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        return _extract_from_pdf(file_path)
    elif ext in [".png", ".jpg", ".jpeg"]:
        return _extract_from_image(file_path)
    else:
        return ""

def _extract_from_pdf(pdf_path: str) -> str:
    text = ""
    doc = fitz.open(pdf_path)
    for page in doc:
        pix = page.get_pixmap(dpi=300)
        img = Image.open(io.BytesIO(pix.tobytes("png")))
        text += pytesseract.image_to_string(img) + "\n"
    doc.close()
    return text

def _extract_from_image(img_path: str) -> str:
    img = Image.open(img_path)
    return pytesseract.image_to_string(img)

def find_name_in_text(text: str) -> str | None:
    """Try to extract a person's name from OCR text"""
    for line in text.strip().split("\n"):
        line = line.strip()
        words = line.split()
        # A name usually has 2-4 words, all alphabetic
        if 2 <= len(words) <= 4 and all(w.isalpha() for w in words):
            return line.title()
    return None

def name_matches(extracted: str | None, expected: str) -> bool:
    """Check if extracted name matches expected name"""
    if not extracted:
        return False
    return all(
        part.lower() in extracted.lower()
        for part in expected.split()
    )

def find_document(folder: str, doc_name: str) -> str | None:
    """Look for a document file in the uploads folder"""
    for ext in [".pdf", ".png", ".jpg", ".jpeg"]:
        path = os.path.join(folder, doc_name + ext)
        if os.path.exists(path):
            return path
    return None