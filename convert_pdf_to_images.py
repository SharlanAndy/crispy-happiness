#!/usr/bin/env python3
"""
Convert PDF pages to PNG images
"""
import sys
from pathlib import Path

try:
    from pdf2image import convert_from_path
    from PIL import Image
except ImportError:
    print("Installing required packages...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pdf2image", "pillow"])
    from pdf2image import convert_from_path
    from PIL import Image

def convert_pdf_to_images(pdf_path, output_dir=None, dpi=200):
    """
    Convert each page of a PDF to a PNG image
    
    Args:
        pdf_path: Path to the PDF file
        output_dir: Directory to save images (default: same as PDF with _pages suffix)
        dpi: Resolution for the images (default: 200)
    """
    pdf_path = Path(pdf_path)
    
    if not pdf_path.exists():
        print(f"Error: PDF file not found: {pdf_path}")
        return
    
    if output_dir is None:
        output_dir = pdf_path.parent / f"{pdf_path.stem}_pages"
    else:
        output_dir = Path(output_dir)
    
    output_dir.mkdir(exist_ok=True)
    
    print(f"Converting {pdf_path.name} to images...")
    print(f"Output directory: {output_dir}")
    
    try:
        # Convert PDF to images
        images = convert_from_path(str(pdf_path), dpi=dpi)
        
        print(f"Found {len(images)} pages")
        
        # Save each page as PNG
        for i, image in enumerate(images, start=1):
            output_path = output_dir / f"page_{i:03d}.png"
            image.save(output_path, "PNG")
            print(f"  Saved page {i}: {output_path.name}")
        
        print(f"\n✓ Successfully converted {len(images)} pages to {output_dir}")
        return output_dir
        
    except Exception as e:
        print(f"Error converting PDF: {e}")
        print("\nNote: On macOS, you may need to install poppler:")
        print("  brew install poppler")
        return None

if __name__ == "__main__":
    # List of PDF files to convert
    pdf_files = [
        "NBN Agent & Share Holder View.pdf",
        "NBN Merchant View.pdf",
        "NBN T3 Admin.pdf",
        "NBN System Admin.pdf"
    ]
    
    base_dir = Path(__file__).parent
    
    for pdf_file in pdf_files:
        pdf_path = base_dir / pdf_file
        if pdf_path.exists():
            convert_pdf_to_images(pdf_path)
            print()
        else:
            print(f"Warning: {pdf_file} not found, skipping...")
            print()

