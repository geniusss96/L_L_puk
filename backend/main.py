from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import networkx as nx
import networkx.algorithms.community as nx_comm
import pandas as pd
from typing import List, Dict, Any
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer, String, Float, MetaData, Table

load_dotenv()

app = FastAPI(title="PageRank API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, specify Vercel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Setup (Neon PostgreSQL)
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    # SQLAlchemy requires postgresql:// instead of postgres:// 
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    engine = create_engine(DATABASE_URL)
    metadata = MetaData()
    # Define a simple table to store calculation history or user data
    history_table = Table(
        'pagerank_history', metadata,
        Column('id', Integer, primary_key=True),
        Column('nodes_count', Integer),
        Column('edges_count', Integer),
        Column('top_node', String),
        Column('top_score', Float)
    )
    metadata.create_all(engine)

class Edge(BaseModel):
    source: str
    target: str

class GraphData(BaseModel):
    edges: List[Edge]
    alpha: float = 0.85
    max_iter: int = 100

@app.get("/")
def read_root():
    return {"message": "PageRank API is running"}

@app.post("/calculate_pagerank")
def calculate_pagerank(data: GraphData):
    if not data.edges:
        raise HTTPException(status_code=400, detail="No edges provided")
    
    # 1. Create a directed graph
    G = nx.DiGraph()
    
    # 2. Add edges
    edge_list = [(edge.source, edge.target) for edge in data.edges]
    G.add_edges_from(edge_list)
    
    # 3. Calculate PageRank
    try:
        pagerank_scores = nx.pagerank(G, alpha=data.alpha, max_iter=data.max_iter)
    except nx.PowerIterationFailedConvergence:
        raise HTTPException(status_code=500, detail="PageRank did not converge")
    
    # 4. Get Top 10
    top_10 = sorted(pagerank_scores.items(), key=lambda x: x[1], reverse=True)[:10]
    
    result = [
        {"node": node, "score": score} 
        for node, score in top_10
    ]
    
    # Optionally save to Neon DB
    if DATABASE_URL and result:
        with engine.begin() as conn:
            conn.execute(history_table.insert().values(
                nodes_count=G.number_of_nodes(),
                edges_count=G.number_of_edges(),
                top_node=str(result[0]['node']),
                top_score=float(result[0]['score'])
            ))
            
    # 5. Community Detection for Clustering
    try:
        undirected_G = G.to_undirected()
        communities = nx_comm.greedy_modularity_communities(undirected_G)
        node_groups = {}
        for i, comm in enumerate(communities):
            for node in comm:
                node_groups[node] = i
    except Exception:
        node_groups = {node: 0 for node in G.nodes()}

    # 6. Format graph data for visualization (limit to 500 nodes/edges for performance)
    viz_nodes = [{"id": node, "val": score * 100, "group": node_groups.get(node, 0)} for node, score in list(pagerank_scores.items())[:500]]
    viz_links = [{"source": u, "target": v} for u, v in list(G.edges())[:500]]

    return {
        "nodes": G.number_of_nodes(),
        "edges": G.number_of_edges(),
        "top_10": result,
        "graph_data": {
            "nodes": viz_nodes,
            "links": viz_links
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
