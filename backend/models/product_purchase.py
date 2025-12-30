from datetime import datetime
from sqlalchemy.orm import relationship
import uuid
from . import db, UUID, TIMESTAMP, ENUM

# ENUM types for ProductPurchase
purchase_status_enum = ENUM(
    'pending', 'completed', 'cancelled', 'refunded', 'failed',
    name='purchase_status_enum'
)


class ProductPurchase(db.Model):
    __tablename__ = "product_purchases"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(UUID(as_uuid=True), db.ForeignKey('virtual_products.id'), nullable=False)
    currency_type = db.Column(db.Text, nullable=False)
    amount_paid = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(purchase_status_enum, default='pending')  # pending, completed, cancelled, refunded
    purchased_at = db.Column(TIMESTAMP(timezone=True), default=datetime.utcnow)
    expires_at = db.Column(TIMESTAMP(timezone=True))
    is_delivered = db.Column(db.Boolean, default=False)
    delivered_at = db.Column(TIMESTAMP(timezone=True))
    transaction_id = db.Column(UUID(as_uuid=True))  # Links to WalletTransaction
    
    # Relationships
    user = relationship('User', back_populates='purchases')
    product = relationship('VirtualProduct', back_populates='purchases')
    inventory_items = relationship('UserInventory', back_populates='purchase', cascade="all, delete-orphan")

    def __repr__(self):
        return f"<ProductPurchase {self.id} - User:{self.user_id} Product:{self.product_id}>"

    # Save purchase to database
    def save(self):
        db.session.add(self)
        db.session.commit()

    # Delete purchase from database
    def delete(self):
        db.session.delete(self)
        db.session.commit()

    # Find purchase by ID
    @classmethod
    def find_by_id(cls, purchase_id: int):
        return cls.query.filter_by(id=purchase_id).first()

    # Find purchases by user
    @classmethod
    def find_by_user(cls, user_id: int):
        return cls.query.filter_by(user_id=user_id).order_by(cls.purchased_at.desc()).all()

    # Find purchases by product
    @classmethod
    def find_by_product(cls, product_id: int):
        return cls.query.filter_by(product_id=product_id).all()

    # Find purchases by status
    @classmethod
    def find_by_status(cls, status: str):
        return cls.query.filter_by(status=status).all()

    # Find user purchases by product
    @classmethod
    def find_user_product_purchases(cls, user_id: int, product_id: int):
        return cls.query.filter_by(user_id=user_id, product_id=product_id).all()

    # Mark as completed
    def complete(self):
        self.status = 'completed'
        self.save()

    # Mark as delivered
    def deliver(self):
        self.is_delivered = True
        self.delivered_at = datetime.utcnow()
        self.save()

    # Cancel purchase
    def cancel(self):
        self.status = 'cancelled'
        self.save()

    # Refund purchase
    def refund(self):
        self.status = 'refunded'
        self.save()

    # Check if purchase is active
    def is_active(self) -> bool:
        if self.status != 'completed':
            return False
        if self.expires_at and self.expires_at < datetime.utcnow():
            return False
        return True
