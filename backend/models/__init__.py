from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, DateTime, Enum as ENUM, JSON as JSONB
import uuid

db = SQLAlchemy()

# MySQL-compatible UUID type (returns String(36))
def UUID(as_uuid=True):
    return String(36)

# MySQL-compatible TIMESTAMP (use DateTime instead)
def TIMESTAMP(timezone=True):
    return DateTime()

from .user import User
from .virtual_product import VirtualProduct
from .product_purchase import ProductPurchase
from .user_inventory import UserInventory
from .WalletTransaction import WalletTransaction
from .EventTokenBalance import EventTokenBalance
from .exchange_rate import ExchangeRate
from .UserWallet import UserWallet


__all__ = [
    'db',
    'UUID',
    'JSONB',
    'TIMESTAMP',
    'ENUM',
    'User',
    'VirtualProduct',
    'ProductPurchase',
    'UserInventory',
    'WalletTransaction',
    'EventTokenBalance',
    'ExchangeRate',
    'UserWallet'
]
