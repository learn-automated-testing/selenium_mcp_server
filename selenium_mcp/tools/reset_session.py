"""Session reset tool to force clean automation browser restart."""

import logging
import subprocess
from pydantic import BaseModel
from selenium_mcp.tool_base import BaseTool, ToolSchema, ToolResult
from selenium_mcp.context import Context

logger = logging.getLogger(__name__)

class ResetSessionParams(BaseModel):
    """Parameters for resetting automation browser session."""
    pass

class ResetSessionTool(BaseTool):
    """Force kill only automation browser processes and reset session for fresh start."""
    
    def _create_schema(self) -> ToolSchema:
        return ToolSchema(
            name="reset_automation_session",
            description="Force kill only automation browser processes (not personal Chrome) and reset session for fresh start",
            input_schema=ResetSessionParams,
            tool_type="destructive"
        )
    
    async def handle(self, context: Context, params: ResetSessionParams) -> ToolResult:
        """Reset automation browser session only."""
        
        async def reset_action():
            logger.info("🔄 Force resetting automation browser session...")
            
            # Close existing driver if it exists
            if context.browser_manager.driver:
                try:
                    context.browser_manager.driver.quit()
                except:
                    pass
                context.browser_manager.driver = None
                logger.info("✅ Closed existing WebDriver session")
            
            # Kill only ChromeDriver processes (not personal Chrome)
            try:
                # Kill ChromeDriver processes specifically
                subprocess.run(["pkill", "-f", "chromedriver"], capture_output=True)
                
                # Kill Chrome processes that have automation flags
                # Look for Chrome processes with --remote-debugging-port or --test-type
                result = subprocess.run(["pgrep", "-fl", "Google Chrome"], capture_output=True, text=True)
                if result.stdout:
                    for line in result.stdout.split('\n'):
                        if line and ('--remote-debugging-port' in line or '--test-type' in line or '--no-sandbox' in line):
                            pid = line.split()[0]
                            try:
                                subprocess.run(["kill", pid], capture_output=True)
                                logger.info(f"✅ Killed automation Chrome process {pid}")
                            except:
                                pass
                
                logger.info("✅ Killed automation browser processes only")
            except Exception as e:
                logger.warning(f"⚠️ Could not kill automation processes: {e}")
            
            # Clear context state
            context.current_snapshot = None
            context.action_history.clear()
            context.recording_enabled = False
            logger.info("✅ Cleared automation context state")
            
            return {"status": "Automation session reset complete - personal Chrome untouched"}
        
        code = [
            "# Force reset automation browser session only",
            "# This kills only automation Chrome/ChromeDriver processes"
        ]
        
        return ToolResult(
            code=code,
            action=reset_action,
            capture_snapshot=False
        )