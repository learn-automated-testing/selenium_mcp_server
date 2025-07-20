"""Key press tools."""

import logging
from pydantic import BaseModel, Field

from ..tool_base import BaseTool, ToolSchema, ToolResult
from ..context import Context

logger = logging.getLogger(__name__)

class KeyPressParams(BaseModel):
    """Parameters for key press."""
    key: str = Field(description="Key to press (e.g., 'Enter', 'Tab', 'Escape', 'F1', etc.)")
    modifiers: list[str] = Field(default=[], description="Modifier keys (ctrl, alt, shift, meta)")

class KeyPressTool(BaseTool):
    """Press keyboard keys with optional modifiers."""
    
    def _create_schema(self) -> ToolSchema:
        return ToolSchema(
            name="key_press",
            description="Press keyboard keys with optional modifiers",
            input_schema=KeyPressParams,
            tool_type="destructive"
        )
    
    async def handle(self, context: Context, params: KeyPressParams) -> ToolResult:
        """Press key with modifiers."""
        driver = context.current_tab_or_die()
        
        async def key_action():
            from selenium.webdriver.common.keys import Keys
            from selenium.webdriver.common.action_chains import ActionChains
            
            actions = ActionChains(driver)
            
            # Hold down modifiers
            for modifier in params.modifiers:
                if modifier.lower() == 'ctrl':
                    actions = actions.key_down(Keys.CONTROL)
                elif modifier.lower() == 'alt':
                    actions = actions.key_down(Keys.ALT)
                elif modifier.lower() == 'shift':
                    actions = actions.key_down(Keys.SHIFT)
                elif modifier.lower() == 'meta':
                    actions = actions.key_down(Keys.META)
            
            # Press the main key
            key_mapping = {
                'Enter': Keys.ENTER,
                'Tab': Keys.TAB,
                'Escape': Keys.ESCAPE,
                'Space': Keys.SPACE,
                'ArrowUp': Keys.ARROW_UP,
                'ArrowDown': Keys.ARROW_DOWN,
                'ArrowLeft': Keys.ARROW_LEFT,
                'ArrowRight': Keys.ARROW_RIGHT,
                'F1': Keys.F1,
                'F2': Keys.F2,
                'F3': Keys.F3,
                'F4': Keys.F4,
                'F5': Keys.F5,
                'F6': Keys.F6,
                'F7': Keys.F7,
                'F8': Keys.F8,
                'F9': Keys.F9,
                'F10': Keys.F10,
                'F11': Keys.F11,
                'F12': Keys.F12,
                'Home': Keys.HOME,
                'End': Keys.END,
                'PageUp': Keys.PAGE_UP,
                'PageDown': Keys.PAGE_DOWN,
                'Delete': Keys.DELETE,
                'Backspace': Keys.BACKSPACE,
            }
            
            selenium_key = key_mapping.get(params.key, params.key)
            actions = actions.send_keys(selenium_key)
            
            # Release modifiers
            for modifier in params.modifiers:
                if modifier.lower() == 'ctrl':
                    actions = actions.key_up(Keys.CONTROL)
                elif modifier.lower() == 'alt':
                    actions = actions.key_up(Keys.ALT)
                elif modifier.lower() == 'shift':
                    actions = actions.key_up(Keys.SHIFT)
                elif modifier.lower() == 'meta':
                    actions = actions.key_up(Keys.META)
            
            actions.perform()
            
            modifier_text = "+".join(params.modifiers) + "+" if params.modifiers else ""
            logger.info(f"⌨️ Pressed key: {modifier_text}{params.key}")
        
        # Robot Framework code
        modifier_text = "+".join(params.modifiers) + "+" if params.modifiers else ""
        code = [
            f"# Press key: {modifier_text}{params.key}",
            f"Press Keys    None    {modifier_text}{params.key}"
        ]
        
        return ToolResult(
            code=code,
            action=key_action,
            capture_snapshot=True,
            wait_for_network=False
        )