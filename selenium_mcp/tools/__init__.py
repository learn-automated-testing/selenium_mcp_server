"""Tools package - Selenium browser automation MCP tools."""

from .navigate import NavigateTool, GoBackTool, GoForwardTool
from .snapshot import SnapshotTool, ClickTool, HoverTool, SelectTool
from .keyboard import TypeTool
from .screenshot import ScreenshotTool
from .window import ResizeTool
from .wait import WaitTool
from .common import CloseTool
from .mouse import MouseMoveTool, MouseClickTool, MouseDragTool
from .keys import KeyPressTool
from .tabs import TabListTool, TabSelectTool, TabNewTool, TabCloseTool
from .javascript import JavaScriptTool
from .dialogs import DialogTool
from .drag import DragDropTool
from .files import FileUploadTool
from .console import ConsoleTool
from .network import NetworkTool
from .pdf import PDFTool
from .recording import StartRecordingTool, StopRecordingTool, RecordingStatusTool, ClearRecordingTool
from .script_generator import GenerateScriptTool
from .reset_session import ResetSessionTool

def get_all_tools():
    """Get all available tools."""
    return [
        # Navigation
        NavigateTool(),
        GoBackTool(),
        GoForwardTool(),
        
        # Page analysis
        SnapshotTool(),
        
        # Element interactions
        ClickTool(),
        HoverTool(),
        SelectTool(),
        TypeTool(),
        
        # Mouse operations
        MouseMoveTool(),
        MouseClickTool(),
        MouseDragTool(),
        
        # Keyboard operations
        KeyPressTool(),
        
        # Tab management
        TabListTool(),
        TabSelectTool(),
        TabNewTool(),
        TabCloseTool(),
        
        # JavaScript evaluation
        JavaScriptTool(),
        
        # Dialog handling
        DialogTool(),
        
        # Advanced interactions
        DragDropTool(),
        
        # File operations
        FileUploadTool(),
        
        # Console and debugging
        ConsoleTool(),
        
        # Network monitoring
        NetworkTool(),
        
        # PDF generation
        PDFTool(),
        
        # Wait and timing
        WaitTool(),
        
        # Browser management
        ScreenshotTool(),
        ResizeTool(),
        CloseTool(),
        
        # Recording and script generation
        StartRecordingTool(),
        StopRecordingTool(),
        RecordingStatusTool(),
        ClearRecordingTool(),
        GenerateScriptTool(),
        
        # Session management
        ResetSessionTool(),
    ]