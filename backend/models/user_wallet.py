from datetime import datetime
from sqlalchemy import Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from . import db


class UserWallet(db.Model):
    __tablename__ = 'user_wallets'
    
    id = db.Column(Integer, primary_key=True)
    user_id = db.Column(Integer, ForeignKey('users.id'), nullable=False)
    sf_coins = db.Column(Integer, default=0)
    premium_gems = db.Column(Integer, default=0)
    event_tokens = db.Column(Integer, default=0)
    total_coins_earned = db.Column(Integer, default=0)
    total_coins_spent = db.Column(Integer, default=0)
    daily_earnings = db.Column(Integer, default=0)
    daily_earning_limit = db.Column(Integer, default=1000)
    created_at = db.Column(DateTime, default=datetime.utcnow)
    updated_at = db.Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_earning_reset = db.Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="wallet")
    transactions = relationship(
        "WalletTransaction",
        back_populates="wallet",
        cascade="all, delete-orphan"
    )
    
    def earn_sf_coins(self, amount=0):
        if self.daily_earnings + amount > self.daily_earning_limit:
            raise ValueError("Daily earning limit exceeded")
        
        self.daily_earnings += amount
        self.total_coins_earned += amount
        self.sf_coins += amount
        
        return self.total_coins_earned
    
    def spend_sf_coins(self, amount=0):
        if amount > self.sf_coins:
            raise ValueError("Insufficient SF Coins")
        
        self.total_coins_spent += amount
        self.sf_coins -= amount
        
        return self.total_coins_spent
    
    def spend_premium_gems(self, amount=0):
        if amount > self.premium_gems:
            raise ValueError("Insufficient Premium Gems")
        
        self.premium_gems -= amount
        return self.premium_gems
    
    def spend_event_tokens(self, amount=0):
        if amount > self.event_tokens:
            raise ValueError("Insufficient Event Tokens")
        
        self.event_tokens -= amount
        return self.event_tokens
    
    def add_premium_gems(self, amount=0):
        if amount <= 0:
            raise ValueError("Amount must be positive")
        self.premium_gems += amount
        return self.premium_gems
    
    def add_event_tokens(self, amount=0):
        if amount <= 0:
            raise ValueError("Amount must be positive")
        self.event_tokens += amount
        return self.event_tokens
    
    def update_daily_tracker(self):
        self.daily_earnings = 0
        self.last_earning_reset = datetime.utcnow()
        
    def award_achievement_bonus(self, bonus_amount=0):
        if bonus_amount <= 0:
            raise ValueError("Bonus amount must be positive")
        self.sf_coins += bonus_amount
        self.total_coins_earned += bonus_amount
        
        return self.sf_coins
    
    def __repr__(self):
        return f'<UserWallet user_id={self.user_id} sf_coins={self.sf_coins}>'
