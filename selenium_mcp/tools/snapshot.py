"""Snapshot and element interaction tools - matches playwright-mcp snapshot.ts exactly."""

import logging
from typing import List
from pydantic import BaseModel, Field
from selenium.webdriver.common.by import By

from ..tool_base import BaseTool, ToolSchema, ToolResult
from ..context import Context

logger = logging.getLogger(__name__)

class SnapshotParams(BaseModel):
    """Parameters for capturing snapshot."""
    # No parameters needed for snapshot

class ClickParams(BaseModel):
    """Parameters for clicking - matches playwright-mcp elementSchema exactly."""
    element: str = Field(description="Human-readable element description used to obtain permission to interact with the element")
    ref: str = Field(description="Exact target element reference from the page snapshot")

class SnapshotTool(BaseTool):
    """Capture page snapshot - matches playwright-mcp browser_snapshot exactly."""
    
    def _create_schema(self) -> ToolSchema:
        return ToolSchema(
            name="capture_page",
            description="Capture DOM snapshot of the current page for element analysis",
            input_schema=SnapshotParams,
            tool_type="readOnly"
        )
    
    async def handle(self, context: Context, params: SnapshotParams) -> ToolResult:
        """Capture snapshot - matches playwright-mcp snapshot handle."""
        # Snapshot action
        async def snapshot_action():
            # Ensure browser exists
            driver = await context.ensure_browser()
            
            # Capture the snapshot like playwright-mcp does
            await context.capture_snapshot()
            
            if context.current_snapshot:
                element_count = len(context.current_snapshot.elements)
                logger.info(f"📸 Captured snapshot with {element_count} elements")
                
                # Generate YAML accessibility tree like playwright-mcp
                yaml_lines = []
                yaml_lines.append("### Page state")
                yaml_lines.append(f"- Page URL: {context.current_snapshot.url}")
                yaml_lines.append(f"- Page Title: {context.current_snapshot.title}")
                yaml_lines.append("- Page Snapshot:")
                yaml_lines.append("```yaml")
                
                # Build accessibility tree in YAML format
                for ref, element in context.current_snapshot.elements.items():
                    # Format element like playwright-mcp
                    element_line = f"- {element.tag_name}"
                    
                    # Add text in quotes if present
                    if element.text:
                        element_line += f' "{element.text}"'
                    
                    # Add properties in brackets
                    props = []
                    props.append(f"[ref={ref}]")
                    
                    if element.attributes.get("role"):
                        props.append(f'[role={element.attributes["role"]}]')
                    
                    if not element.is_clickable:
                        props.append("[disabled]")
                    
                    # Special handling for specific elements
                    if element.tag_name == "h1":
                        props.append("[level=1]")
                    elif element.tag_name == "h2":
                        props.append("[level=2]")
                    elif element.tag_name == "h3":
                        props.append("[level=3]")
                    
                    element_line += " " + " ".join(props)
                    yaml_lines.append(element_line)
                
                yaml_lines.append("```")
                
                # Return the YAML format that Cursor expects
                return {"snapshot": "\n".join(yaml_lines)}
            else:
                logger.error("❌ Failed to capture snapshot")
                return {"error": "Snapshot capture failed"}
        
        # Robot Framework code (internal operation)
        code = [
            "# Capture page snapshot for element interaction",
            "# This captures all interactive elements with references"
        ]
        
        return ToolResult(
            code=code,
            action=snapshot_action,
            capture_snapshot=False,  # We handle it manually
            wait_for_network=False
        )

