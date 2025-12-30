from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import UUID, JSONB, TIMESTAMP, ENUM

db = SQLAlchemy()

from .user import User
from .virtual_product import VirtualProduct
from .product_purchase import ProductPurchase
from .user_inventory import UserInventory
from .user_wallet import UserWallet
from .wallet_transaction import WalletTransaction
from .exchange_rate import ExchangeRate

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
    'UserWallet',
    'WalletTransaction',
    'ExchangeRate'
]
