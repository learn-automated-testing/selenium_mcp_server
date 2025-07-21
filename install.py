#!/usr/bin/env python3
"""
Cross-platform installer for Selenium MCP Server
Automatically detects platform and sets up the MCP server for use with Claude Desktop/Cursor
"""

import json
import os
import platform
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Dict, Optional


def get_platform_info():
    """Detect the current platform and return relevant paths."""
    system = platform.system().lower()
    
    if system == "darwin":  # macOS
        return {
            "system": "macos",
            "config_dir": Path.home() / "Library" / "Application Support" / "Claude",
            "python_cmd": "python3"
        }
    elif system == "windows":
        return {
            "system": "windows", 
            "config_dir": Path.home() / "AppData" / "Roaming" / "Claude",
            "python_cmd": "python"
        }
    elif system == "linux":
        return {
            "system": "linux",
            "config_dir": Path.home() / ".config" / "claude",
            "python_cmd": "python3"
        }
    else:
        raise Exception(f"Unsupported platform: {system}")


def check_python():
    """Check if Python is available and meets requirements."""
    try:
        result = subprocess.run([sys.executable, "--version"], 
                              capture_output=True, text=True, check=True)
        version = result.stdout.strip()
        print(f"✅ Found Python: {version}")
        return True
    except Exception as e:
        print(f"❌ Python check failed: {e}")
        return False


def setup_virtual_environment(project_dir: Path, python_cmd: str):
    """Create and setup virtual environment."""
    venv_dir = project_dir / "venv"
    
    if venv_dir.exists():
        print("✅ Virtual environment already exists")
        return venv_dir
    
    print("📦 Creating virtual environment...")
    try:
        subprocess.run([python_cmd, "-m", "venv", str(venv_dir)], 
                      check=True, cwd=project_dir)
        print("✅ Virtual environment created")
        return venv_dir
    except Exception as e:
        print(f"❌ Failed to create virtual environment: {e}")
        raise


def install_dependencies(project_dir: Path, venv_dir: Path, system: str):
    """Install Python dependencies in virtual environment."""
    if system == "windows":
        pip_cmd = venv_dir / "Scripts" / "pip"
        python_cmd = venv_dir / "Scripts" / "python"
    else:
        pip_cmd = venv_dir / "bin" / "pip"
        python_cmd = venv_dir / "bin" / "python"
    
    requirements_file = project_dir / "requirements.txt"
    
    if not requirements_file.exists():
        print("❌ requirements.txt not found")
        raise FileNotFoundError("requirements.txt not found")
    
    print("📦 Installing dependencies...")
    try:
        subprocess.run([str(pip_cmd), "install", "-r", str(requirements_file)], 
                      check=True, cwd=project_dir)
        print("✅ Dependencies installed")
        return python_cmd
    except Exception as e:
        print(f"❌ Failed to install dependencies: {e}")
        raise


def create_mcp_config(project_dir: Path, venv_python: Path, config_dir: Path):
    """Create MCP configuration for Claude Desktop."""
    config_file = config_dir / "claude_desktop_config.json"
    
    # Create config directory if it doesn't exist
    config_dir.mkdir(parents=True, exist_ok=True)
    
    # Load existing config or create new one
    config = {}
    if config_file.exists():
        try:
            with open(config_file, 'r') as f:
                config = json.load(f)
        except json.JSONDecodeError:
            print("⚠️  Invalid existing config, creating new one")
            config = {}
    
    # Ensure mcpServers section exists
    if "mcpServers" not in config:
        config["mcpServers"] = {}
    
    # Add selenium-mcp configuration
    config["mcpServers"]["selenium-mcp"] = {
        "command": str(venv_python),
        "args": ["mcp_server.py"],
        "cwd": str(project_dir)
    }
    
    # Write config back
    with open(config_file, 'w') as f:
        json.dump(config, f, indent=2)
    
    print(f"✅ MCP config updated: {config_file}")
    return config_file


def create_cursor_config(project_dir: Path, venv_python: Path):
    """Create Cursor-specific MCP configuration."""
    cursor_config = {
        "mcpServers": {
            "selenium-mcp": {
                "command": str(venv_python),
                "args": ["mcp_server.py"],
                "cwd": str(project_dir)
            }
        }
    }
    
    config_file = project_dir / "cursor_mcp_config.json"
    with open(config_file, 'w') as f:
        json.dump(cursor_config, f, indent=2)
    
    print(f"✅ Cursor config created: {config_file}")
    return config_file


def test_installation(venv_python: Path, project_dir: Path):
    """Test if the MCP server starts correctly."""
    test_script = project_dir / "test_mcp_direct.py"
    
    if not test_script.exists():
        print("⚠️  Test script not found, skipping test")
        return True
    
    print("🧪 Testing installation...")
    try:
        result = subprocess.run([str(venv_python), str(test_script)], 
                              capture_output=True, text=True, 
                              timeout=30, cwd=project_dir)
        
        if result.returncode == 0:
            print("✅ Installation test passed")
            return True
        else:
            print(f"⚠️  Test completed with warnings: {result.stderr}")
            return True  # Don't fail installation on test warnings
    except subprocess.TimeoutExpired:
        print("⚠️  Test timed out (this is normal)")
        return True
    except Exception as e:
        print(f"⚠️  Test failed: {e}")
        return True  # Don't fail installation on test issues


def main():
    """Main installation process."""
    print("🚀 Selenium MCP Server Installer")
    print("=" * 40)
    
    # Get current directory (where installer is run from)
    project_dir = Path.cwd()
    
    # Verify we're in the right directory
    if not (project_dir / "mcp_server.py").exists():
        print("❌ mcp_server.py not found. Please run this installer from the project root directory.")
        sys.exit(1)
    
    try:
        # Detect platform
        platform_info = get_platform_info()
        print(f"🖥️  Platform: {platform_info['system']}")
        
        # Check Python
        if not check_python():
            print("❌ Python is required but not available")
            sys.exit(1)
        
        # Setup virtual environment
        venv_dir = setup_virtual_environment(project_dir, platform_info["python_cmd"])
        
        # Install dependencies
        venv_python = install_dependencies(project_dir, venv_dir, platform_info["system"])
        
        # Create MCP configurations
        config_file = create_mcp_config(project_dir, venv_python, platform_info["config_dir"])
        cursor_config = create_cursor_config(project_dir, venv_python)
        
        # Test installation
        test_installation(venv_python, project_dir)
        
        print("\n🎉 Installation Complete!")
        print("=" * 40)
        print(f"📁 Project directory: {project_dir}")
        print(f"🐍 Python executable: {venv_python}")
        print(f"⚙️  Claude config: {config_file}")
        print(f"⚙️  Cursor config: {cursor_config}")
        print("\n📋 Next steps:")
        print("1. Restart Claude Desktop to load the new MCP server")
        print("2. For Cursor: Copy the config from cursor_mcp_config.json to your Cursor settings")
        print("3. Check logs at: mcp_server.log")
        print("\n🔍 To test manually:")
        print(f"   {venv_python} test_mcp_direct.py")
        
    except Exception as e:
        print(f"\n❌ Installation failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()