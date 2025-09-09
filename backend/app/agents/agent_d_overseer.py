from __future__ import annotations

from typing import List, Dict, Any, Optional
from datetime import datetime
from dataclasses import dataclass

from ..schemas.groceries import (
    GroceryItem,
    ProviderPrice,
    PriceQuery,
    PriceResult,
    CartOption,
    CartPlan,
    CheckoutRequest,
    CheckoutResponse,
)
from .agent_a_deal_scout import DealScoutAgent, MockProvider
from .agent_b_cart_builder import CartBuilderAgent
from .agent_c_order_executor import OrderExecutorAgent
from ..security.rbac import check_grocery_delegation


@dataclass
class AgentMetrics:
    agent_name: str
    execution_time_ms: float
    success: bool
    error_message: Optional[str] = None
    items_processed: int = 0
    cost_savings: float = 0.0


@dataclass
class WorkflowResult:
    success: bool
    final_order: Optional[CheckoutResponse] = None
    cart_plan: Optional[CartPlan] = None
    price_results: Optional[PriceResult] = None
    agent_metrics: List[AgentMetrics] = None
    total_execution_time_ms: float = 0.0
    total_cost_savings: float = 0.0
    recommendations: List[str] = None
    errors: List[str] = None


class OverseerAgent:
    """
    Agent D: Overseer Agent that coordinates and monitors the entire grocery workflow.
    
    Responsibilities:
    1. Orchestrate the workflow: Scout -> Cart -> Checkout
    2. Monitor agent performance and health
    3. Handle errors and retries
    4. Provide workflow analytics and insights
    5. Make strategic decisions about workflow optimization
    """
    
    def __init__(self):
        self.workflow_history: List[Dict[str, Any]] = []
        self.agent_performance_history: Dict[str, List[AgentMetrics]] = {
            "DealScoutAgent": [],
            "CartBuilderAgent": [],
            "OrderExecutorAgent": []
        }
        self.workflow_stats = {
            "total_workflows": 0,
            "successful_workflows": 0,
            "failed_workflows": 0,
            "total_cost_savings": 0.0,
            "avg_execution_time": 0.0
        }
        
    def _build_default_providers(self) -> List[MockProvider]:
        """Build default grocery platform providers"""
        return [
            MockProvider("amazon_fresh", base_price_multiplier=1.00, delivery_fee=0, eta_minutes=90),
            MockProvider("instacart", base_price_multiplier=1.02, delivery_fee=35, eta_minutes=120),
            MockProvider("uber_eats", base_price_multiplier=1.08, delivery_fee=25, eta_minutes=30),
        ]
    
    def _execute_with_monitoring(self, agent_name: str, func, *args, **kwargs) -> tuple[Any, AgentMetrics]:
        """Execute an agent function with performance monitoring"""
        start_time = datetime.utcnow()
        
        try:
            result = func(*args, **kwargs)
            execution_time = (datetime.utcnow() - start_time).total_seconds() * 1000
            
            metrics = AgentMetrics(
                agent_name=agent_name,
                execution_time_ms=execution_time,
                success=True,
                items_processed=len(result.items) if hasattr(result, 'items') else 0
            )
            
            return result, metrics
            
        except Exception as e:
            execution_time = (datetime.utcnow() - start_time).total_seconds() * 1000
            
            metrics = AgentMetrics(
                agent_name=agent_name,
                execution_time_ms=execution_time,
                success=False,
                error_message=str(e)
            )
            
            raise e
    
    def _calculate_cost_savings(self, original_prices: List[ProviderPrice], final_cart: CartOption) -> float:
        """Calculate cost savings from the workflow"""
        if not original_prices or not final_cart:
            return 0.0
        
        # Find the most expensive single-provider option as baseline
        max_total = max(
            sum(p.unit_price for p in prices) + max(p.delivery_fee for p in prices)
            for prices in self._group_by_provider(original_prices).values()
        ) if original_prices else 0.0
        
        savings = max_total - final_cart.total
        return max(0.0, savings)
    
    def _group_by_provider(self, prices: List[ProviderPrice]) -> Dict[str, List[ProviderPrice]]:
        """Group prices by provider"""
        grouped = {}
        for price in prices:
            grouped.setdefault(price.provider, []).append(price)
        return grouped
    
    def _generate_workflow_recommendations(self, workflow_result: WorkflowResult) -> List[str]:
        """Generate strategic recommendations based on workflow results"""
        recommendations = []
        
        if not workflow_result.success:
            recommendations.append("Workflow failed - review agent performance and retry")
            return recommendations
        
        # Performance recommendations
        avg_time = sum(m.execution_time_ms for m in workflow_result.agent_metrics) / len(workflow_result.agent_metrics)
        if avg_time > 5000:  # 5 seconds
            recommendations.append("Consider optimizing agent performance - execution time is high")
        
        # Cost optimization recommendations
        if workflow_result.total_cost_savings > 100:
            recommendations.append("Excellent cost savings achieved! Consider bulk ordering for better deals")
        elif workflow_result.total_cost_savings < 20:
            recommendations.append("Minimal savings - consider different providers or timing for better deals")
        
        # Provider recommendations
        if workflow_result.cart_plan and workflow_result.cart_plan.best_option_index < len(workflow_result.cart_plan.options):
            best_option = workflow_result.cart_plan.options[workflow_result.cart_plan.best_option_index]
            if best_option.provider == "mixed":
                recommendations.append("Mixed-cart strategy used - this often provides the best value")
            else:
                recommendations.append(f"Single provider ({best_option.provider}) selected - good for convenience")
        
        return recommendations
    
    def execute_workflow(self, query: PriceQuery, checkout_request: Optional[CheckoutRequest] = None) -> WorkflowResult:
        """
        Execute the complete grocery workflow: Scout -> Cart -> Checkout
        
        Args:
            query: Price query with grocery items
            checkout_request: Optional checkout request (if None, stops at cart building)
        
        Returns:
            WorkflowResult with complete workflow information
        """
        workflow_start = datetime.utcnow()
        agent_metrics = []
        errors = []
        
        try:
            # Step 1: Deal Scout Agent - Price Aggregation
            scout_agent = DealScoutAgent(self._build_default_providers())
            price_results, scout_metrics = self._execute_with_monitoring(
                "DealScoutAgent", 
                scout_agent.aggregate_prices, 
                query
            )
            agent_metrics.append(scout_metrics)
            
            
            # Step 2: Cart Builder Agent - Cart Optimization
            
            cart_agent = CartBuilderAgent()
            cart_plan, cart_metrics = self._execute_with_monitoring(
                "CartBuilderAgent",
                cart_agent.build_cart,
                price_results.items
            )
            agent_metrics.append(cart_metrics)
            
            
            # Step 3: Order Executor Agent - Checkout (if requested)
            final_order = None
            if checkout_request:
                executor_agent = OrderExecutorAgent()
                checkout_request.items = cart_plan.options[cart_plan.best_option_index].items
                checkout_request.provider = cart_plan.options[cart_plan.best_option_index].provider
                
                # Check delegation requirements before checkout
                order_value = sum(item.unit_price for item in checkout_request.items)
                required_role = check_grocery_delegation(order_value, "shopper")  # Default role
                
                if required_role and required_role != "shopper":
                    pass
                    # In production, this would create an approval flow
                
                final_order, executor_metrics = self._execute_with_monitoring(
                    "OrderExecutorAgent",
                    executor_agent.checkout,
                    checkout_request,
                    "shopper"  # Pass user role for delegation check
                )
                agent_metrics.append(executor_metrics)
            
            # Calculate workflow metrics
            total_time = (datetime.utcnow() - workflow_start).total_seconds() * 1000
            best_cart_option = cart_plan.options[cart_plan.best_option_index]
            cost_savings = self._calculate_cost_savings(price_results.items, best_cart_option)
            
            # Generate recommendations
            workflow_result = WorkflowResult(
                success=True,
                final_order=final_order,
                cart_plan=cart_plan,
                price_results=price_results,
                agent_metrics=agent_metrics,
                total_execution_time_ms=total_time,
                total_cost_savings=cost_savings,
                recommendations=self._generate_workflow_recommendations(WorkflowResult(
                    success=True, cart_plan=cart_plan, total_cost_savings=cost_savings
                )),
                errors=errors
            )
            
            # Record this workflow run for tracking
            self._update_workflow_history(workflow_result)
            self._update_agent_performance(agent_metrics)
            
            return workflow_result
            
        except Exception as e:
            total_time = (datetime.utcnow() - workflow_start).total_seconds() * 1000
            errors.append(f"Workflow failed: {str(e)}")
            
            workflow_result = WorkflowResult(
                success=False,
                agent_metrics=agent_metrics,
                total_execution_time_ms=total_time,
                errors=errors
            )
            
            self._update_workflow_history(workflow_result)
            return workflow_result
    
    def _update_workflow_history(self, workflow_result: WorkflowResult):
        """Update workflow history and statistics"""
        self.workflow_history.append({
            "timestamp": datetime.utcnow().isoformat(),
            "success": workflow_result.success,
            "execution_time_ms": workflow_result.total_execution_time_ms,
            "cost_savings": workflow_result.total_cost_savings,
            "errors": workflow_result.errors
        })
        
        self.workflow_stats["total_workflows"] += 1
        if workflow_result.success:
            self.workflow_stats["successful_workflows"] += 1
            self.workflow_stats["total_cost_savings"] += workflow_result.total_cost_savings
        else:
            self.workflow_stats["failed_workflows"] += 1
        
        # Calculate average execution time across all workflows
        total_time = sum(w["execution_time_ms"] for w in self.workflow_history)
        self.workflow_stats["avg_execution_time"] = total_time / len(self.workflow_history)
    
    def _update_agent_performance(self, agent_metrics: List[AgentMetrics]):
        """Update agent performance history"""
        for metrics in agent_metrics:
            self.agent_performance_history[metrics.agent_name].append(metrics)
    
    def get_workflow_analytics(self) -> Dict[str, Any]:
        """Get comprehensive workflow analytics"""
        return {
            "workflow_stats": self.workflow_stats,
            "agent_performance": {
                agent: {
                    "total_executions": len(metrics),
                    "success_rate": sum(1 for m in metrics if m.success) / len(metrics) if metrics else 0,
                    "avg_execution_time": sum(m.execution_time_ms for m in metrics) / len(metrics) if metrics else 0,
                    "recent_errors": [m.error_message for m in metrics[-5:] if not m.success and m.error_message]
                }
                for agent, metrics in self.agent_performance_history.items()
            },
            "recent_workflows": self.workflow_history[-10:],  # Last 10 workflows
            "total_cost_savings": self.workflow_stats["total_cost_savings"]
        }
    
    def get_agent_health_status(self) -> Dict[str, str]:
        """Get health status of all agents"""
        health_status = {}
        
        for agent_name, metrics in self.agent_performance_history.items():
            if not metrics:
                health_status[agent_name] = "Unknown"
                continue
            
            recent_metrics = metrics[-5:]  # Last 5 executions
            success_rate = sum(1 for m in recent_metrics if m.success) / len(recent_metrics)
            avg_time = sum(m.execution_time_ms for m in recent_metrics) / len(recent_metrics)
            
            if success_rate == 1.0 and avg_time < 1000:
                health_status[agent_name] = "Healthy"
            elif success_rate >= 0.8 and avg_time < 2000:
                health_status[agent_name] = "Good"
            elif success_rate >= 0.6:
                health_status[agent_name] = "Fair"
            else:
                health_status[agent_name] = "Poor"
        
        return health_status
    
    def retry_failed_workflow(self, workflow_id: str) -> Optional[WorkflowResult]:
        """Retry a failed workflow (placeholder for future implementation)"""
        # This would implement retry logic for failed workflows
        # For now, return None as placeholder
        return None
