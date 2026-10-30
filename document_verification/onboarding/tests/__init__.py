# tests/__init__.py
# Test package for Member 2 agents
# Run tests with: pytest tests/test_member2.py -v

import sys
import os

# Ensure project root is in path so imports work during testing
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
