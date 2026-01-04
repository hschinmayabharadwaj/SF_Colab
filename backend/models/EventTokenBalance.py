from . import db
from datetime import datetime
from .WalletTransaction import WalletTransaction
from sqlalchemy.orm import relationship
import uuid
from . import db, UUID, TIMESTAMP


class EventTokenBalance(db.Model):
    __tablename__ = 'event_token_balances'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    wallet_id = db.Column(UUID(as_uuid=True), db.ForeignKey('user_wallets.id'), nullable=False)
    event_id = db.Column(db.String(255), nullable=False)
    balance = db.Column(db.Integer, default=0)
    earned_total = db.Column(db.Integer, default=0)
    spent_total = db.Column(db.Integer, default=0)
    created_at = db.Column(TIMESTAMP(timezone=True), default=datetime.utcnow)
    expires_at = db.Column(TIMESTAMP(timezone=True), nullable=True)
    last_updated = db.Column(TIMESTAMP(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="event_token_balances")
    wallet = relationship("UserWallet", back_populates="event_token_balances")

    def add_event_tokens(self, amount):
        if self.is_expired():
            raise ValueError("Cannot add tokens to an expired balance")

        if amount <= 0:
            raise ValueError("Amount must be positive")
        self.balance += amount
        self.earned_total += amount
        db.session.commit()

    def spend_event_tokens(self, amount):
        if self.is_expired():
            raise ValueError("Cannot spend expired tokens")
        if amount > self.balance:
            raise ValueError("Insufficient event tokens")
        self.balance -= amount
        self.spent_total += amount
        db.session.commit()

    def is_expired(self):
        if self.expires_at and datetime.utcnow() > self.expires_at:
            return True
        return False

    def __repr__(self):
        return f'<EventTokenBalance {self.id} event={self.event_id} balance={self.balance}>'