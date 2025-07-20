"""Mouse interaction tools."""

import logging
from pydantic import BaseModel, Field

from ..tool_base import BaseTool, ToolSchema, ToolResult
from ..context import Context

logger = logging.getLogger(__name__)

class MouseMoveParams(BaseModel):
    """Parameters for mouse movement."""
    x: int = Field(description="X coordinate")
    y: int = Field(description="Y coordinate")

class MouseClickParams(BaseModel):
    """Parameters for mouse clicking."""
    element: str = Field(description="Human-readable element description")
    ref: str = Field(description="Element reference from page snapshot")
    button: str = Field(default="left", description="Mouse button to click (left, right, middle)")

class MouseDragParams(BaseModel):
    """Parameters for mouse dragging."""
    from_element: str = Field(description="Source element description")
    from_ref: str = Field(description="Source element reference")
    to_element: str = Field(description="Target element description") 
    to_ref: str = Field(description="Target element reference")

class MouseMoveTool(BaseTool):
    """Move mouse to coordinates."""
    
    def _create_schema(self) -> ToolSchema:
        return ToolSchema(
            name="mouse_move",
            description="Move mouse to specific coordinates",
            input_schema=MouseMoveParams,
            tool_type="destructive"
        )
    
    async def handle(self, context: Context, params: MouseMoveParams) -> ToolResult:
        """Move mouse to coordinates."""
        
        async def move_action():
            logger.info(f"🖱️ Moving mouse to coordinates ({params.x}, {params.y})")
        
        code = [
            f"# Move mouse to coordinates ({params.x}, {params.y})",
            f"# Note: Mouse movement to coordinates not directly supported in Robot Framework"
        ]
        
        return ToolResult(
            code=code,
            action=move_action,
            capture_snapshot=False,
            wait_for_network=False
        )

class MouseClickTool(BaseTool):
    """Click on element with mouse."""
    
    def _create_schema(self) -> ToolSchema:
        return ToolSchema(
            name="mouse_click",
            description="Click on an element using mouse",
            input_schema=MouseClickParams,
            tool_type="destructive"
        )
    
    async def handle(self, context: Context, params: MouseClickParams) -> ToolResult:
        """Click on element."""
        driver = context.current_tab_or_die()
        snapshot = context.snapshot_or_die()
        
        by, locator_value = snapshot.ref_locator(params.ref)
        
        async def click_action():
            element = driver.find_element(by, locator_value)
            element.click()
            logger.info(f"🖱️ Clicked on {params.element} with {params.button} button")
        
        code = [
            f"# Click on {params.element}",
            f"Click Element    {locator_value}"
        ]
        
        return ToolResult(
            code=code,
            action=click_action,
            capture_snapshot=True,
            wait_for_network=True
        )

class MouseDragTool(BaseTool):
    """Drag from one element to another."""
    
    def _create_schema(self) -> ToolSchema:
        return ToolSchema(
            name="mouse_drag",
            description="Drag from one element to another",
            input_schema=MouseDragParams,
            tool_type="destructive"
        )
    
    async def handle(self, context: Context, params: MouseDragParams) -> ToolResult:
        """Drag from source to target element."""
        driver = context.current_tab_or_die()
        snapshot = context.snapshot_or_die()
        
        from_by, from_locator = snapshot.ref_locator(params.from_ref)
        to_by, to_locator = snapshot.ref_locator(params.to_ref)
        
        async def drag_action():
            from selenium.webdriver.common.action_chains import ActionChains
            source = driver.find_element(from_by, from_locator)
            target = driver.find_element(to_by, to_locator)
            ActionChains(driver).drag_and_drop(source, target).perform()
            logger.info(f"🖱️ Dragged from {params.from_element} to {params.to_element}")
        
        code = [
            f"# Drag from {params.from_element} to {params.to_element}",
            f"Drag And Drop    {from_locator}    {to_locator}"
        ]
        
        return ToolResult(
            code=code,
            action=drag_action,
            capture_snapshot=True,
            wait_for_network=True
        )