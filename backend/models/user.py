from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.orm import relationship
from . import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=True)  # Optional for now
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    wallet = relationship("UserWallet", back_populates="user", uselist=False, cascade="all, delete-orphan")
    transactions = relationship("WalletTransaction", back_populates="user", cascade="all, delete-orphan")
    purchases = relationship('ProductPurchase', back_populates='user', cascade="all, delete-orphan")
    inventory = relationship('UserInventory', back_populates='user', cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.username}>"

    # Set password
    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    # Check password
    def check_password(self, password: str) -> bool:
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)

    # Save user to database
    def save(self):
        db.session.add(self)
        db.session.commit()

    # Delete user from database
    def delete(self):
        db.session.delete(self)
        db.session.commit()

    # Find user by email
    @classmethod
    def find_by_email(cls, email: str):
        return cls.query.filter_by(email=email).first()

    # Find user by username
    @classmethod
    def find_by_username(cls, username: str):
        return cls.query.filter_by(username=username).first()
