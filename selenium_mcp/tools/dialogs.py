"""Dialog handling tools."""

import logging
from pydantic import BaseModel, Field

from ..tool_base import BaseTool, ToolSchema, ToolResult
from ..context import Context

logger = logging.getLogger(__name__)

class DialogParams(BaseModel):
    """Parameters for dialog handling."""
    action: str = Field(description="Dialog action: 'accept', 'dismiss', or 'get_text'")
    text: str = Field(default="", description="Text to enter in prompt dialog (optional)")

class DialogTool(BaseTool):
    """Handle browser dialogs (alerts, confirms, prompts)."""
    
    def _create_schema(self) -> ToolSchema:
        return ToolSchema(
            name="dialog_handle",
            description="Handle browser dialogs (alert, confirm, prompt)",
            input_schema=DialogParams,
            tool_type="destructive"
        )
    
    async def handle(self, context: Context, params: DialogParams) -> ToolResult:
        """Handle browser dialog."""
        driver = context.current_tab_or_die()
        
        async def dialog_action():
            try:
                alert = driver.switch_to.alert
                
                if params.action == "get_text":
                    text = alert.text
                    logger.info(f"🔔 Dialog text: {text}")
                    return text
                elif params.action == "accept":
                    if params.text:
                        alert.send_keys(params.text)
                    alert.accept()
                    logger.info(f"🔔 Accepted dialog")
                elif params.action == "dismiss":
                    alert.dismiss()
                    logger.info(f"🔔 Dismissed dialog")
                else:
                    raise ValueError(f"Invalid dialog action: {params.action}")
                    
            except Exception as e:
                logger.error(f"Dialog handling failed: {e}")
                raise
        
        # Robot Framework code
        if params.action == "accept":
            code = [
                "# Accept dialog",
                "Handle Alert    ACCEPT"
            ]
            if params.text:
                code.insert(1, f"Input Text Into Alert    {params.text}")
        elif params.action == "dismiss":
            code = [
                "# Dismiss dialog", 
                "Handle Alert    DISMISS"
            ]
        elif params.action == "get_text":
            code = [
                "# Get dialog text",
                "${dialog_text}=    Handle Alert    ACCEPT",
                "Log    ${dialog_text}"
            ]
        else:
            code = [
                f"# Handle dialog with action: {params.action}",
                "Handle Alert    ACCEPT"
            ]
        
        return ToolResult(
            code=code,
            action=dialog_action,
            capture_snapshot=True,
            wait_for_network=False
        )