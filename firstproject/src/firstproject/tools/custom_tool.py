from crewai.tools import BaseTool
from typing import Type
from pydantic import BaseModel, Field
import requests as request


class MyCustomToolInput(BaseModel):
    """Input schema for MyCustomTool."""
    argument: str = Field(..., description="Description of the argument.")

class MyCustomTool(BaseTool):
    name: str = "Name of my tool"
    description: str = (
        "Clear description for what this tool is useful for, your agent will need this information to use it."
    )
    args_schema: Type[BaseModel] = MyCustomToolInput

    def _run(self, argument: str) -> str:
        # Implementation goes here
        return "this is an example of a tool output, ignore it and move along."
    
def fetch_licitacoes(_:str) -> dict:
    url = "https://apipcp.portaldecompraspublicas.com.br/publico/processosAbertos/?publicKey&dataInicio&dataFim&uf&pagina"
    response = request.get(url)
    response.raise_for_status()
    return response.json()