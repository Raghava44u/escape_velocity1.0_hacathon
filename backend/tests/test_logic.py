import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.confidence import calculate_field_confidence
from app.services.validation import validate_invoice_math

def test_confidence_calculation():
    # Given: OCR = 0.95, Spatial = 0.90, Semantic = 0.95, Rule = 0.95
    res = calculate_field_confidence(s_ocr=0.95, s_spatial=0.90, s_semantic=0.95, s_rule=0.95)
    
    # Expected: 0.25(0.95) + 0.20(0.90) + 0.25(0.95) + 0.30(0.95) = 0.94
    assert round(res["final_score"], 2) == 0.94
    assert res["status"] == "VERIFIED"
    assert res["review_required"] is False
    
    # Test low confidence triggers review
    res2 = calculate_field_confidence(0.5, 0.5, 0.5, 0.5)
    assert res2["status"] == "FAILED"
    assert res2["review_required"] is True
    
def test_invoice_math_validation():
    # Test correct math
    res = validate_invoice_math([{"quantity": 1, "unit_price": 100000.0, "amount": 100000.0}], 100000.0, 18000.0, 118000.0)
    assert res["is_valid"] is True
    
    # Test wrong total
    res2 = validate_invoice_math([{"quantity": 1, "unit_price": 100000.0, "amount": 100000.0}], 100000.0, 18000.0, 129800.0)
    assert res2["is_valid"] is False
    assert res2["total_match"] is False
