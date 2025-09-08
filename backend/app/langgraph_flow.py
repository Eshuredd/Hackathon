from typing import Dict, Any
from langgraph.graph import StateGraph, END

# This is a thin orchestrator; heavy lifting happens in Celery tasks.
# Grocery pipeline: scout -> cart -> checkout


def scout_node(state: Dict[str, Any]) -> Dict[str, Any]:
    # Price aggregation done asynchronously; move to cart planning
    return {**state, "next": "cart_node"}


def cart_node(state: Dict[str, Any]) -> Dict[str, Any]:
    # Cart planning completed; proceed to checkout
    return {**state, "next": "checkout_node"}


def checkout_node(state: Dict[str, Any]) -> Dict[str, Any]:
    return {**state, "done": True}


def build_graph():
    g = StateGraph(dict)
    g.add_node("scout_node", scout_node)
    g.add_node("cart_node", cart_node)
    g.add_node("checkout_node", checkout_node)

    g.set_entry_point("scout_node")
    g.add_edge("scout_node", "cart_node")
    g.add_edge("cart_node", "checkout_node")
    g.add_edge("checkout_node", END)
    return g.compile()
