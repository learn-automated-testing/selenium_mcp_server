"""Script generation tool for creating test scripts from recorded actions."""

import json
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from selenium_mcp.tool_base import BaseTool, ToolSchema
from selenium_mcp.context import Context, ToolResult

class GenerateScriptParams(BaseModel):
    """Parameters for script generation."""
    format: str = Field(
        description="Script format: pytest, unittest, selenium_python, robot_framework, playwright, webdriverio, selenium_java, selenium_js"
    )
    test_name: Optional[str] = Field(
        default="test_recorded_scenario",
        description="Name for the test function/class"
    )
    filename: Optional[str] = Field(
        default=None,
        description="Optional filename to save the script to"
    )
    include_setup: bool = Field(
        default=True,
        description="Include browser setup and teardown code"
    )

class GenerateScriptTool(BaseTool):
    """Generate test script from recorded browser actions."""
    
    def _create_schema(self) -> ToolSchema:
        return ToolSchema(
            name="generate_script",
            description="Generate executable test script from recorded browser actions. Choose format: pytest, unittest, selenium_python, robot_framework, playwright, webdriverio, selenium_java, selenium_js",
            input_schema=GenerateScriptParams,
            tool_type="readOnly"
        )
    
    async def handle(self, context: Context, params: GenerateScriptParams) -> ToolResult:
        """Generate test script from recorded actions."""
        
        if not context.action_history:
            return ToolResult(
                code=["No actions recorded. Start recording first with start_recording tool."],
                capture_snapshot=False
            )
        
        format_handlers = {
            "pytest": self._generate_pytest,
            "unittest": self._generate_unittest,
            "selenium_python": self._generate_selenium_python,
            "robot_framework": self._generate_robot_framework,
            "playwright": self._generate_playwright,
            "webdriverio": self._generate_webdriverio,
            "selenium_java": self._generate_selenium_java,
            "selenium_js": self._generate_selenium_js
        }
        
        handler = format_handlers.get(params.format.lower())
        if not handler:
            return ToolResult(
                code=[f"Unsupported format: {params.format}. Choose from: {', '.join(format_handlers.keys())}"],
                capture_snapshot=False
            )
        
        script = handler(context.action_history, params)
        
        result_lines = [
            f"Generated {params.format} test script from {len(context.action_history)} recorded actions:",
            "",
            script
        ]
        
        # Save to file if requested
        if params.filename:
            try:
                with open(params.filename, 'w') as f:
                    f.write(script)
                result_lines.insert(-1, f"Script saved to: {params.filename}")
            except Exception as e:
                result_lines.insert(-1, f"Error saving to {params.filename}: {e}")
        
        return ToolResult(
            code=result_lines,
            capture_snapshot=False
        )
    
    def _generate_pytest(self, actions: List[Dict[str, Any]], params: GenerateScriptParams) -> str:
        """Generate pytest format test script."""
        lines = []
        
        if params.include_setup:
            lines.extend([
                "import pytest",
                "from selenium import webdriver",
                "from selenium.webdriver.common.by import By",
                "from selenium.webdriver.support.ui import WebDriverWait",
                "from selenium.webdriver.support import expected_conditions as EC",
                "from selenium.webdriver.common.keys import Keys",
                "import time",
                "",
                "@pytest.fixture",
                "def driver():",
                "    driver = webdriver.Chrome()",
                "    driver.maximize_window()",
                "    yield driver",
                "    driver.quit()",
                "",
                ""
            ])
        
        lines.extend([
            f"def {params.test_name}(driver):",
            "    \"\"\"Auto-generated test from recorded browser actions.\"\"\""
        ])
        
        for action in actions:
            line = self._action_to_selenium_code(action, indent="    ")
            if line:
                lines.append(line)
        
        return "\n".join(lines)
    
    def _generate_unittest(self, actions: List[Dict[str, Any]], params: GenerateScriptParams) -> str:
        """Generate unittest format test script."""
        lines = []
        
        if params.include_setup:
            lines.extend([
                "import unittest",
                "from selenium import webdriver",
                "from selenium.webdriver.common.by import By",
                "from selenium.webdriver.support.ui import WebDriverWait",
                "from selenium.webdriver.support import expected_conditions as EC",
                "from selenium.webdriver.common.keys import Keys",
                "import time",
                "",
                ""
            ])
        
        class_name = "".join(word.capitalize() for word in params.test_name.split("_"))
        lines.extend([
            f"class {class_name}(unittest.TestCase):",
            "    \"\"\"Auto-generated test from recorded browser actions.\"\"\"",
            "",
            "    def setUp(self):",
            "        self.driver = webdriver.Chrome()",
            "        self.driver.maximize_window()",
            "",
            "    def tearDown(self):",
            "        self.driver.quit()",
            "",
            f"    def {params.test_name}(self):",
            "        driver = self.driver"
        ])
        
        for action in actions:
            line = self._action_to_selenium_code(action, indent="        ")
            if line:
                lines.append(line)
        
        if params.include_setup:
            lines.extend([
                "",
                "",
                "if __name__ == '__main__':",
                "    unittest.main()"
            ])
        
        return "\n".join(lines)
    
    def _generate_selenium_python(self, actions: List[Dict[str, Any]], params: GenerateScriptParams) -> str:
        """Generate raw Selenium Python script."""
        lines = []
        
        if params.include_setup:
            lines.extend([
                "from selenium import webdriver",
                "from selenium.webdriver.common.by import By",
                "from selenium.webdriver.support.ui import WebDriverWait",
                "from selenium.webdriver.support import expected_conditions as EC",
                "from selenium.webdriver.common.keys import Keys",
                "import time",
                "",
                "# Auto-generated test from recorded browser actions",
                "driver = webdriver.Chrome()",
                "driver.maximize_window()",
                "",
                "try:"
            ])
        
        for action in actions:
            line = self._action_to_selenium_code(action, indent="    " if params.include_setup else "")
            if line:
                lines.append(line)
        
        if params.include_setup:
            lines.extend([
                "",
                "finally:",
                "    driver.quit()"
            ])
        
        return "\n".join(lines)
    
    def _generate_robot_framework(self, actions: List[Dict[str, Any]], params: GenerateScriptParams) -> str:
        """Generate Robot Framework test script."""
        lines = []
        
        if params.include_setup:
            lines.extend([
                "*** Settings ***",
                "Documentation    Auto-generated test from recorded browser actions",
                "Library          SeleniumLibrary",
                "Test Setup       Open Browser To Test Page",
                "Test Teardown    Close Browser",
                "",
                "*** Variables ***",
                "${BROWSER}        Chrome",
                "${TIMEOUT}       10s",
                "",
                "*** Test Cases ***"
            ])
        
        test_name_display = params.test_name.replace("_", " ").title()
        lines.extend([
            f"{test_name_display}",
            "    [Documentation]    Auto-generated test scenario"
        ])
        
        for action in actions:
            line = self._action_to_robot_framework(action)
            if line:
                lines.append(f"    {line}")
        
        if params.include_setup:
            lines.extend([
                "",
                "*** Keywords ***",
                "Open Browser To Test Page",
                "    Open Browser    about:blank    ${BROWSER}",
                "    Maximize Browser Window",
                "    Set Selenium Timeout    ${TIMEOUT}"
            ])
        
        return "\n".join(lines)
    
    def _generate_playwright(self, actions: List[Dict[str, Any]], params: GenerateScriptParams) -> str:
        """Generate Playwright test script."""
        lines = []
        
        if params.include_setup:
            lines.extend([
                "import asyncio",
                "from playwright.async_api import async_playwright, expect",
                "",
                ""
            ])
        
        lines.extend([
            f"async def {params.test_name}():",
            "    \"\"\"Auto-generated test from recorded browser actions.\"\"\""
        ])
        
        if params.include_setup:
            lines.extend([
                "    async with async_playwright() as p:",
                "        browser = await p.chromium.launch(headless=False)",
                "        context = await browser.new_context()",
                "        page = await context.new_page()",
                "",
                "        try:"
            ])
        
        for action in actions:
            line = self._action_to_playwright(action, indent="            " if params.include_setup else "    ")
            if line:
                lines.append(line)
        
        if params.include_setup:
            lines.extend([
                "",
                "        finally:",
                "            await browser.close()",
                "",
                "",
                "if __name__ == '__main__':",
                f"    asyncio.run({params.test_name}())"
            ])
        
        return "\n".join(lines)
    
    def _generate_webdriverio(self, actions: List[Dict[str, Any]], params: GenerateScriptParams) -> str:
        """Generate WebdriverIO test script."""
        lines = [
            "describe('Auto-generated Test Suite', () => {",
            f"    it('{params.test_name.replace('_', ' ')}', async () => {{",
            "        // Auto-generated test from recorded browser actions"
        ]
        
        for action in actions:
            line = self._action_to_webdriverio(action, indent="        ")
            if line:
                lines.append(line)
        
        lines.extend([
            "    });",
            "});"
        ])
        
        return "\n".join(lines)
    
    def _generate_selenium_java(self, actions: List[Dict[str, Any]], params: GenerateScriptParams) -> str:
        """Generate Selenium Java test script."""
        class_name = "".join(word.capitalize() for word in params.test_name.split("_"))
        
        lines = [
            "import org.openqa.selenium.By;",
            "import org.openqa.selenium.WebDriver;",
            "import org.openqa.selenium.WebElement;",
            "import org.openqa.selenium.chrome.ChromeDriver;",
            "import org.openqa.selenium.support.ui.WebDriverWait;",
            "import org.openqa.selenium.support.ui.ExpectedConditions;",
            "import java.time.Duration;",
            "",
            f"public class {class_name} {{",
            "    // Auto-generated test from recorded browser actions",
            "    public static void main(String[] args) {",
            "        WebDriver driver = new ChromeDriver();",
            "        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));",
            "        ",
            "        try {"
        ]
        
        for action in actions:
            line = self._action_to_selenium_java(action, indent="            ")
            if line:
                lines.append(line)
        
        lines.extend([
            "        } finally {",
            "            driver.quit();",
            "        }",
            "    }",
            "}"
        ])
        
        return "\n".join(lines)
    
    def _generate_selenium_js(self, actions: List[Dict[str, Any]], params: GenerateScriptParams) -> str:
        """Generate Selenium JavaScript test script."""
        lines = [
            "const { Builder, By, until } = require('selenium-webdriver');",
            "",
            f"async function {params.test_name}() {{",
            "    // Auto-generated test from recorded browser actions",
            "    let driver = await new Builder().forBrowser('chrome').build();",
            "    ",
            "    try {"
        ]
        
        for action in actions:
            line = self._action_to_selenium_js(action, indent="        ")
            if line:
                lines.append(line)
        
        lines.extend([
            "    } finally {",
            "        await driver.quit();",
            "    }",
            "}",
            "",
            f"{params.test_name}().catch(console.error);"
        ])
        
        return "\n".join(lines)
    
    # Helper methods to convert actions to different code formats
    def _action_to_selenium_code(self, action: Dict[str, Any], indent: str = "") -> str:
        """Convert an action to Selenium Python code."""
        tool = action.get("tool")
        params = action.get("params", {})
        
        if tool == "navigate_to":
            return f'{indent}driver.get("{params.get("url")}")'
        
        elif tool == "click_element":
            ref = params.get("element_ref")
            if ref:
                return f'{indent}driver.find_element(By.XPATH, "//element[@ref=\'{ref}\']").click()'
        
        elif tool == "input_text":
            ref = params.get("element_ref")
            text = params.get("text", "")
            if ref:
                return f'{indent}driver.find_element(By.XPATH, "//element[@ref=\'{ref}\']").send_keys("{text}")'
        
        elif tool == "take_screenshot":
            filename = params.get("filename", "screenshot.png")
            return f'{indent}driver.save_screenshot("{filename}")'
        
        elif tool == "wait_for":
            condition = params.get("condition")
            timeout = params.get("timeout", 10)
            if condition == "page_load":
                return f'{indent}WebDriverWait(driver, {timeout}).until(lambda d: d.execute_script("return document.readyState") == "complete")'
        
        return f'{indent}# TODO: {tool} - {params}'
    
    def _action_to_robot_framework(self, action: Dict[str, Any]) -> str:
        """Convert an action to Robot Framework keyword."""
        tool = action.get("tool")
        params = action.get("params", {})
        
        if tool == "navigate_to":
            return f'Go To    {params.get("url")}'
        
        elif tool == "click_element":
            ref = params.get("element_ref")
            if ref:
                return f'Click Element    xpath=//element[@ref="{ref}"]'
        
        elif tool == "input_text":
            ref = params.get("element_ref")
            text = params.get("text", "")
            if ref:
                return f'Input Text    xpath=//element[@ref="{ref}"]    {text}'
        
        elif tool == "take_screenshot":
            filename = params.get("filename", "screenshot.png")
            return f'Capture Page Screenshot    {filename}'
        
        return f'# TODO: {tool} - {params}'
    
    def _action_to_playwright(self, action: Dict[str, Any], indent: str = "") -> str:
        """Convert an action to Playwright code."""
        tool = action.get("tool")
        params = action.get("params", {})
        
        if tool == "navigate_to":
            return f'{indent}await page.goto("{params.get("url")}")'
        
        elif tool == "click_element":
            ref = params.get("element_ref")
            if ref:
                return f'{indent}await page.click("[ref=\\"{ref}\\"]")'
        
        elif tool == "input_text":
            ref = params.get("element_ref")
            text = params.get("text", "")
            if ref:
                return f'{indent}await page.fill("[ref=\\"{ref}\\"]", "{text}")'
        
        elif tool == "take_screenshot":
            filename = params.get("filename", "screenshot.png")
            return f'{indent}await page.screenshot(path="{filename}")'
        
        return f'{indent}// TODO: {tool} - {params}'
    
    def _action_to_webdriverio(self, action: Dict[str, Any], indent: str = "") -> str:
        """Convert an action to WebdriverIO code."""
        tool = action.get("tool")
        params = action.get("params", {})
        
        if tool == "navigate_to":
            return f'{indent}await browser.url("{params.get("url")}");'
        
        elif tool == "click_element":
            ref = params.get("element_ref")
            if ref:
                return f'{indent}await $("[ref=\\"{ref}\\"]").click();'
        
        elif tool == "input_text":
            ref = params.get("element_ref")
            text = params.get("text", "")
            if ref:
                return f'{indent}await $("[ref=\\"{ref}\\"]").setValue("{text}");'
        
        elif tool == "take_screenshot":
            filename = params.get("filename", "screenshot.png")
            return f'{indent}await browser.saveScreenshot("{filename}");'
        
        return f'{indent}// TODO: {tool} - {params}'
    
    def _action_to_selenium_java(self, action: Dict[str, Any], indent: str = "") -> str:
        """Convert an action to Selenium Java code."""
        tool = action.get("tool")
        params = action.get("params", {})
        
        if tool == "navigate_to":
            return f'{indent}driver.get("{params.get("url")}");'
        
        elif tool == "click_element":
            ref = params.get("element_ref")
            if ref:
                return f'{indent}driver.findElement(By.xpath("//element[@ref=\\"{ref}\\"]")).click();'
        
        elif tool == "input_text":
            ref = params.get("element_ref")
            text = params.get("text", "")
            if ref:
                return f'{indent}driver.findElement(By.xpath("//element[@ref=\\"{ref}\\"]")).sendKeys("{text}");'
        
        elif tool == "take_screenshot":
            filename = params.get("filename", "screenshot.png")
            return f'{indent}((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);'
        
        return f'{indent}// TODO: {tool} - {params}'
    
    def _action_to_selenium_js(self, action: Dict[str, Any], indent: str = "") -> str:
        """Convert an action to Selenium JavaScript code."""
        tool = action.get("tool")
        params = action.get("params", {})
        
        if tool == "navigate_to":
            return f'{indent}await driver.get("{params.get("url")}");'
        
        elif tool == "click_element":
            ref = params.get("element_ref")
            if ref:
                return f'{indent}await driver.findElement(By.xpath("//element[@ref=\\"{ref}\\"]")).click();'
        
        elif tool == "input_text":
            ref = params.get("element_ref")
            text = params.get("text", "")
            if ref:
                return f'{indent}await driver.findElement(By.xpath("//element[@ref=\\"{ref}\\"]")).sendKeys("{text}");'
        
        elif tool == "take_screenshot":
            filename = params.get("filename", "screenshot.png")
            return f'{indent}await driver.takeScreenshot();'
        
        return f'{indent}// TODO: {tool} - {params}'