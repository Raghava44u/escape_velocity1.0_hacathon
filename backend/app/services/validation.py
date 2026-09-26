def validate_invoice_math(line_items: list, subtotal: float, tax: float, total: float) -> dict:
    tolerance = 0.05
    calculated_subtotal = sum([item.get('amount', 0) for item in line_items])
    
    subtotal_match = abs(calculated_subtotal - subtotal) <= tolerance
    total_match = abs((subtotal + tax) - total) <= tolerance
    
    line_item_matches = []
    for item in line_items:
        qty = item.get('quantity', 0)
        price = item.get('unit_price', 0)
        amt = item.get('amount', 0)
        if qty and price:
            match = abs((qty * price) - amt) <= tolerance
            line_item_matches.append(match)
        else:
            line_item_matches.append(True) # Cannot validate, assume true or skip
            
    is_valid = subtotal_match and total_match and all(line_item_matches)
    
    return {
        "is_valid": is_valid,
        "subtotal_match": subtotal_match,
        "total_match": total_match,
        "line_item_matches": line_item_matches,
        "calculated_total": subtotal + tax,
        "printed_total": total,
        "calculated_subtotal": calculated_subtotal,
        "printed_subtotal": subtotal
    }
