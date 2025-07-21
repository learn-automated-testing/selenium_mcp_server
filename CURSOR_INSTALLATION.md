# Installing Selenium MCP in Cursor

## Step 1: Install Dependencies

First, make sure you have the required Python packages:

```bash
cd /Users/users/robot_framework_mcp
pip install -r requirements.txt
```

## Step 2: Get Your Project Path

First, get the full path to where you cloned/downloaded this project:

```bash
cd /path/to/selenium-mcp-project
pwd
```

Copy this path - you'll need it for the configuration below.

## Step 3: Configure Cursor MCP Settings

You need to add the MCP server configuration to Cursor's settings:

### Option A: Via Cursor Settings UI

1. **Open Cursor Settings**:
   - Press `Cmd+,` (Mac) or `Ctrl+,` (Windows/Linux)
   - Or go to `Cursor > Settings`

2. **Navigate to MCP Settings**:
   - Search for "MCP" in the settings
   - Look for "Model Context Protocol" settings

3. **Add Server Configuration**:
   Replace `/path/to/your/selenium-mcp-project` with your actual project path:
   ```json
   {
     "mcpServers": {
       "selenium-mcp": {
         "command": "python",
         "args": ["./mcp_server.py"],
         "cwd": "/path/to/your/selenium-mcp-project",
         "env": {
           "PYTHONPATH": "/path/to/your/selenium-mcp-project"
         }
       }
     }
   }
   ```

### Option B: Direct Config File Edit

1. **Find Cursor's config directory**:
   - **Mac**: `~/Library/Application Support/Cursor/User/`
   - **Windows**: `%APPDATA%\Cursor\User\`
   - **Linux**: `~/.config/Cursor/User/`

2. **Edit settings.json**:
   Add or merge this configuration into your `settings.json` (replace the path):
   ```json
   {
     "mcp.servers": {
       "selenium-mcp": {
         "command": "python",
         "args": ["./mcp_server.py"],
         "cwd": "/path/to/your/selenium-mcp-project",
         "env": {
           "PYTHONPATH": "/path/to/your/selenium-mcp-project"
         }
       }
     }
   }
   ```

## Step 4: Test the Installation

1. **Restart Cursor** completely

2. **Open a new chat** and try mentioning browser automation:
   - "Can you help me automate a website using the browser tools?"
   - "What browser automation tools are available?"

3. **Check MCP status** in Cursor:
   - Look for MCP server status indicators
   - Check if "selenium-mcp" appears in available tools

## Step 5: Using the Tools

Once installed, you can ask Cursor to:

- **Navigate websites**: "Go to google.com and take a screenshot"
- **Interact with elements**: "Click the search button on this page"
- **Automate workflows**: "Fill out this form and submit it"
- **Generate automation scripts**: "Create a Robot Framework test that logs into this website"
- **WebdriverIO scripts**: "Generate WebdriverIO code for this workflow"
- **Playwright automation**: "Convert this to Playwright test code"

## Available Tools (27 total)

### Navigation
- `navigate_to` - Go to URLs
- `go_back` / `go_forward` - Browser navigation

### Page Analysis  
- `capture_page` - Get page snapshot with element references

### Element Interactions
- `click_element` - Click using element references
- `input_text` - Type into form fields
- `select_option` - Choose from dropdowns
- `hover_element` - Mouse hover actions

### Advanced Features
- `take_screenshot` - Capture page images
- `evaluate_js` - Run JavaScript code
- `handle_dialog` - Deal with alerts/confirms
- `upload_file` - Handle file uploads
- `drag_and_drop` - Complex interactions

...and 16 more tools for complete browser automation!

## Troubleshooting

### Server Not Starting
- Check Python path is correct in config
- Ensure all dependencies are installed: `pip install -r requirements.txt`
- Verify the server starts manually: `python mcp_server.py`

### Tools Not Available
- Restart Cursor completely
- Check MCP server status in Cursor settings
- Look for error messages in Cursor's developer console

### Permission Issues
- Ensure the mcp_server.py file is executable
- Check that Python has permission to run WebDriver

## Testing Manually

You can test the server directly:



Then send MCP protocol messages to test functionality.

## Integration Benefits

With this MCP server, Cursor can:
- ✅ **Automate any website** using real browser actions
- ✅ **Generate Robot Framework test scripts** automatically  
- ✅ **Handle complex workflows** with element interactions
- ✅ **Take screenshots** and capture page state
- ✅ **Execute JavaScript** for advanced scenarios
- ✅ **Monitor network requests** and console logs
- ✅ **Handle file uploads** and form submissions