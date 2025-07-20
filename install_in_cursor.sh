#!/bin/bash
# Install Selenium MCP in Cursor

echo "🚀 Installing Selenium MCP in Cursor..."

# Step 1: Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Step 2: Test server startup
echo "🧪 Testing MCP server..."
timeout 5s python mcp_server.py > /dev/null 2>&1
if [ $? -eq 124 ]; then
    echo "✅ MCP server starts successfully"
else
    echo "❌ MCP server failed to start"
    exit 1
fi

# Step 3: Find Cursor config directory
CURSOR_CONFIG=""
if [[ "$OSTYPE" == "darwin"* ]]; then
    CURSOR_CONFIG="$HOME/Library/Application Support/Cursor/User"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    CURSOR_CONFIG="$HOME/.config/Cursor/User"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    CURSOR_CONFIG="$APPDATA/Cursor/User"
fi

echo "📁 Cursor config directory: $CURSOR_CONFIG"

# Step 4: Create MCP configuration
CURRENT_DIR=$(pwd)
MCP_CONFIG="{
  \"mcp.servers\": {
    \"selenium-mcp\": {
      \"command\": \"python\",
      \"args\": [\"./mcp_server.py\"],
      \"cwd\": \"$CURRENT_DIR\",
      \"env\": {
        \"PYTHONPATH\": \"$CURRENT_DIR\"
      }
    }
  }
}"

echo "⚙️ MCP Configuration:"
echo "$MCP_CONFIG"

# Step 5: Instructions for manual setup
echo ""
echo "🎯 NEXT STEPS - Manual Configuration Required:"
echo ""
echo "1. Open Cursor Settings (Cmd+, or Ctrl+,)"
echo "2. Search for 'MCP' or 'Model Context Protocol'"
echo "3. Add this configuration to your settings.json:"
echo ""
echo "$MCP_CONFIG"
echo ""
echo "4. Restart Cursor completely"
echo "5. Test by asking: 'What browser automation tools are available?'"
echo ""
echo "📖 Full instructions: See CURSOR_INSTALLATION.md"
echo ""
echo "✅ Selenium MCP server is ready for Cursor integration!"