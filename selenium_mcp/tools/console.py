"""Browser console tools."""

import logging
from pydantic import BaseModel, Field

from ..tool_base import BaseTool, ToolSchema, ToolResult
from ..context import Context

logger = logging.getLogger(__name__)

class ConsoleParams(BaseModel):
    """Parameters for console operations."""
    action: str = Field(description="Console action: 'get_logs', 'clear'")
    level: str = Field(default="ALL", description="Log level filter: ALL, INFO, WARNING, SEVERE")

class ConsoleTool(BaseTool):
    """Access browser console logs."""
    
    def _create_schema(self) -> ToolSchema:
        return ToolSchema(
            name="console_logs",
            description="Get browser console logs or clear console",
            input_schema=ConsoleParams,
            tool_type="read_only"
        )
    
    async def handle(self, context: Context, params: ConsoleParams) -> ToolResult:
        """Handle console operations."""
        driver = context.current_tab_or_die()
        
        async def console_action():
            if params.action == "get_logs":
                try:
                    logs = driver.get_log('browser')
                    filtered_logs = []
                    
                    for log in logs:
                        if params.level == "ALL" or log['level'] == params.level:
                            filtered_logs.append(f"[{log['level']}] {log['message']}")
                    
                    logger.info(f"📋 Retrieved {len(filtered_logs)} console logs")
                    return "\n".join(filtered_logs) if filtered_logs else "No console logs found"
                    
                except Exception as e:
                    logger.warning(f"Could not retrieve console logs: {e}")
                    return "Console logs not available"
                    
            elif params.action == "clear":
                try:
                    # Clear console by executing JavaScript
                    driver.execute_script("console.clear();")
                    logger.info("📋 Cleared browser console")
                    return "Console cleared"
                except Exception as e:
                    logger.warning(f"Could not clear console: {e}")
                    return "Console clear failed"
            else:
                raise ValueError(f"Invalid console action: {params.action}")
        
        # Robot Framework code
        if params.action == "get_logs":
            code = [
                f"# Get browser console logs (level: {params.level})",
                "# Note: Console log retrieval not directly supported in Robot Framework"
            ]
        elif params.action == "clear":
            code = [
                "# Clear browser console",
                "Execute Javascript    console.clear();"
            ]
        else:
            code = [
                f"# Console action: {params.action}",
                "# Note: Console operations limited in Robot Framework"
            ]
        
        return ToolResult(
            code=code,
            action=console_action,
            capture_snapshot=False,
            wait_for_network=False
        )