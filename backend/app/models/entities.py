from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, Float, ForeignKey, Text, Boolean, JSON
from sqlalchemy.orm import relationship
from ..db import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False, default="viewer")
    created_at = Column(DateTime, default=datetime.utcnow)


class GroceryItem(Base):
    __tablename__ = "grocery_items"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False, index=True)
    brand = Column(String, nullable=True)
    unit = Column(String, nullable=False)  # kg, liters, pieces, etc.
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    deals = relationship("GroceryDeal", back_populates="item")


class GroceryPlatform(Base):
    __tablename__ = "grocery_platforms"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)  # Amazon Fresh, Flipkart Supermart, etc.
    base_url = Column(String, nullable=False)
    delivery_time_min = Column(Integer, nullable=True)  # in minutes
    delivery_time_max = Column(Integer, nullable=True)  # in minutes
    delivery_fee = Column(Float, default=0.0)
    minimum_order = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class GroceryDeal(Base):
    __tablename__ = "grocery_deals"
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("grocery_items.id"), nullable=False)
    platform_id = Column(Integer, ForeignKey("grocery_platforms.id"), nullable=False)
    current_price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)
    discount_percentage = Column(Float, nullable=True)
    stock_available = Column(Boolean, default=True)
    delivery_time = Column(Integer, nullable=True)  # in minutes
    deal_type = Column(String, nullable=True)  # combo, flash_sale, bulk_discount, etc.
    deal_details = Column(JSON, nullable=True)  # Additional deal information
    last_updated = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    item = relationship("GroceryItem", back_populates="deals")
    platform = relationship("GroceryPlatform")


class GroceryList(Base):
    __tablename__ = "grocery_lists"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    items = relationship("GroceryListItem", back_populates="grocery_list")


class GroceryListItem(Base):
    __tablename__ = "grocery_list_items"
    id = Column(Integer, primary_key=True, index=True)
    grocery_list_id = Column(Integer, ForeignKey("grocery_lists.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("grocery_items.id"), nullable=False)
    quantity = Column(Float, nullable=False, default=1.0)
    priority = Column(String, default="normal")  # low, normal, high, urgent
    notes = Column(Text, nullable=True)
    
    # Relationships
    grocery_list = relationship("GroceryList", back_populates="items")
    item = relationship("GroceryItem")


class DealAnalysis(Base):
    __tablename__ = "deal_analyses"
    id = Column(Integer, primary_key=True, index=True)
    grocery_list_id = Column(Integer, ForeignKey("grocery_lists.id"), nullable=False)
    total_savings = Column(Float, default=0.0)
    best_platform = Column(String, nullable=True)
    delivery_time_comparison = Column(JSON, nullable=True)
    combo_deals_found = Column(JSON, nullable=True)
    recommendations = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    document_id = Column(String, index=True)
    agent = Column(String)
    action = Column(String)
    user_session = Column(String)
    result = Column(String)
    token_subject = Column(String)
