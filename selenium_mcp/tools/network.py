"""Network monitoring tools."""

import logging
from pydantic import BaseModel, Field

from ..tool_base import BaseTool, ToolSchema, ToolResult
from ..context import Context

logger = logging.getLogger(__name__)

class NetworkParams(BaseModel):
    """Parameters for network operations."""
    action: str = Field(description="Network action: 'get_requests', 'clear', 'set_offline'")
    offline: bool = Field(default=False, description="Set offline mode (for set_offline action)")

class NetworkTool(BaseTool):
    """Monitor and control network activity."""
    
    def _create_schema(self) -> ToolSchema:
        return ToolSchema(
            name="network_monitor",
            description="Monitor network requests or control network state",
            input_schema=NetworkParams,
            tool_type="destructive"
        )
    
    async def handle(self, context: Context, params: NetworkParams) -> ToolResult:
        """Handle network operations."""
        driver = context.current_tab_or_die()
        
        async def network_action():
            if params.action == "get_requests":
                try:
                    # Get performance logs if available
                    logs = driver.get_log('performance')
                    network_requests = []
                    
                    for log in logs:
                        message = log.get('message', {})
                        if isinstance(message, str):
                            import json
                            try:
                                message = json.loads(message)
                            except:
                                continue
                                
                        method = message.get('message', {}).get('method', '')
                        if 'Network.' in method:
                            params_data = message.get('message', {}).get('params', {})
                            if 'request' in params_data:
                                url = params_data['request'].get('url', '')
                                method_type = params_data['request'].get('method', '')
                                network_requests.append(f"{method_type} {url}")
                    
                    logger.info(f"🌐 Retrieved {len(network_requests)} network requests")
                    return "\n".join(network_requests) if network_requests else "No network requests found"
                    
                except Exception as e:
                    logger.warning(f"Could not retrieve network requests: {e}")
                    return "Network monitoring not available"
                    
            elif params.action == "clear":
                try:
                    # Clear performance logs
                    driver.get_log('performance')
                    logger.info("🌐 Cleared network logs")
                    return "Network logs cleared"
                except Exception as e:
                    logger.warning(f"Could not clear network logs: {e}")
                    return "Network logs clear failed"
                    
            elif params.action == "set_offline":
                try:
                    # Set network offline mode using Chrome DevTools
                    driver.execute_cdp_cmd('Network.enable', {})
                    driver.execute_cdp_cmd('Network.emulateNetworkConditions', {
                        'offline': params.offline,
                        'latency': 0,
                        'downloadThroughput': -1,
                        'uploadThroughput': -1
                    })
                    
                    mode = "offline" if params.offline else "online"
                    logger.info(f"🌐 Set network mode to {mode}")
                    return f"Network set to {mode} mode"
                except Exception as e:
                    logger.warning(f"Could not set network mode: {e}")
                    return "Network mode change failed"
            else:
                raise ValueError(f"Invalid network action: {params.action}")
        
        # Robot Framework code
        if params.action == "get_requests":
            code = [
                "# Get network requests",
                "# Note: Network request monitoring not directly supported in Robot Framework"
            ]
        elif params.action == "clear":
            code = [
                "# Clear network logs", 
                "# Note: Network log clearing not directly supported in Robot Framework"
            ]
        elif params.action == "set_offline":
            mode = "offline" if params.offline else "online"
            code = [
                f"# Set network to {mode} mode",
                "# Note: Network mode control not directly supported in Robot Framework"
            ]
        else:
            code = [
                f"# Network action: {params.action}",
                "# Note: Network operations limited in Robot Framework"
            ]
        
        return ToolResult(
            code=code,
            action=network_action,
            capture_snapshot=False,
            wait_for_network=False
        )