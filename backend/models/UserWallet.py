from datetime import datetime
from sqlalchemy import Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from .WalletTransaction import WalletTransaction
import uuid
from . import db, UUID, TIMESTAMP


class UserWallet(db.Model):
    __tablename__ = 'user_wallets'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    sf_coins = db.Column(Integer, default=0)
    premium_gems = db.Column(Integer, default=0)
    event_tokens = db.Column(Integer, default=0)
    total_coins_earned = db.Column(Integer, default=0)
    total_coins_spent = db.Column(Integer, default=0)
    daily_earnings = db.Column(Integer, default=0)
    daily_earning_limit = db.Column(Integer, default=1000)
    created_at = db.Column(TIMESTAMP(timezone=True), default=datetime.utcnow)
    updated_at = db.Column(TIMESTAMP(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    last_earning_reset = db.Column(TIMESTAMP(timezone=True), default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="wallet")
    transactions = relationship(
        "WalletTransaction",
        back_populates="wallet",
        cascade="all, delete-orphan"
    )
    event_token_balances = db.relationship("EventTokenBalance", back_populates="wallet")
    
    def earn_sf_coins(self, amount=0):
        """Earn SF Coins (subject to daily limit)"""
        if self.daily_earnings + amount > self.daily_earning_limit:
            raise ValueError("Daily earning limit exceeded")
        
        self.daily_earnings += amount
        self.total_coins_earned += amount
        self.sf_coins += amount
        
        WalletTransaction.record_transaction(
            wallet_id=self.id,
            user_id=self.user_id,
            transaction_type="earn",
            currency_type="sf_coins",
            amount=amount,
            balance_before=self.sf_coins - amount,
            balance_after=self.sf_coins,
            description="Earned SF Coins"
        )
        
        return self.total_coins_earned
    
    def spend_sf_coins(self, amount=0):
        """Spend SF Coins"""
        if amount > self.sf_coins:
            raise ValueError("Insufficient SF Coins")
        
        self.total_coins_spent += amount
        self.sf_coins -= amount
        
        WalletTransaction.record_transaction(
            wallet_id=self.id,
            user_id=self.user_id,
            transaction_type="spend",
            currency_type="sf_coins",
            amount=amount,
            balance_before=self.sf_coins + amount,
            balance_after=self.sf_coins,
            description="Spent SF Coins"
        )
        
        return self.total_coins_spent
    
    def add_premium_gems(self, amount=0):
        """Add Premium Gems (purchased currency)"""
        if amount <= 0:
            raise ValueError("Amount must be positive")
        self.premium_gems += amount
        
        WalletTransaction.record_transaction(
            wallet_id=self.id,
            user_id=self.user_id,
            transaction_type="earn",
            currency_type="premium_gems",
            amount=amount,
            balance_before=self.premium_gems - amount,
            balance_after=self.premium_gems,
            description="Added Premium Gems"
        )
        
        return self.premium_gems
    
    def spend_premium_gems(self, amount=0):
        """Spend Premium Gems"""
        if amount > self.premium_gems:
            raise ValueError("Insufficient Premium Gems")
        
        self.premium_gems -= amount
        
        WalletTransaction.record_transaction(
            wallet_id=self.id,
            user_id=self.user_id,
            transaction_type="spend",
            currency_type="premium_gems",
            amount=amount,
            balance_before=self.premium_gems + amount,
            balance_after=self.premium_gems,
            description="Spent Premium Gems"
        )
        
        return self.premium_gems
    
    def refund_sf_coins(self, amount):
        """Refund SF Coins"""
        if amount <= 0:
            raise ValueError("Refund amount must be positive")
        
        self.sf_coins += amount
        self.total_coins_spent -= amount
        
        WalletTransaction.record_transaction(
            wallet_id=self.id,
            user_id=self.user_id,
            transaction_type="refund",
            currency_type="sf_coins",
            amount=amount,
            balance_before=self.sf_coins - amount,
            balance_after=self.sf_coins,
            description="SF Coins Refunded"
        )
        
        return self.sf_coins

    def refund_premium_gems(self, amount):
        """Refund Premium Gems"""
        if amount <= 0:
            raise ValueError("Refund amount must be positive")
        
        self.premium_gems += amount
        
        WalletTransaction.record_transaction(
            wallet_id=self.id,
            user_id=self.user_id,
            transaction_type="refund",
            currency_type="premium_gems",
            amount=amount,
            balance_before=self.premium_gems - amount,
            balance_after=self.premium_gems,
            description="Premium Gems Refunded"
        )
    
        return self.premium_gems
    
    def update_daily_tracker(self):
        """Reset daily earnings counter"""
        self.daily_earnings = 0
        self.last_earning_reset = datetime.utcnow()
        
    def award_achievement_bonus(self, bonus_amount=0):
        """Award achievement bonus (bypasses daily limit)"""
        if bonus_amount <= 0:
            raise ValueError("Bonus amount must be positive")
        self.sf_coins += bonus_amount
        self.total_coins_earned += bonus_amount
        
        WalletTransaction.record_transaction(
            wallet_id=self.id,
            user_id=self.user_id,
            transaction_type="bonus",
            currency_type="sf_coins",
            amount=bonus_amount,
            balance_before=self.sf_coins - bonus_amount,
            balance_after=self.sf_coins,
            description="Achievement Bonus Awarded"
        )
        
        return self.sf_coins
    
    def __repr__(self):
        return f'<UserWallet user_id={self.user_id} sf_coins={self.sf_coins} premium_gems={self.premium_gems}>'