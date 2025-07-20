"""Drag and drop tools."""

import logging
from pydantic import BaseModel, Field

from ..tool_base import BaseTool, ToolSchema, ToolResult
from ..context import Context

logger = logging.getLogger(__name__)

class DragDropParams(BaseModel):
    """Parameters for drag and drop."""
    source_element: str = Field(description="Source element description")
    source_ref: str = Field(description="Source element reference from page snapshot")
    target_element: str = Field(description="Target element description")
    target_ref: str = Field(description="Target element reference from page snapshot")

class DragDropTool(BaseTool):
    """Drag and drop from one element to another."""
    
    def _create_schema(self) -> ToolSchema:
        return ToolSchema(
            name="drag_drop",
            description="Drag and drop from source element to target element",
            input_schema=DragDropParams,
            tool_type="destructive"
        )
    
    async def handle(self, context: Context, params: DragDropParams) -> ToolResult:
        """Perform drag and drop operation."""
        driver = context.current_tab_or_die()
        snapshot = context.snapshot_or_die()
        
        source_by, source_locator = snapshot.ref_locator(params.source_ref)
        target_by, target_locator = snapshot.ref_locator(params.target_ref)
        
        async def drag_drop_action():
            from selenium.webdriver.common.action_chains import ActionChains
            
            source_element = driver.find_element(source_by, source_locator)
            target_element = driver.find_element(target_by, target_locator)
            
            actions = ActionChains(driver)
            actions.drag_and_drop(source_element, target_element).perform()
            
            logger.info(f"🔄 Dragged {params.source_element} to {params.target_element}")
        
        # Robot Framework code
        code = [
            f"# Drag {params.source_element} to {params.target_element}",
            f"Drag And Drop    {source_locator}    {target_locator}"
        ]
        
        return ToolResult(
            code=code,
            action=drag_drop_action,
            capture_snapshot=True,
            wait_for_network=True
        )