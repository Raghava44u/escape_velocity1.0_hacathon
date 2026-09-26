import cv2
import numpy as np
import os

def analyze_image_quality(image_path: str) -> dict:
    if not os.path.exists(image_path):
        return {"status": "FAILED", "reason": "File not found"}
        
    try:
        # Load image
        img = cv2.imread(image_path)
        if img is None:
            return {"status": "FAILED", "reason": "Could not read image"}
            
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Calculate Laplacian variance (measure of blur)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        # Calculate brightness and contrast
        brightness = np.mean(gray)
        contrast = gray.std()
        
        # Determine quality class based on variance
        if laplacian_var < 50:
            quality = "UNREADABLE"
        elif laplacian_var < 100:
            quality = "SEVERE"
        elif laplacian_var < 300:
            quality = "MODERATE"
        else:
            quality = "GOOD"
            
        return {
            "status": "SUCCESS",
            "quality_class": quality,
            "metrics": {
                "laplacian_variance": float(laplacian_var),
                "brightness": float(brightness),
                "contrast": float(contrast),
                "resolution": f"{img.shape[1]}x{img.shape[0]}"
            }
        }
    except Exception as e:
        return {"status": "FAILED", "reason": str(e)}