class ClickTool(BaseTool):
    """Click on element - matches playwright-mcp browser_click exactly."""
    
    def _create_schema(self) -> ToolSchema:
        return ToolSchema(
            name="click_element",
            description="Click on an element using its reference from page snapshot",
            input_schema=ClickParams,
            tool_type="destructive"
        )
    
    async def handle(self, context: Context, params: ClickParams) -> ToolResult:
        """Click element - matches playwright-mcp click handle exactly."""
        # Debug what Cursor is sending
        logger.info(f"🔍 Click params received: element='{params.element}', ref='{params.ref}'")
        
        # Get current driver and snapshot
        driver = context.current_tab_or_die()
        snapshot = context.snapshot_or_die()
        
        # Get locator from snapshot using ref (like playwright-mcp)
        by, locator_value = snapshot.ref_locator(params.ref)
        
        # Click action with fallback - more robust than playwright-mcp
        async def click_action():
            element = driver.find_element(by, locator_value)
            
            try:
                # Try standard Selenium click first (like playwright-mcp does)
                element.click()
                logger.info(f"🖱️ Clicked: {params.element}")
            except Exception as selenium_error:
                # Fallback to JavaScript click (better than playwright-mcp)
                logger.warning(f"⚠️ Standard click failed: {str(selenium_error)}")
                logger.info(f"🔄 Trying JavaScript click fallback...")
                
                try:
                    # Use JavaScript click as fallback
                    driver.execute_script("arguments[0].click();", element)
                    logger.info(f"✅ JavaScript click successful: {params.element}")
                except Exception as js_error:
                    logger.error(f"❌ Both clicks failed - Standard: {selenium_error}, JavaScript: {js_error}")
                    raise selenium_error  # Raise original error
        
        # Robot Framework code (matches playwright-mcp code generation pattern)
        code = [
            f"# Click {params.element}",
            f"Click Element    {locator_value}"
        ]
        
        return ToolResult(
            code=code,
            action=click_action,
            capture_snapshot=True,
            wait_for_network=True
        )

class HoverParams(BaseModel):
    """Parameters for hovering over elements."""
    element: str = Field(description="Human-readable element description used to obtain permission to interact with the element")
    ref: str = Field(description="Exact target element reference from the page snapshot")

class HoverTool(BaseTool):
    """Hover over element."""
    
    def _create_schema(self) -> ToolSchema:
        return ToolSchema(
            name="hover_element",
            description="Hover mouse over an element using its reference from page snapshot",
            input_schema=HoverParams,
            tool_type="readOnly"
        )
    
    async def handle(self, context: Context, params: HoverParams) -> ToolResult:
        """Hover over element."""
        # Get current driver and snapshot
        driver = context.current_tab_or_die()
        snapshot = context.snapshot_or_die()
        
        # Get locator from snapshot using ref
        by, locator_value = snapshot.ref_locator(params.ref)
        
        # Hover action
        async def hover_action():
            from selenium.webdriver.common.action_chains import ActionChains
            element = driver.find_element(by, locator_value)
            ActionChains(driver).move_to_element(element).perform()
            logger.info(f"🖱️ Hovered over: {params.element}")
        
        # Robot Framework code
        code = [
            f"# Hover over {params.element}",
            f"Mouse Over    {locator_value}"
        ]
        
        return ToolResult(
            code=code,
            action=hover_action,
            capture_snapshot=True,
            wait_for_network=False
        )

class SelectParams(BaseModel):
    """Parameters for selecting dropdown options."""
    element: str = Field(description="Human-readable element description used to obtain permission to interact with the element")
    ref: str = Field(description="Exact target element reference from the page snapshot")
    values: List[str] = Field(description="Array of values to select in the dropdown. This can be a single value or multiple values.")

class SelectTool(BaseTool):
    """Select option from dropdown."""
    
    def _create_schema(self) -> ToolSchema:
        return ToolSchema(
            name="select_option",
            description="Select an option in a dropdown using its reference from page snapshot",
            input_schema=SelectParams,
            tool_type="destructive"
        )
    
    async def handle(self, context: Context, params: SelectParams) -> ToolResult:
        """Select dropdown option."""
        # Get current driver and snapshot
        driver = context.current_tab_or_die()
        snapshot = context.snapshot_or_die()
        
        # Get locator from snapshot using ref
        by, locator_value = snapshot.ref_locator(params.ref)
        
        # Select action
        async def select_action():
            from selenium.webdriver.support.ui import Select
            element = driver.find_element(by, locator_value)
            
            if element.tag_name.lower() == 'select':
                select = Select(element)
                for value in params.values:
                    try:
                        select.select_by_visible_text(value)
                        logger.info(f"📋 Selected '{value}' from {params.element}")
                        break
                    except:
                        try:
                            select.select_by_value(value)
                            logger.info(f"📋 Selected '{value}' (by value) from {params.element}")
                            break
                        except:
                            continue
            else:
                # Not a select element, try clicking
                element.click()
                logger.info(f"📋 Clicked dropdown {params.element}")
        
        # Robot Framework code
        values_str = " | ".join(params.values) if len(params.values) > 1 else params.values[0]
        code = [
            f"# Select options [{values_str}] in {params.element}",
            f"Select From List By Label    {locator_value}    {values_str}"
        ]
        
        return ToolResult(
            code=code,
            action=select_action,
            capture_snapshot=True,
            wait_for_network=True
        )