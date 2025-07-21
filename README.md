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



# Installation Guide - Selenium MCP Server

## Automatic Installation (Recommended)

### Prerequisites
- Python 3.8 or newer
- Chrome browser installed

### Quick Install

1. **Download or clone the project**:
   ```bash
   git clone <your-repo-url>
   cd selenium-mcp-server
   ```

2. **Run the automatic installer**:
   ```bash
   python3 install.py
   ```

The installer will:
- Create a virtual environment
- Install all dependencies  
- Configure MCP settings for Claude Desktop
- Create Cursor configuration file
- Test the installation

That's it! Your MCP server is ready to use.

## Manual Installation

If you prefer manual setup:

### 1. Clone and Setup

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Test Installation

```bash
python3 test_mcp_direct.py
```

You should see "All tests passed! MCP server is ready for use."

## Client Configuration

### After Automatic Installation

**Claude Desktop**: The installer automatically configures Claude Desktop. Just restart the app.

**Cursor**: Copy the configuration from the generated `cursor_mcp_config.json` file to your Cursor settings:

1. Open Cursor Settings (`Cmd+,` or `Ctrl+,`)
2. Search for "MCP" or "Model Context Protocol"  
3. Copy the content from `cursor_mcp_config.json`
4. Restart Cursor completely

### Manual Configuration

If you installed manually, configure your client:

#### Cursor

1. Open Cursor Settings (`Cmd+,` or `Ctrl+,`)
2. Search for "MCP" or "Model Context Protocol"
3. Add this configuration (replace paths with your actual paths):

```json
{
  "mcpServers": {
    "selenium-mcp": {
      "command": "/absolute/path/to/selenium-mcp-server/venv/bin/python",
      "args": ["mcp_server.py"],
      "cwd": "/absolute/path/to/selenium-mcp-server"
    }
  }
}
```

#### Claude Desktop

1. Find your Claude Desktop config file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. Add the server configuration (replace paths with your actual paths):

```json
{
  "mcpServers": {
    "selenium-mcp": {
      "command": "/absolute/path/to/selenium-mcp-server/venv/bin/python",
      "args": ["mcp_server.py"],
      "cwd": "/absolute/path/to/selenium-mcp-server"
    }
  }
}
```

3. Restart Claude Desktop

### VS Code

1. Install the MCP extension from marketplace
2. Open VS Code Settings (`Cmd+,` or `Ctrl+,`)
3. Search for "MCP"
4. Add to settings.json:

```json
{
  "mcp.servers": {
    "selenium-mcp": {
      "command": "/path/to/selenium-mcp-server/venv/bin/python",
      "args": ["./mcp_server.py"],
      "cwd": "/path/to/selenium-mcp-server"
    }
  }
}
```

5. Reload VS Code window

## Important Notes

### Using the Automatic Installer
- Run `python3 install.py` from the project root directory
- The installer handles all path configuration automatically
- Works on macOS, Windows, and Linux
- No need to manually edit paths or create virtual environments

### Path Configuration (Manual Setup Only)
- **Always use absolute paths** in the configuration
- Windows users: use forward slashes or double backslashes in JSON
- Point to the Python executable inside your virtual environment:
  - macOS/Linux: `venv/bin/python`
  - Windows: `venv\Scripts\python.exe`

### Verification
After installation, you should see:
- Green connection status in your MCP client
- 27+ tools available
- Tools like `navigate_to`, `click_element`, `generate_script` etc.

## Troubleshooting

### macOS Chrome Issues
If Chrome fails to start:
```bash
xattr -cr ~/.wdm/drivers/chromedriver/
```

### Connection Issues
1. Check logs: `tail -f mcp_server.log`
2. Verify paths are absolute
3. Ensure virtual environment is activated
4. Test manually: `python3 mcp_server.py`

### Reset Browser Session
If the automation browser gets stuck, use the `reset_automation_session` tool in your MCP client.

## Next Steps

Once installed, try:
1. "Navigate to example.com"
2. "Start recording, go to google.com, search for 'selenium', stop recording, generate pytest script"
3. "Reset automation session" (if browser gets stuck)