import os
import re
import tempfile
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
from fpdf import FPDF

def render_latex_to_image(latex_str: str, out_path: str, is_block: bool = False):
    """
    Renders LaTeX formula to a transparent PNG image using matplotlib's mathtext engine.
    """
    # Clean the string to ensure valid mathtext
    formula = latex_str.strip()
    if not (formula.startswith('$') and formula.endswith('$')):
        formula = f"${formula}$"
        
    dpi = 300
    fontsize = 12 if not is_block else 14
    
    # Render using matplotlib
    fig = plt.figure(figsize=(0.1, 0.1))
    text = fig.text(0, 0, formula, fontsize=fontsize, color='black')
    
    # Force drawing to calculate text extent
    fig.canvas.draw()
    bbox = text.get_window_extent()
    
    # Calculate dimensions in inches
    width = bbox.width / dpi
    height = bbox.height / dpi
    
    # Resize figure to match text box dimensions precisely
    fig.set_size_inches(width + 0.1, height + 0.1)
    
    # Save the figure
    plt.savefig(
        out_path, 
        dpi=dpi, 
        transparent=True, 
        bbox_inches='tight', 
        pad_inches=0.02
    )
    plt.close(fig)
    
    # Return width/height in points (1 inch = 72 points) for FPDF positioning
    return (width + 0.1) * 72, (height + 0.1) * 72

class AeroLearnPDF(FPDF):
    def __init__(self):
        super().__init__()
        self.set_margins(20, 20, 20)
        self.add_page()
        # Set default font
        self.set_font("Helvetica", size=11)
        self.temp_files = []

    def cleanup(self):
        for f in self.temp_files:
            if os.path.exists(f):
                try:
                    os.remove(f)
                except Exception:
                    pass

    def add_markdown_content(self, title: str, text: str):
        # 1. Page Title Header
        self.set_font("Helvetica", "B", size=24)
        self.cell(0, 15, title, ln=True)
        self.ln(5)
        
        # Split text into lines
        lines = text.split("\n")
        
        in_list = False
        
        for line in lines:
            line_str = line.strip()
            if not line_str:
                if in_list:
                    self.ln(2)
                    in_list = False
                else:
                    self.ln(4)
                continue
                
            # Headers: # h1, ## h2, ### h3
            if line_str.startswith("# "):
                self.ln(4)
                self.set_font("Helvetica", "B", size=18)
                self.cell(0, 10, line_str[2:], ln=True)
                self.set_font("Helvetica", size=11)
                self.ln(2)
                continue
            elif line_str.startswith("## "):
                self.ln(3)
                self.set_font("Helvetica", "B", size=14)
                self.cell(0, 8, line_str[3:], ln=True)
                self.set_font("Helvetica", size=11)
                self.ln(2)
                continue
            elif line_str.startswith("### "):
                self.ln(2)
                self.set_font("Helvetica", "B", size=12)
                self.cell(0, 6, line_str[4:], ln=True)
                self.set_font("Helvetica", size=11)
                self.ln(1)
                continue
                
            # Block math $$...$$
            if line_str.startswith("$$") and line_str.endswith("$$"):
                math_content = line_str[2:-2].strip()
                self.ln(3)
                try:
                    # Render block equation
                    fd, temp_img = tempfile.mkstemp(suffix=".png")
                    os.close(fd)
                    self.temp_files.append(temp_img)
                    
                    w_pt, h_pt = render_latex_to_image(math_content, temp_img, is_block=True)
                    
                    # Convert dimensions to mm (1 mm = 2.83 points)
                    w_mm = w_pt / 2.83
                    h_mm = h_pt / 2.83
                    
                    # Center the image
                    x_pos = (self.epw - w_mm) / 2 + self.l_margin
                    self.image(temp_img, x=x_pos, y=self.get_y(), w=w_mm, h=h_mm)
                    self.ln(h_mm + 4)
                except Exception as e:
                    # Fallback to plain text if LaTeX fails to render
                    print(f"[PDF Latx Error] {e}")
                    self.set_font("Courier", size=10)
                    self.multi_cell(0, 6, line_str)
                    self.set_font("Helvetica", size=11)
                    self.ln(2)
                continue
                
            # List items
            if line_str.startswith("- ") or line_str.startswith("* "):
                in_list = True
                item_content = line_str[2:]
                self.set_x(25)
                # Print bullet point
                self.cell(5, 6, chr(149), ln=False)
                self.render_paragraph_with_inline_math(item_content)
                continue
                
            # Ordered lists (e.g. 1. )
            num_match = re.match(r"^(\d+)\.\s+(.*)$", line_str)
            if num_match:
                in_list = True
                index = num_match.group(1)
                item_content = num_match.group(2)
                self.set_x(25)
                self.cell(8, 6, f"{index}.", ln=False)
                self.render_paragraph_with_inline_math(item_content)
                continue
                
            # Standard Paragraph
            self.set_x(20)
            self.render_paragraph_with_inline_math(line_str)
            
    def render_paragraph_with_inline_math(self, text: str):
        """
        Parses text for inline math formulas (between single $) and renders them as embedded images.
        """
        # Split by single $
        parts = re.split(r"(\$[^\$]+\$)", text)
        
        # Generous line-height sizing
        line_height = 6.5
        
        for part in parts:
            if not part:
                continue
            if part.startswith("$") and part.endswith("$"):
                math_content = part[1:-1].strip()
                try:
                    # Create temporary image file
                    fd, temp_img = tempfile.mkstemp(suffix=".png")
                    os.close(fd)
                    self.temp_files.append(temp_img)
                    
                    w_pt, h_pt = render_latex_to_image(math_content, temp_img, is_block=False)
                    
                    w_mm = w_pt / 2.83
                    h_mm = h_pt / 2.83
                    
                    # Check page break
                    if self.get_y() + h_mm > self.page_break_trigger:
                        self.add_page()
                        
                    # Write image inline at current (x, y)
                    x_start = self.get_x()
                    y_start = self.get_y()
                    
                    # Align slightly below the baseline for natural text flow
                    self.image(temp_img, x=x_start, y=y_start + 0.8, w=w_mm, h=h_mm)
                    self.set_xy(x_start + w_mm + 1, y_start)
                except Exception as e:
                    # Fallback to plain math text
                    print(f"[PDF Inline LaTeX Error] {e}")
                    self.write(line_height, part)
            else:
                # Regular text
                self.write(line_height, part)
        self.ln(line_height)

def generate_pdf_bytes(title: str, text: str) -> bytes:
    """
    Primary API entry point to build document PDFs.
    """
    pdf = AeroLearnPDF()
    try:
        pdf.add_markdown_content(title, text)
        pdf_data = pdf.output(dest='S')
        # Ensure we return a bytes object
        if isinstance(pdf_data, str):
            return pdf_data.encode('latin1')
        return pdf_data
    finally:
        pdf.cleanup()
