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
        """Get locator for element reference - playwright-mcp style."""
        from selenium.webdriver.common.by import By
        
        # For playwright-mcp style refs (e1, e2, e3...), we need to find the element
        # by its position in our elements dict since we don't have aria-ref in Selenium
        if ref in self.elements:
            element_info = self.elements[ref]
            
            # Build a unique selector based on element properties
            selectors = []
            
            # Try ID first (most specific)
            if element_info.attributes.get("id"):
                selectors.append((By.ID, element_info.attributes["id"]))
            
            # Try tag + text combination
            if element_info.text:
                escaped_text = element_info.text.replace('"', '\\"')
                xpath = f"//{element_info.tag_name}[contains(text(), \"{escaped_text}\")]"
                selectors.append((By.XPATH, xpath))
            
            # Try tag + role combination
            if element_info.attributes.get("role"):
                xpath = f"//{element_info.tag_name}[@role=\"{element_info.attributes['role']}\"]"
                selectors.append((By.XPATH, xpath))
            
            # Try tag + class combination
            if element_info.css_classes:
                class_selector = f"{element_info.tag_name}.{'.'.join(element_info.css_classes)}"
                selectors.append((By.CSS_SELECTOR, class_selector))
            
            # Return the first selector (ID is most reliable)
            if selectors:
                return selectors[0]
        
        # Fallback for unknown refs
        return By.CSS_SELECTOR, f"[data-ref='{ref}']"

class BrowserManager:
    """Manages browser instance."""
    
    def __init__(self):
        self.driver = None
    
    async def ensure_browser(self):
        """Ensure browser is available."""
        # Check if driver exists and is still valid
        if self.driver:
            try:
                # Test if session is still active
                _ = self.driver.current_url
            except Exception:
                logger.warning("⚠️ Browser session invalid, creating new one...")
                self.driver = None
        
        if not self.driver:
            from selenium import webdriver
            from selenium.webdriver.chrome.options import Options
            from webdriver_manager.chrome import ChromeDriverManager
            from selenium.webdriver.chrome.service import Service
            
            options = Options()
            options.add_argument("--no-sandbox")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument("--disable-blink-features=AutomationControlled")
            options.add_experimental_option("excludeSwitches", ["enable-automation"])
            options.add_experimental_option('useAutomationExtension', False)
            
            try:
                service = Service(ChromeDriverManager().install())
                self.driver = webdriver.Chrome(service=service, options=options)
                logger.info("🌐 Browser initialized")
            except Exception as e:
                logger.error(f"❌ Failed to initialize browser: {e}")
                # Try alternative approach
                logger.info("🔄 Trying alternative browser initialization...")
                self.driver = webdriver.Chrome(options=options)
                logger.info("🌐 Browser initialized (alternative method)")
        
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
        self.action_history: List[Dict[str, Any]] = []  # Track recorded actions
        self.recording_enabled: bool = False  # Control recording state
    
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
            
            # Find all interactive elements using accessibility-focused approach (like playwright-mcp)
            from selenium.webdriver.common.by import By
            
            # Generic accessibility-based element detection (no hardcoded cookie logic)
            all_elements = driver.find_elements(By.XPATH, "//*")
            interactive_elements = []
            
            for elem in all_elements:
                try:
                    # Check if element is interactive based on accessibility properties
                    is_interactive = (
                        # Standard interactive tags
                        elem.tag_name.lower() in ['button', 'input', 'a', 'select', 'textarea'] or
                        # Elements with interactive roles  
                        elem.get_attribute('role') in ['button', 'link', 'menuitem', 'tab', 'checkbox', 'radio'] or
                        # Elements with click handlers
                        elem.get_attribute('onclick') is not None or
                        # Elements that are focusable
                        elem.get_attribute('tabindex') is not None or
                        # Elements marked as clickable
                        'click' in (elem.get_attribute('class') or '').lower() or
                        'btn' in (elem.get_attribute('class') or '').lower()
                    )
                    
                    # Only include if interactive and visible
                    if is_interactive and elem.is_displayed() and elem.is_enabled():
                        interactive_elements.append(elem)
                        
                except:
                    continue
            
            # Limit to 100 elements like playwright-mcp
            for i, element in enumerate(interactive_elements[:100]):
                try:
                    # Use playwright-mcp style refs: e1, e2, e3...
                    ref = f"e{i+1}"  # Start from e1 like playwright-mcp
                    
                    # Get accessible name (text content or aria-label)
                    accessible_name = (
                        element.get_attribute('aria-label') or 
                        element.text.strip() or 
                        element.get_attribute('value') or 
                        element.get_attribute('title') or
                        element.get_attribute('alt') or
                        ""
                    )
                    
                    element_info = ElementInfo(
                        ref=ref,
                        tag_name=element.tag_name.lower(),
                        text=accessible_name[:100] if accessible_name else None,
                        aria_label=element.get_attribute('aria-label'),
                        is_clickable=element.is_enabled() and element.is_displayed(),
                        css_classes=element.get_attribute("class").split() if element.get_attribute("class") else [],
                        attributes={
                            "id": element.get_attribute("id") or "",
                            "role": element.get_attribute("role") or "",
                            "type": element.get_attribute("type") or ""
                        }
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
    
    def record_action(self, tool_name: str, params: Dict[str, Any]):
        """Record an action for script generation."""
        if self.recording_enabled:
            action = {
                "tool": tool_name,
                "params": params,
                "timestamp": __import__('time').time()
            }
            self.action_history.append(action)
            logger.info(f"📹 Recorded action: {tool_name}")

    async def run_tool(self, tool, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a tool with given arguments."""
        try:
            # Validate and parse parameters
            params = tool.schema.validate_params(arguments)
            
            # Record the action if recording is enabled
            self.record_action(tool.schema.name, arguments)
            
            # Execute the tool
            result = await tool.handle(self, params)
            
            # Execute the action if present
            if result.action:
                action_result = await result.action()
                
                # Capture snapshot after action if requested
                if result.capture_snapshot:
                    await self.capture_snapshot()
                
                # Special handling for snapshot tool to return YAML format
                if tool.schema.name == "capture_page" and action_result.get("snapshot"):
                    return {
                        "text": action_result["snapshot"],  # Return YAML directly
                        "code": result.code,
                        "action_result": action_result
                    }
                else:
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