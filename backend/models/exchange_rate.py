from datetime import datetime
from sqlalchemy import Integer, String, Float, Boolean, DateTime
from . import db


class ExchangeRate(db.Model):
    __tablename__ = 'exchange_rates'
    
    id = db.Column(Integer, primary_key=True)
    from_currency = db.Column(String, nullable=False)
    to_currency = db.Column(String, nullable=False)
    base_rate = db.Column(Float, nullable=False)
    current_rate = db.Column(Float, nullable=False)
    min_amount = db.Column(Integer, nullable=False)
    max_amount = db.Column(Integer, nullable=False)
    demand_factor = db.Column(Float, default=1.0)
    time_factor = db.Column(Float, default=1.0)
    user_tier_factor = db.Column(Float, default=1.0)
    is_active = db.Column(Boolean, default=True)
    effective_from = db.Column(DateTime, nullable=True)
    effective_to = db.Column(DateTime, nullable=False)
    created_at = db.Column(DateTime, default=datetime.utcnow)
    updated_at = db.Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<ExchangeRate {self.from_currency}->{self.to_currency} rate={self.current_rate}>'
