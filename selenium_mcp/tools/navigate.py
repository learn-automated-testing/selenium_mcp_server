"""Navigation tools - matches playwright-mcp navigation exactly."""

import logging
from pydantic import BaseModel, Field

from ..tool_base import BaseTool, ToolSchema, ToolResult
from ..context import Context

logger = logging.getLogger(__name__)

class NavigateParams(BaseModel):
    """Parameters for navigation."""
    url: str = Field(description="The URL to navigate to")

class BackParams(BaseModel):
    """Parameters for going back."""
    # No parameters needed

class ForwardParams(BaseModel):
    """Parameters for going forward."""
    # No parameters needed

class NavigateTool(BaseTool):
    """Navigate to URL - matches playwright-mcp browser_navigate exactly."""
    
    def _create_schema(self) -> ToolSchema:
        return ToolSchema(
            name="navigate_to",
            description="Navigate to a URL",
            input_schema=NavigateParams,
            tool_type="destructive"
        )
    
    async def handle(self, context: Context, params: NavigateParams) -> ToolResult:
        """Navigate to URL."""
        
        # Debug: Log the received URL
        logger.info(f"🔍 Navigation request received: URL='{params.url}'")
        
        if not params.url or params.url.strip() == "":
            logger.error("❌ Empty URL received")
            raise ValueError("URL parameter is required and cannot be empty")
        
        # Navigation action
        async def navigate_action():
            driver = await context.ensure_browser()
            # Set page load timeout to prevent hanging
            driver.set_page_load_timeout(30)
            
            try:
                driver.get(params.url)
                logger.info(f"🚀 Navigated to: {params.url}")
            except Exception as e:
                # If page load times out, continue anyway
                logger.warning(f"⚠️ Page load timeout for {params.url}, continuing anyway")
                # Execute JavaScript to stop loading
                driver.execute_script("window.stop();")
        
        # Robot Framework code
        code = [
            f"# Navigate to {params.url}",
            f"Go To    {params.url}"
        ]
        
        return ToolResult(
            code=code,
            action=navigate_action,
            capture_snapshot=True,  # Auto-capture like playwright-mcp
            wait_for_network=True
        )

class GoBackTool(BaseTool):
    """Go back - matches playwright-mcp browser_back exactly."""
    
    def _create_schema(self) -> ToolSchema:
        return ToolSchema(
            name="go_back",
            description="Go back to the previous page",
            input_schema=BackParams,
            tool_type="destructive"
        )
    
    async def handle(self, context: Context, params: BackParams) -> ToolResult:
        """Go back to previous page."""
        
        # Back action
        async def back_action():
            driver = context.current_tab_or_die()
            driver.back()
            logger.info("⬅️ Went back")
        
        # Robot Framework code
        code = [
            "# Go back to previous page",
            "Go Back"
        ]
        
        return ToolResult(
            code=code,
            action=back_action,
            capture_snapshot=True,
            wait_for_network=True
        )

class GoForwardTool(BaseTool):
    """Go forward - matches playwright-mcp browser_forward exactly."""
    
    def _create_schema(self) -> ToolSchema:
        return ToolSchema(
            name="go_forward",
            description="Go forward to the next page",
            input_schema=ForwardParams,
            tool_type="destructive"
        )
    
    async def handle(self, context: Context, params: ForwardParams) -> ToolResult:
        """Go forward to next page."""
        
        # Forward action
        async def forward_action():
            driver = context.current_tab_or_die()
            driver.forward()
            logger.info("➡️ Went forward")
        
        # Robot Framework code
        code = [
            "# Go forward to next page",
            "Go Forward"
        ]
        
        return ToolResult(
            code=code,
            action=forward_action,
            capture_snapshot=True,
            wait_for_network=True
        )