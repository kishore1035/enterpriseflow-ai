# utils/__init__.py
# Utility package for the onboarding system
# Contains: ocr_utils, llm_utils

from utils.ocr_utils import extract_text, find_document
from utils.llm_utils import extract_info_with_llm

__all__ = [
    "extract_text",
    "find_document",
    "extract_info_with_llm",
]
