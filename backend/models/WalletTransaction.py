from datetime import datetime
from sqlalchemy.orm import relationship
import uuid
from . import db, UUID, TIMESTAMP, ENUM

# ENUM types for WalletTransaction
transaction_type_enum = ENUM(
    'earn', 'spend', 'purchase', 'refund', 'transfer', 'bonus', 'penalty',
    name='transaction_type_enum'
)

currency_type_enum = ENUM(
    'sf_coins', 'premium_gems', 'event_tokens',
    name='currency_type_enum'
)


class WalletTransaction(db.Model):
    __tablename__ = 'wallet_transactions'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    wallet_id = db.Column(UUID(as_uuid=True), db.ForeignKey('user_wallets.id'), nullable=False)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    transaction_type = db.Column(transaction_type_enum, nullable=False)  # earn, spend, purchase, refund, etc.
    currency_type = db.Column(currency_type_enum, nullable=False)  # sf_coins, premium_gems, event_tokens
    amount = db.Column(db.Integer, nullable=False)
    balance_before = db.Column(db.Integer, nullable=False)
    balance_after = db.Column(db.Integer, nullable=False)
    xp_amount = db.Column(db.Integer, default=0)
    exchange_rate = db.Column(db.Float, default=0)
    reference_type = db.Column(db.Text, nullable=True)  # purchase, product, etc.
    reference_id = db.Column(db.Integer, nullable=True)  # ID of related entity
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(TIMESTAMP(timezone=True), default=datetime.utcnow)
    
    # Relationships
    wallet = relationship("UserWallet", back_populates="transactions")
    user = relationship("User", back_populates="transactions")
    
    @staticmethod
    def record_transaction(wallet_id, user_id, transaction_type, currency_type, amount,
                           balance_before, balance_after, source_type = None,
                           source_id=None, description=None):
        transaction = WalletTransaction(
            wallet_id=wallet_id,
            user_id=user_id,
            transaction_type=transaction_type,
            currency_type=currency_type,
            amount=amount,
            balance_before=balance_before,
            balance_after=balance_after,
            source_type=source_type,
            source_id=source_id,
            description=description
        )
        db.session.add(transaction)
        db.session.commit()
    
    def __repr__(self):
        return f'<WalletTransaction {self.id} {self.transaction_type} {self.amount} {self.currency_type}>'

    