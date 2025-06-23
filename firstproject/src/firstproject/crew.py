from crewai import Agent, Task, Crew
import yaml
from pathlib import Path
from src.firstproject.tools.custom_tool import fetch_licitacoes

def load_yaml(path: str):
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

def build_crew() -> Crew:
    # Caminhos para os arquivos YAML
    base_path = Path("src/firstproject/config")
    agents_data = load_yaml(base_path / "agents.yaml")
    tasks_data = load_yaml(base_path / "tasks.yaml")

    # Criação dos agentes
    agents = {
        name: Agent(
            role=data["role"],
            goal=data["goal"],
            backstory=data["backstory"],
            allow_delegation=False,
            tools=[fetch_licitacoes] if name == "api_agent" else []
        )
        for name, data in agents_data.items()
    }

    # Criação das tarefas vinculadas aos agentes
    tasks = [
        Task(
            description=data["description"],
            expected_output=data["expected_output"],
            agent=agents[data["agent"]]
        )
        for data in tasks_data.values()
    ]

    # Criando a Crew
    crew = Crew(
        agents=list(agents.values()),
        tasks=tasks,
        verbose=True
    )

    return crew
