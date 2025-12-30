from datetime import datetime
from sqlalchemy import Integer, Float, Boolean
import uuid
from . import db, UUID, TIMESTAMP


class ExchangeRate(db.Model):
    __tablename__ = 'exchange_rates'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    from_currency = db.Column(db.Text, nullable=False)
    to_currency = db.Column(db.Text, nullable=False)
    base_rate = db.Column(Float, nullable=False)
    current_rate = db.Column(Float, nullable=False)
    min_amount = db.Column(Integer, nullable=False)
    max_amount = db.Column(Integer, nullable=False)
    demand_factor = db.Column(Float, default=1.0)
    time_factor = db.Column(Float, default=1.0)
    user_tier_factor = db.Column(Float, default=1.0)
    is_active = db.Column(Boolean, default=True)
    effective_from = db.Column(TIMESTAMP(timezone=True), nullable=True)
    effective_to = db.Column(TIMESTAMP(timezone=True), nullable=False)
    created_at = db.Column(TIMESTAMP(timezone=True), default=datetime.utcnow)
    updated_at = db.Column(TIMESTAMP(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<ExchangeRate {self.from_currency}->{self.to_currency} rate={self.current_rate}>'
