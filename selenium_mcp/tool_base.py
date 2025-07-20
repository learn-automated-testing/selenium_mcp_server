"""Base classes for tools - matches playwright-mcp tool structure."""

import logging
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Type
from dataclasses import dataclass
from pydantic import BaseModel, ValidationError

from .context import Context, ToolResult

logger = logging.getLogger(__name__)

@dataclass
class ToolSchema:
    """Tool schema definition - matches playwright-mcp ToolSchema."""
    name: str
    description: str
    input_schema: Type[BaseModel]
    tool_type: str = "readOnly"  # or "destructive"
    
    @property
    def input_schema_dict(self) -> Dict[str, Any]:
        """Get input schema as dictionary for MCP."""
        try:
            return self.input_schema.model_json_schema()
        except AttributeError:
            # Handle empty BaseModel classes 
            return {
                "type": "object",
                "properties": {},
                "required": []
            }
    
    def validate_params(self, params: Dict[str, Any]) -> BaseModel:
        """Validate and parse parameters."""
        try:
            return self.input_schema(**params)
        except ValidationError as e:
            raise ValueError(f"Invalid parameters for {self.name}: {e}")

class BaseTool(ABC):
    """Base class for all tools - matches playwright-mcp Tool interface."""
    
    def __init__(self):
        self.schema = self._create_schema()
    
    @abstractmethod
    def _create_schema(self) -> ToolSchema:
        """Create the tool schema."""
        pass
    
    @abstractmethod
    async def handle(self, context: Context, params: BaseModel) -> ToolResult:
        """Handle tool execution."""
        pass