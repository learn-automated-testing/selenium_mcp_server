"""Recording control tools for action tracking."""

from typing import Optional
from pydantic import BaseModel, Field
from selenium_mcp.tool_base import BaseTool, ToolSchema
from selenium_mcp.context import Context, ToolResult

class StartRecordingParams(BaseModel):
    """Parameters for starting recording."""
    pass

class StopRecordingParams(BaseModel):
    """Parameters for stopping recording."""
    pass

class RecordingStatusParams(BaseModel):
    """Parameters for checking recording status."""
    pass

class ClearRecordingParams(BaseModel):
    """Parameters for clearing recorded actions."""
    pass

class StartRecordingTool(BaseTool):
    """Start recording browser actions for script generation."""
    
    def _create_schema(self) -> ToolSchema:
        return ToolSchema(
            name="start_recording",
            description="Start recording browser actions to generate test scripts later",
            input_schema=StartRecordingParams,
            tool_type="readOnly"
        )
    
    async def handle(self, context: Context, params: StartRecordingParams) -> ToolResult:
        """Start recording actions."""
        context.recording_enabled = True
        context.action_history.clear()  # Clear any previous recordings
        
        return ToolResult(
            code=[f"Recording started - all browser actions will be tracked"],
            capture_snapshot=False
        )

class StopRecordingTool(BaseTool):
    """Stop recording browser actions."""
    
    def _create_schema(self) -> ToolSchema:
        return ToolSchema(
            name="stop_recording",
            description="Stop recording browser actions",
            input_schema=StopRecordingParams,
            tool_type="readOnly"
        )
    
    async def handle(self, context: Context, params: StopRecordingParams) -> ToolResult:
        """Stop recording actions."""
        context.recording_enabled = False
        action_count = len(context.action_history)
        
        return ToolResult(
            code=[f"Recording stopped - captured {action_count} actions"],
            capture_snapshot=False
        )

class RecordingStatusTool(BaseTool):
    """Check recording status and show recorded actions."""
    
    def _create_schema(self) -> ToolSchema:
        return ToolSchema(
            name="recording_status",
            description="Check if recording is active and show recorded actions",
            input_schema=RecordingStatusParams,
            tool_type="readOnly"
        )
    
    async def handle(self, context: Context, params: RecordingStatusParams) -> ToolResult:
        """Show recording status."""
        status = "ACTIVE" if context.recording_enabled else "INACTIVE"
        action_count = len(context.action_history)
        
        result_lines = [
            f"Recording Status: {status}",
            f"Recorded Actions: {action_count}",
            ""
        ]
        
        if context.action_history:
            result_lines.append("Recent Actions:")
            for i, action in enumerate(context.action_history[-5:], 1):  # Show last 5
                result_lines.append(f"  {i}. {action['tool']} - {action.get('params', {})}")
            
            if len(context.action_history) > 5:
                result_lines.append(f"  ... and {len(context.action_history) - 5} more actions")
        
        return ToolResult(
            code=result_lines,
            capture_snapshot=False
        )

class ClearRecordingTool(BaseTool):
    """Clear all recorded actions."""
    
    def _create_schema(self) -> ToolSchema:
        return ToolSchema(
            name="clear_recording",
            description="Clear all recorded browser actions",
            input_schema=ClearRecordingParams,
            tool_type="readOnly"
        )
    
    async def handle(self, context: Context, params: ClearRecordingParams) -> ToolResult:
        """Clear recorded actions."""
        action_count = len(context.action_history)
        context.action_history.clear()
        
        return ToolResult(
            code=[f"Cleared {action_count} recorded actions"],
            capture_snapshot=False
        )