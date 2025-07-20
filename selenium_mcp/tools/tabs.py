"""Tab management tools."""

import logging
from pydantic import BaseModel, Field

from ..tool_base import BaseTool, ToolSchema, ToolResult
from ..context import Context

logger = logging.getLogger(__name__)

class TabListParams(BaseModel):
    """Parameters for listing tabs."""
    # No parameters needed

class TabSelectParams(BaseModel):
    """Parameters for selecting a tab."""
    tab_id: int = Field(description="Tab ID to select")

class TabNewParams(BaseModel):
    """Parameters for creating a new tab."""
    url: str = Field(default="", description="URL to open in new tab (optional)")

class TabCloseParams(BaseModel):
    """Parameters for closing a tab."""
    tab_id: int = Field(description="Tab ID to close")

class TabListTool(BaseTool):
    """List all open tabs."""
    
    def _create_schema(self) -> ToolSchema:
        return ToolSchema(
            name="tab_list",
            description="List all open browser tabs",
            input_schema=TabListParams,
            tool_type="read_only"
        )
    
    async def handle(self, context: Context, params: TabListParams) -> ToolResult:
        """List all tabs."""
        
        async def list_action():
            driver = await context.ensure_browser()
            handles = driver.window_handles
            current_handle = driver.current_window_handle
            
            tabs_info = []
            for i, handle in enumerate(handles):
                driver.switch_to.window(handle)
                title = driver.title
                url = driver.current_url
                is_current = handle == current_handle
                tabs_info.append(f"Tab {i}: {title} - {url} {'(current)' if is_current else ''}")
            
            # Switch back to original tab
            driver.switch_to.window(current_handle)
            
            logger.info(f"📑 Listed {len(handles)} tabs")
            return "\n".join(tabs_info)
        
        code = [
            "# List all browser tabs",
            "# Note: Tab listing not directly supported in Robot Framework"
        ]
        
        return ToolResult(
            code=code,
            action=list_action,
            capture_snapshot=False,
            wait_for_network=False
        )

class TabSelectTool(BaseTool):
    """Select a specific tab."""
    
    def _create_schema(self) -> ToolSchema:
        return ToolSchema(
            name="tab_select",
            description="Switch to a specific browser tab",
            input_schema=TabSelectParams,
            tool_type="destructive"
        )
    
    async def handle(self, context: Context, params: TabSelectParams) -> ToolResult:
        """Select tab by ID."""
        
        async def select_action():
            driver = context.current_tab_or_die()
            handles = driver.window_handles
            
            if 0 <= params.tab_id < len(handles):
                driver.switch_to.window(handles[params.tab_id])
                logger.info(f"📑 Switched to tab {params.tab_id}")
            else:
                raise ValueError(f"Tab ID {params.tab_id} not found. Available tabs: 0-{len(handles)-1}")
        
        code = [
            f"# Switch to tab {params.tab_id}",
            f"Switch Window    NEW"  # Robot Framework approach
        ]
        
        return ToolResult(
            code=code,
            action=select_action,
            capture_snapshot=True,
            wait_for_network=True
        )

class TabNewTool(BaseTool):
    """Open a new browser tab."""
    
    def _create_schema(self) -> ToolSchema:
        return ToolSchema(
            name="tab_new",
            description="Open a new browser tab",
            input_schema=TabNewParams,
            tool_type="destructive"
        )
    
    async def handle(self, context: Context, params: TabNewParams) -> ToolResult:
        """Open new tab."""
        
        async def new_tab_action():
            driver = context.current_tab_or_die()
            driver.execute_script("window.open('');")
            driver.switch_to.window(driver.window_handles[-1])
            
            if params.url:
                driver.get(params.url)
                logger.info(f"📑 Opened new tab and navigated to {params.url}")
            else:
                logger.info("📑 Opened new blank tab")
        
        code = [
            "# Open new browser tab",
            "Execute Javascript    window.open('')",
            "Switch Window    NEW"
        ]
        
        if params.url:
            code.extend([
                f"# Navigate to {params.url}",
                f"Go To    {params.url}"
            ])
        
        return ToolResult(
            code=code,
            action=new_tab_action,
            capture_snapshot=True,
            wait_for_network=True
        )

class TabCloseTool(BaseTool):
    """Close a specific tab."""
    
    def _create_schema(self) -> ToolSchema:
        return ToolSchema(
            name="tab_close",
            description="Close a specific browser tab",
            input_schema=TabCloseParams,
            tool_type="destructive"
        )
    
    async def handle(self, context: Context, params: TabCloseParams) -> ToolResult:
        """Close tab by ID."""
        
        async def close_action():
            driver = context.current_tab_or_die()
            handles = driver.window_handles
            
            if 0 <= params.tab_id < len(handles):
                current_handle = driver.current_window_handle
                target_handle = handles[params.tab_id]
                
                driver.switch_to.window(target_handle)
                driver.close()
                
                # Switch to another tab if we closed the current one
                remaining_handles = [h for h in handles if h != target_handle]
                if remaining_handles:
                    if target_handle == current_handle:
                        driver.switch_to.window(remaining_handles[0])
                
                logger.info(f"📑 Closed tab {params.tab_id}")
            else:
                raise ValueError(f"Tab ID {params.tab_id} not found. Available tabs: 0-{len(handles)-1}")
        
        code = [
            f"# Close tab {params.tab_id}",
            "Close Window"
        ]
        
        return ToolResult(
            code=code,
            action=close_action,
            capture_snapshot=True,
            wait_for_network=False
        )