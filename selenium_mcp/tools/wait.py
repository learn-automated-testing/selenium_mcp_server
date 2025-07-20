"""Wait and timing tools."""

import logging
from pydantic import BaseModel, Field

from ..tool_base import BaseTool, ToolSchema, ToolResult
from ..context import Context

logger = logging.getLogger(__name__)

class WaitParams(BaseModel):
    """Parameters for wait operations."""
    condition: str = Field(description="Wait condition: 'time', 'element_visible', 'element_hidden', 'page_load'")
    timeout: float = Field(default=10.0, description="Timeout in seconds")
    element: str = Field(default="", description="Element description (for element conditions)")
    ref: str = Field(default="", description="Element reference (for element conditions)")
    duration: float = Field(default=1.0, description="Duration in seconds (for time condition)")

class WaitTool(BaseTool):
    """Wait for various conditions."""
    
    def _create_schema(self) -> ToolSchema:
        return ToolSchema(
            name="wait_for",
            description="Wait for specified conditions (time, element visibility, page load)",
            input_schema=WaitParams,
            tool_type="read_only"
        )
    
    async def handle(self, context: Context, params: WaitParams) -> ToolResult:
        """Wait for specified condition."""
        driver = context.current_tab_or_die()
        
        async def wait_action():
            import time
            from selenium.webdriver.support.ui import WebDriverWait
            from selenium.webdriver.support import expected_conditions as EC
            from selenium.webdriver.common.by import By
            
            if params.condition == "time":
                time.sleep(params.duration)
                logger.info(f"⏱️ Waited for {params.duration} seconds")
                return f"Waited {params.duration} seconds"
                
            elif params.condition == "element_visible":
                if not params.ref:
                    raise ValueError("Element reference required for element_visible condition")
                    
                snapshot = context.snapshot_or_die()
                by, locator_value = snapshot.ref_locator(params.ref)
                
                wait = WebDriverWait(driver, params.timeout)
                wait.until(EC.visibility_of_element_located((by, locator_value)))
                logger.info(f"⏱️ Element {params.element} became visible")
                return f"Element {params.element} is visible"
                
            elif params.condition == "element_hidden":
                if not params.ref:
                    raise ValueError("Element reference required for element_hidden condition")
                    
                snapshot = context.snapshot_or_die()
                by, locator_value = snapshot.ref_locator(params.ref)
                
                wait = WebDriverWait(driver, params.timeout)
                wait.until(EC.invisibility_of_element_located((by, locator_value)))
                logger.info(f"⏱️ Element {params.element} became hidden")
                return f"Element {params.element} is hidden"
                
            elif params.condition == "page_load":
                wait = WebDriverWait(driver, params.timeout)
                wait.until(lambda d: d.execute_script("return document.readyState") == "complete")
                logger.info(f"⏱️ Page load completed")
                return "Page load completed"
                
            else:
                raise ValueError(f"Invalid wait condition: {params.condition}")
        
        # Robot Framework code
        if params.condition == "time":
            code = [
                f"# Wait for {params.duration} seconds",
                f"Sleep    {params.duration}s"
            ]
        elif params.condition == "element_visible":
            snapshot = context.snapshot_or_die() if params.ref else None
            if snapshot:
                by, locator_value = snapshot.ref_locator(params.ref)
                code = [
                    f"# Wait for {params.element} to be visible",
                    f"Wait Until Element Is Visible    {locator_value}    timeout={params.timeout}s"
                ]
            else:
                code = [
                    f"# Wait for element to be visible",
                    "# Note: Element reference required"
                ]
        elif params.condition == "element_hidden":
            snapshot = context.snapshot_or_die() if params.ref else None
            if snapshot:
                by, locator_value = snapshot.ref_locator(params.ref)
                code = [
                    f"# Wait for {params.element} to be hidden",
                    f"Wait Until Element Is Not Visible    {locator_value}    timeout={params.timeout}s"
                ]
            else:
                code = [
                    f"# Wait for element to be hidden",
                    "# Note: Element reference required"
                ]
        elif params.condition == "page_load":
            code = [
                "# Wait for page to load completely",
                f"Wait Until Keyword Succeeds    {params.timeout}s    1s    Execute Javascript    return document.readyState === 'complete'"
            ]
        else:
            code = [
                f"# Wait for condition: {params.condition}",
                f"Sleep    {params.timeout}s"
            ]
        
        return ToolResult(
            code=code,
            action=wait_action,
            capture_snapshot=False,
            wait_for_network=False
        )