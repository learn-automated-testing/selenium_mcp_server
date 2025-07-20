"""PDF generation tools."""

import logging
from pydantic import BaseModel, Field

from ..tool_base import BaseTool, ToolSchema, ToolResult
from ..context import Context

logger = logging.getLogger(__name__)

class PDFParams(BaseModel):
    """Parameters for PDF generation."""
    file_path: str = Field(description="Path where to save the PDF file")
    format: str = Field(default="A4", description="Paper format (A4, Letter, etc.)")
    landscape: bool = Field(default=False, description="Use landscape orientation")
    margin: dict = Field(default={}, description="Margins (top, right, bottom, left)")
    print_background: bool = Field(default=True, description="Include background graphics")

class PDFTool(BaseTool):
    """Generate PDF from current page."""
    
    def _create_schema(self) -> ToolSchema:
        return ToolSchema(
            name="pdf_generate",
            description="Generate a PDF from the current page",
            input_schema=PDFParams,
            tool_type="read_only"
        )
    
    async def handle(self, context: Context, params: PDFParams) -> ToolResult:
        """Generate PDF from current page."""
        driver = context.current_tab_or_die()
        
        async def pdf_action():
            try:
                import os
                import json
                
                # Prepare print options
                print_options = {
                    'paperFormat': params.format,
                    'landscape': params.landscape,
                    'printBackground': params.print_background
                }
                
                # Add margins if specified
                if params.margin:
                    print_options['marginTop'] = params.margin.get('top', 0)
                    print_options['marginRight'] = params.margin.get('right', 0)
                    print_options['marginBottom'] = params.margin.get('bottom', 0)
                    print_options['marginLeft'] = params.margin.get('left', 0)
                
                # Generate PDF using Chrome DevTools
                result = driver.execute_cdp_cmd('Page.printToPDF', print_options)
                
                # Save PDF data to file
                pdf_data = result['data']
                import base64
                
                with open(params.file_path, 'wb') as f:
                    f.write(base64.b64decode(pdf_data))
                
                logger.info(f"📄 Generated PDF: {params.file_path}")
                return f"PDF saved to {params.file_path}"
                
            except Exception as e:
                logger.error(f"PDF generation failed: {e}")
                
                # Fallback: try using selenium's print functionality
                try:
                    from selenium.webdriver.common.print_page_options import PrintOptions
                    
                    print_options = PrintOptions()
                    print_options.page_ranges = ['1-']
                    
                    pdf_data = driver.print_page(print_options)
                    
                    with open(params.file_path, 'wb') as f:
                        f.write(pdf_data)
                        
                    logger.info(f"📄 Generated PDF (fallback): {params.file_path}")
                    return f"PDF saved to {params.file_path}"
                    
                except Exception as e2:
                    logger.error(f"PDF generation fallback failed: {e2}")
                    raise Exception(f"PDF generation failed: {e}, fallback failed: {e2}")
        
        # Robot Framework code
        orientation = "landscape" if params.landscape else "portrait"
        code = [
            f"# Generate PDF to {params.file_path}",
            f"# Format: {params.format}, Orientation: {orientation}",
            "# Note: PDF generation not directly supported in Robot Framework"
        ]
        
        return ToolResult(
            code=code,
            action=pdf_action,
            capture_snapshot=False,
            wait_for_network=False
        )