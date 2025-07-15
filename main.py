from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import uuid
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class Asset(BaseModel):
    id: str
    name: str
    initial_value: float
    expected_return: float  # as a decimal, e.g., 0.07 for 7%
    variance: float         # as a decimal, e.g., 0.15 for 15%
    tax_rate: float         # as a decimal, e.g., 0.22 for 22%

class Scenario(BaseModel):
    id: str
    name: str
    asset_ids: List[str]
    years: int

class SimulationResult(BaseModel):
    scenario_id: str
    values: List[float]  # Portfolio value per year

# In-memory storage
assets: Dict[str, Asset] = {}
scenarios: Dict[str, Scenario] = {}

# Asset endpoints
@app.post("/assets", response_model=Asset)
def create_asset(asset: Asset):
    if asset.id in assets:
        raise HTTPException(status_code=400, detail="Asset ID already exists.")
    assets[asset.id] = asset
    return asset

@app.get("/assets", response_model=List[Asset])
def list_assets():
    return list(assets.values())

@app.get("/assets/{asset_id}", response_model=Asset)
def get_asset(asset_id: str):
    asset = assets.get(asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found.")
    return asset

# Scenario endpoints
@app.post("/scenarios", response_model=Scenario)
def create_scenario(scenario: Scenario):
    if scenario.id in scenarios:
        raise HTTPException(status_code=400, detail="Scenario ID already exists.")
    scenarios[scenario.id] = scenario
    return scenario

@app.get("/scenarios", response_model=List[Scenario])
def list_scenarios():
    return list(scenarios.values())

@app.get("/scenarios/{scenario_id}", response_model=Scenario)
def get_scenario(scenario_id: str):
    scenario = scenarios.get(scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found.")
    return scenario

# Simulation endpoint
@app.post("/simulate/{scenario_id}", response_model=SimulationResult)
def simulate_scenario(scenario_id: str):
    scenario = scenarios.get(scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found.")
    portfolio_value = 0.0
    for aid in scenario.asset_ids:
        asset = assets.get(aid)
        if asset:
            portfolio_value += asset.initial_value
    values = [portfolio_value]
    for year in range(1, scenario.years + 1):
        next_value = 0.0
        for aid in scenario.asset_ids:
            asset = assets.get(aid)
            if asset:
                # Simple deterministic growth for now
                v = values[-1] * (1 + asset.expected_return)
                v = v * (1 - asset.tax_rate)
                next_value += v
        values.append(next_value)
    return SimulationResult(scenario_id=scenario_id, values=values)