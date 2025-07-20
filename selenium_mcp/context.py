"""Context management for Selenium MCP server."""

import logging
from typing import Any, Dict, List, Optional, Callable, Awaitable
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class ToolResult:
    """Result from tool execution."""
    code: List[str]
    action: Optional[Callable[[], Awaitable[Any]]] = None
    capture_snapshot: bool = True
    wait_for_network: bool = False

@dataclass 
class ElementInfo:
    """Information about a page element."""
    ref: str
    tag_name: str
    text: Optional[str] = None
    aria_label: Optional[str] = None
    is_clickable: bool = False
    css_classes: List[str] = None
    attributes: Dict[str, str] = None
    
    def __post_init__(self):
        if self.css_classes is None:
            self.css_classes = []
        if self.attributes is None:
            self.attributes = {}

@dataclass
class PageSnapshot:
    """Snapshot of current page state."""
    elements: Dict[str, ElementInfo]
    url: str = ""
    title: str = ""
    
    def ref_locator(self, ref: str):
        """Get locator for element reference."""
        from selenium.webdriver.common.by import By
        # Simple implementation - element ref is usually an xpath or css selector
        if ref.startswith("//"):
            return By.XPATH, ref
        elif ref.startswith("#"):
            return By.ID, ref[1:]
        elif ref.startswith("."):
            return By.CLASS_NAME, ref[1:]
        else:
            return By.CSS_SELECTOR, ref

class BrowserManager:
    """Manages browser instance."""
    
    def __init__(self):
        self.driver = None
    
    async def ensure_browser(self):
        """Ensure browser is available."""
        if not self.driver:
            from selenium import webdriver
            from selenium.webdriver.chrome.options import Options
            from webdriver_manager.chrome import ChromeDriverManager
            from selenium.webdriver.chrome.service import Service
            
            options = Options()
            options.add_argument("--no-sandbox")
            options.add_argument("--disable-dev-shm-usage")
            
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=options)
            
            logger.info("🌐 Browser initialized")
        
        return self.driver
    
    def close_browser(self):
        """Close browser."""
        if self.driver:
            self.driver.quit()
            self.driver = None
            logger.info("🚪 Browser closed")

class Context:
    """Execution context for tools."""
    
    def __init__(self, tools):
        self.tools = tools
        self.browser_manager = BrowserManager()
        self.current_snapshot: Optional[PageSnapshot] = None
    
    async def ensure_browser(self):
        """Ensure browser is available."""
        return await self.browser_manager.ensure_browser()
    
    async def capture_snapshot(self):
        """Capture current page snapshot."""
        driver = await self.ensure_browser()
        
        # Simple snapshot implementation
        elements = {}
        
        try:
            # Get basic page info
            url = driver.current_url
            title = driver.title
            
            # Find interactive elements (simplified)
            from selenium.webdriver.common.by import By
            interactive_elements = driver.find_elements(By.XPATH, "//button | //input | //a | //select | //textarea")
            
            for i, element in enumerate(interactive_elements[:100]):  # Limit to 100 elements
                try:
                    ref = f"element_{i}"
                    element_info = ElementInfo(
                        ref=ref,
                        tag_name=element.tag_name,
                        text=element.text[:100] if element.text else None,
                        is_clickable=element.is_enabled() and element.is_displayed(),
                        css_classes=element.get_attribute("class").split() if element.get_attribute("class") else [],
                        attributes={"id": element.get_attribute("id") or ""}
                    )
                    elements[ref] = element_info
                except:
                    continue
            
            self.current_snapshot = PageSnapshot(elements=elements, url=url, title=title)
            
        except Exception as e:
            logger.error(f"❌ Snapshot capture failed: {e}")
            self.current_snapshot = PageSnapshot(elements={})
    
    def current_tab_or_die(self):
        """Get current browser tab or raise error."""
        if not self.browser_manager.driver:
            raise RuntimeError("No browser session active")
        return self.browser_manager.driver
    
    def snapshot_or_die(self):
        """Get current snapshot or raise error."""
        if not self.current_snapshot:
            raise RuntimeError("No snapshot available - call capture_page first")
        return self.current_snapshot
    
    async def run_tool(self, tool, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a tool with given arguments."""
        try:
            # Validate and parse parameters
            params = tool.schema.validate_params(arguments)
            
            # Execute the tool
            result = await tool.handle(self, params)
            
            # Execute the action if present
            if result.action:
                action_result = await result.action()
                
                # Capture snapshot after action if requested
                if result.capture_snapshot:
                    await self.capture_snapshot()
                
                return {
                    "text": f"✅ {tool.schema.name} executed successfully",
                    "code": result.code,
                    "action_result": action_result
                }
            else:
                return {
                    "text": f"✅ {tool.schema.name} prepared", 
                    "code": result.code
                }
        
        except Exception as e:
            logger.error(f"❌ Tool execution failed: {e}")
            return {
                "text": f"❌ {tool.schema.name} failed: {str(e)}",
                "error": str(e)
            }
    
    async def close(self):
        """Close context and cleanup."""
        self.browser_manager.close_browser()