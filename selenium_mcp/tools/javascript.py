"""JavaScript execution tools."""

import logging
from pydantic import BaseModel, Field

from ..tool_base import BaseTool, ToolSchema, ToolResult
from ..context import Context

logger = logging.getLogger(__name__)

class JavaScriptParams(BaseModel):
    """Parameters for JavaScript execution."""
    script: str = Field(description="JavaScript code to execute")
    args: list = Field(default=[], description="Arguments to pass to the script")

class JavaScriptTool(BaseTool):
    """Execute JavaScript code in the browser."""
    
    def _create_schema(self) -> ToolSchema:
        return ToolSchema(
            name="javascript_execute",
            description="Execute JavaScript code in the browser",
            input_schema=JavaScriptParams,
            tool_type="destructive"
        )
    
    async def handle(self, context: Context, params: JavaScriptParams) -> ToolResult:
        """Execute JavaScript code."""
        driver = context.current_tab_or_die()
        
        async def js_action():
            try:
                if params.args:
                    result = driver.execute_script(params.script, *params.args)
                else:
                    result = driver.execute_script(params.script)
                
                logger.info(f"🟡 Executed JavaScript: {params.script[:100]}...")
                return result
            except Exception as e:
                logger.error(f"JavaScript execution failed: {e}")
                raise
        
        # Robot Framework code
        code = [
            f"# Execute JavaScript",
            f"Execute Javascript    {params.script}"
        ]
        
        if params.args:
            code.append(f"# Note: Arguments not directly supported in Robot Framework JS execution")
        
        return ToolResult(
            code=code,
            action=js_action,
            capture_snapshot=True,
            wait_for_network=False
        )