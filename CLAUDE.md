# Selenium MCP Server Development

## Environment Setup

This project uses a Python virtual environment for dependency management.

### Setup Instructions

1. Create and activate virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

### Running the MCP Server

After setting up the virtual environment:

```bash
source venv/bin/activate
python3 mcp_server.py
```

### Testing

To test the MCP server:

```bash
source venv/bin/activate
python3 test_mcp_direct.py
```

### Cursor Integration

For Cursor to use this MCP server, configure it with:

```json
{
  "mcpServers": {
    "selenium-mcp": {
      "command": "/Users/r.vanderhorst/develop/selenium_mcp_server/venv/bin/python",
      "args": ["./mcp_server.py"],
      "cwd": "/Users/r.vanderhorst/develop/selenium_mcp_server"
    }
  }
}
```

### Important Notes

- Always activate the virtual environment before running any Python scripts
- The MCP server must be run from within the activated virtual environment
- All testing should be done with the actual MCP server, not mocks
- The MCP server logs to `mcp_server.log` file (not stdout/stderr to avoid interfering with MCP protocol)
- Check logs with: `tail -f mcp_server.log`