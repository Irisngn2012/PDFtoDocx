from pdf2docx import Converter
import sys

def pdf_to_docx(pdf_path, docx_path):
    cv = Converter(pdf_path)
    cv.convert(docx_path, start=0, end=None)  # Convert all pages
    cv.close()

if __name__ == "__main__":
    pdf_path = sys.argv[1]  # PDF input path from command line
    docx_path = sys.argv[2]  # DOCX output path from command line
    pdf_to_docx(pdf_path, docx_path)
