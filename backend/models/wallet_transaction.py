from datetime import datetime
from sqlalchemy.orm import relationship
from . import db


class WalletTransaction(db.Model):
    __tablename__ = 'wallet_transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    wallet_id = db.Column(db.Integer, db.ForeignKey('user_wallets.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    transaction_type = db.Column(db.String, nullable=False)  # earn, spend, purchase, refund, etc.
    currency_type = db.Column(db.String, nullable=False)  # sf_coins, premium_gems, event_tokens
    amount = db.Column(db.Integer, nullable=False)
    balance_before = db.Column(db.Integer, nullable=False)
    balance_after = db.Column(db.Integer, nullable=False)
    xp_amount = db.Column(db.Integer, default=0)
    exchange_rate = db.Column(db.Float, default=0)
    reference_type = db.Column(db.String, nullable=True)  # purchase, product, etc.
    reference_id = db.Column(db.Integer, nullable=True)  # ID of related entity
    description = db.Column(db.String, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    wallet = relationship("UserWallet", back_populates="transactions")
    user = relationship("User", back_populates="transactions")
    
    def __repr__(self):
        return f'<WalletTransaction {self.id} {self.transaction_type} {self.amount} {self.currency_type}>'
