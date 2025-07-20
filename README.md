# Selenium MCP Server

A Model Context Protocol (MCP) server that provides browser automation capabilities using Selenium WebDriver. This server offers 27 comprehensive tools for web automation, testing, and interaction. Generate automation scripts for Robot Framework, WebdriverIO, Playwright, or any Selenium-based framework.

## Features

- **27 Browser Automation Tools** covering all aspects of web interaction
- **Pure MCP Protocol Implementation** - compatible with MCP clients
- **Selenium WebDriver Backend** with automatic driver management
- **Multi-Framework Code Generation** - Robot Framework, WebdriverIO, Playwright, etc.
- **Element-based Interactions** using DOM snapshots and references
- **Cross-Platform Support** - Works with any Selenium-compatible automation framework

## Quick Start

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the MCP server:**
   ```bash
   python mcp_server.py
   ```

3. **Connect via MCP protocol** using stdin/stdout JSON-RPC messages

## Available Tools

### Navigation (3 tools)
- `navigate_to` - Navigate to a URL
- `go_back` - Go back to previous page  
- `go_forward` - Go forward to next page

### Page Analysis (1 tool)
- `capture_page` - Capture DOM snapshot for element analysis

### Element Interactions (4 tools)
- `click_element` - Click elements using page references
- `hover_element` - Hover over elements
- `select_option` - Select dropdown options
- `input_text` - Type text into input fields

### Mouse Operations (3 tools)
- `mouse_move_xy` - Move mouse to coordinates
- `mouse_click_xy` - Click at coordinates
- `mouse_drag_xy` - Drag between coordinates

### Keyboard Operations (1 tool)
- `press_key` - Press keyboard keys (Enter, Tab, arrows, etc.)

### Tab Management (4 tools)
- `list_tabs` - List all browser tabs
- `switch_to_tab` - Switch between tabs
- `open_new_tab` - Open new tabs
- `close_tab` - Close tabs

### JavaScript & Advanced (8 tools)
- `evaluate_js` - Execute JavaScript code
- `handle_dialog` - Handle alerts/confirms/prompts
- `drag_and_drop` - Drag elements between locations
- `upload_file` - Upload files through input elements
- `get_console_messages` - Monitor console logs
- `get_network_requests` - Monitor network activity
- `save_as_pdf` - Generate PDF of current page
- `wait_for_element` - Wait for element conditions

### Browser Management (3 tools)
- `take_screenshot` - Capture page screenshots
- `set_window_size` - Resize browser window
- `close_session` - Close browser session

## MCP Protocol

The server implements the MCP protocol via JSON-RPC over stdin/stdout:

```json
{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}
{"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "navigate_to", "arguments": {"url": "https://example.com"}}}
```

## Architecture

- **Context Management** - Handles browser sessions and page state
- **Tool-based Design** - Each capability is a discrete, callable tool
- **Element References** - Uses DOM snapshots with element references for interactions
- **Lazy Initialization** - Browser starts only when needed
- **Robust Error Handling** - Graceful fallbacks and error reporting