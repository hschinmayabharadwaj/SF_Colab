from datetime import datetime
from . import db


class VirtualProduct(db.Model):
    __tablename__ = "virtual_products"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    product_type = db.Column(db.String(50), nullable=False)  # feature_unlock, cosmetic, booster, subscription, etc.
    currency_type = db.Column(db.String(20), nullable=False)  # sf_coins, premium_gems, event_tokens
    price = db.Column(db.Numeric(10, 2), nullable=False)
    duration_days = db.Column(db.Integer)  # For time-based items
    consumable = db.Column(db.Boolean, default=False)
    max_purchases = db.Column(db.Integer)  # Purchase limit per user
    stock_quantity = db.Column(db.Integer)  # Available stock (null = unlimited)
    
    # Requirements
    min_user_level = db.Column(db.Integer, default=1)
    required_achievements = db.Column(db.JSON)  # List of achievement IDs
    
    # Visibility
    is_active = db.Column(db.Boolean, default=True)
    available_from = db.Column(db.DateTime)
    available_to = db.Column(db.DateTime)
    
    # Media
    icon_url = db.Column(db.String(255))
    preview_url = db.Column(db.String(255))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    purchases = db.relationship('ProductPurchase', back_populates='product', cascade="all, delete-orphan")
    inventory_items = db.relationship('UserInventory', back_populates='product', cascade="all, delete-orphan")

    def __repr__(self):
        return f"<VirtualProduct {self.name}>"

    # Save product to database
    def save(self):
        db.session.add(self)
        db.session.commit()

    # Delete product from database
    def delete(self):
        db.session.delete(self)
        db.session.commit()

    # Find product by ID
    @classmethod
    def find_by_id(cls, product_id: int):
        return cls.query.filter_by(id=product_id).first()

    # Find active products
    @classmethod
    def find_active_products(cls):
        now = datetime.utcnow()
        return cls.query.filter(
            cls.is_active == True,
            (cls.available_from == None) | (cls.available_from <= now),
            (cls.available_to == None) | (cls.available_to >= now)
        ).all()

    # Find products by type
    @classmethod
    def find_by_type(cls, product_type: str):
        return cls.query.filter_by(product_type=product_type, is_active=True).all()

    # Check if product is available
    def is_available(self) -> bool:
        if not self.is_active:
            return False
        
        now = datetime.utcnow()
        if self.available_from and self.available_from > now:
            return False
        if self.available_to and self.available_to < now:
            return False
        
        if self.stock_quantity is not None and self.stock_quantity <= 0:
            return False
        
        return True

    # Check if user meets requirements
    def user_meets_requirements(self, user_level: int, user_achievements: list) -> bool:
        if user_level < self.min_user_level:
            return False
        
        if self.required_achievements:
            required_set = set(self.required_achievements)
            user_set = set(user_achievements)
            if not required_set.issubset(user_set):
                return False
        
        return True
