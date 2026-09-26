import fitz # PyMuPDF
import os

def process_pdf(file_path: str, output_dir: str, doc_id: str):
    """
    Extracts text, bounding boxes, and renders PDF pages to images.
    Returns extracted data and paths to rendered images.
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir, exist_ok=True)
        
    doc = fitz.open(file_path)
    extracted_pages = []
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        
        # Render image for OpenCV analysis and frontend display
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2)) # 2x zoom for better resolution
        image_path = os.path.join(output_dir, f"{doc_id}_page_{page_num+1}.png")
        pix.save(image_path)
        
        # Extract text blocks with coordinates
        blocks = page.get_text("dict")["blocks"]
        text_regions = []
        
        for b in blocks:
            if "lines" in b:
                for l in b["lines"]:
                    line_text = ""
                    bbox = [10000, 10000, -10000, -10000]
                    for s in l["spans"]:
                        text = s["text"].strip()
                        if text:
                            line_text += text + " "
                            sb = s["bbox"]
                            bbox[0] = min(bbox[0], sb[0])
                            bbox[1] = min(bbox[1], sb[1])
                            bbox[2] = max(bbox[2], sb[2])
                            bbox[3] = max(bbox[3], sb[3])
                            
                    line_text = line_text.strip()
                    if line_text and bbox[0] != 10000:
                        page_rect = page.rect
                        width = page_rect.width
                        height = page_rect.height
                        
                        normalized_bbox = [
                            (bbox[1] / height) * 1000, # ymin
                            (bbox[0] / width) * 1000,  # xmin
                            (bbox[3] / height) * 1000, # ymax
                            (bbox[2] / width) * 1000   # xmax
                        ]
                        
                        text_regions.append({
                            "text": line_text,
                            "pixel_bbox": bbox,
                            "normalized_bbox": normalized_bbox
                        })
                            
        extracted_pages.append({
            "page_num": page_num + 1,
            "image_path": image_path,
            "text_regions": text_regions
        })
        
    return extracted_pages
