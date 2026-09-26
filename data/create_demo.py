import os

def create_demo_files():
    demo_dir = "d:/Escape-hacathon/data/demo"
    os.makedirs(demo_dir, exist_ok=True)
    
    # Just creating dummy files for upload
    with open(os.path.join(demo_dir, "clean_invoice.pdf"), "wb") as f:
        f.write(b"%PDF-1.4\n1 0 obj\n<< /Title (Clean Invoice) >>\nendobj\n")
        
    with open(os.path.join(demo_dir, "blurred_invoice.pdf"), "wb") as f:
        f.write(b"%PDF-1.4\n1 0 obj\n<< /Title (Blurred Invoice) >>\nendobj\n")
        
    with open(os.path.join(demo_dir, "wrong_total_invoice.pdf"), "wb") as f:
        f.write(b"%PDF-1.4\n1 0 obj\n<< /Title (Wrong Total Invoice) >>\nendobj\n")
        
    with open(os.path.join(demo_dir, "tampered_invoice.pdf"), "wb") as f:
        f.write(b"%PDF-1.4\n1 0 obj\n<< /Title (Tampered Invoice) >>\nendobj\n")

if __name__ == "__main__":
    create_demo_files()
    print("Demo files created.")
