"""File upload tools."""

import logging
from pydantic import BaseModel, Field

from ..tool_base import BaseTool, ToolSchema, ToolResult
from ..context import Context

logger = logging.getLogger(__name__)

class FileUploadParams(BaseModel):
    """Parameters for file upload."""
    element: str = Field(description="File input element description")
    ref: str = Field(description="File input element reference from page snapshot")
    file_path: str = Field(description="Path to file to upload")

class FileUploadTool(BaseTool):
    """Upload a file through a file input element."""
    
    def _create_schema(self) -> ToolSchema:
        return ToolSchema(
            name="file_upload",
            description="Upload a file through a file input element",
            input_schema=FileUploadParams,
            tool_type="destructive"
        )
    
    async def handle(self, context: Context, params: FileUploadParams) -> ToolResult:
        """Upload file to input element."""
        driver = context.current_tab_or_die()
        snapshot = context.snapshot_or_die()
        
        by, locator_value = snapshot.ref_locator(params.ref)
        
        async def upload_action():
            import os
            
            # Verify file exists
            if not os.path.exists(params.file_path):
                raise FileNotFoundError(f"File not found: {params.file_path}")
            
            file_input = driver.find_element(by, locator_value)
            file_input.send_keys(os.path.abspath(params.file_path))
            
            logger.info(f"📎 Uploaded file {params.file_path} to {params.element}")
        
        # Robot Framework code
        code = [
            f"# Upload file to {params.element}",
            f"Choose File    {locator_value}    {params.file_path}"
        ]
        
        return ToolResult(
            code=code,
            action=upload_action,
            capture_snapshot=True,
            wait_for_network=True
        )