from datetime import datetime
from sqlalchemy.orm import relationship
import uuid
from . import db, UUID, TIMESTAMP


class UserInventory(db.Model):
    __tablename__ = "user_inventory"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(UUID(as_uuid=True), db.ForeignKey('virtual_products.id'), nullable=False)
    purchase_id = db.Column(UUID(as_uuid=True), db.ForeignKey('product_purchases.id'))
    quantity = db.Column(db.Integer, default=1)
    remaining_uses = db.Column(db.Integer)  # For consumables
    acquired_at = db.Column(TIMESTAMP(timezone=True), default=datetime.utcnow)
    expires_at = db.Column(TIMESTAMP(timezone=True))
    is_equipped = db.Column(db.Boolean, default=False)  # For cosmetics
    is_active = db.Column(db.Boolean, default=True)  # For features
    is_consumed = db.Column(db.Boolean, default=False)
    expired = db.Column(db.Boolean, default=False)
    
    # Relationships
    user = relationship('User', back_populates='inventory')
    product = relationship('VirtualProduct', back_populates='inventory_items')
    purchase = relationship('ProductPurchase', back_populates='inventory_items')

    def __repr__(self):
        return f"<UserInventory {self.id} - User:{self.user_id} Product:{self.product_id}>"

    # Save inventory item to database
    def save(self):
        db.session.add(self)
        db.session.commit()

    # Delete inventory item from database
    def delete(self):
        db.session.delete(self)
        db.session.commit()

    # Find inventory item by ID
    @classmethod
    def find_by_id(cls, inventory_id: int):
        return cls.query.filter_by(id=inventory_id).first()

    # Find user inventory
    @classmethod
    def find_by_user(cls, user_id: int):
        return cls.query.filter_by(user_id=user_id).all()

    # Find specific user product
    @classmethod
    def find_user_product(cls, user_id: int, product_id: int):
        return cls.query.filter_by(user_id=user_id, product_id=product_id).first()

    # Find active items
    @classmethod
    def find_active_items(cls, user_id: int):
        return cls.query.filter_by(
            user_id=user_id,
            is_active=True,
            is_consumed=False,
            expired=False
        ).all()

    # Find equipped items
    @classmethod
    def find_equipped_items(cls, user_id: int):
        return cls.query.filter_by(user_id=user_id, is_equipped=True).all()

    # Equip item
    def equip(self):
        self.is_equipped = True
        self.save()

    # Unequip item
    def unequip(self):
        self.is_equipped = False
        self.save()

    # Use consumable
    def use_consumable(self, amount: int = 1):
        if self.remaining_uses is not None:
            self.remaining_uses -= amount
            if self.remaining_uses <= 0:
                self.is_consumed = True
                self.is_active = False
        elif self.quantity > 0:
            self.quantity -= amount
            if self.quantity <= 0:
                self.is_consumed = True
                self.is_active = False
        self.save()

    # Check if item is valid
    def is_valid(self) -> bool:
        if self.is_consumed or self.expired:
            return False
        if self.expires_at and self.expires_at < datetime.utcnow():
            self.expired = True
            self.is_active = False
            self.save()
            return False
        return True
