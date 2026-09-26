def calculate_field_confidence(s_ocr: float, s_spatial: float, s_semantic: float, s_rule: float) -> dict:
    """
    Calculates field-level confidence based on the exact formula:
    C = (S_OCR * 0.25) + (S_Spatial * 0.20) + (S_Semantic * 0.25) + (S_Rule * 0.30)
    """
    s_ocr = max(0.0, min(1.0, float(s_ocr)))
    s_spatial = max(0.0, min(1.0, float(s_spatial)))
    s_semantic = max(0.0, min(1.0, float(s_semantic)))
    s_rule = max(0.0, min(1.0, float(s_rule)))

    final_score = (s_ocr * 0.25) + (s_spatial * 0.20) + (s_semantic * 0.25) + (s_rule * 0.30)
    
    # Determine status
    if final_score >= 0.92:
        status = "VERIFIED"
        review_required = False
        review_priority = None
    elif final_score >= 0.60:
        status = "NEEDS_HUMAN_REVIEW"
        review_required = True
        review_priority = "MEDIUM"
    else:
        status = "FAILED"
        review_required = True
        review_priority = "HIGH"
        
    return {
        "final_score": final_score,
        "status": status,
        "review_required": review_required,
        "review_priority": review_priority,
        "breakdown": {
            "s_ocr": s_ocr,
            "s_spatial": s_spatial,
            "s_semantic": s_semantic,
            "s_rule": s_rule
        }
    }
