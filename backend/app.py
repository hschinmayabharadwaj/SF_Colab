from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, User, UserWallet, WalletTransaction, VirtualProduct, ProductPurchase, UserInventory, EventTokenBalance, ExchangeRate
from datetime import datetime, timedelta
from dotenv import load_dotenv
from uuid import UUID as PyUUID
import os

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configuration - PostgreSQL database
# Get database URL from environment or construct from components
DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    # Construct from individual components if DATABASE_URL not provided
    DB_USER = os.getenv('DB_USER', 'postgres')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'postgres')
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = os.getenv('DB_PORT', '5432')
    DB_NAME = os.getenv('DB_NAME', 'sf_combined')
    DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here-change-in-production')

# Enable CORS for frontend communication
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize database
db.init_app(app)


# ============================================================================
# HEALTH & INFO ENDPOINTS
# ============================================================================

@app.route('/')
def index():
    return jsonify({
        "message": "SF Combined API - Virtual Product Store with Wallet System",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "users": "/users",
            "wallet": "/wallet/*",
            "products": "/products/*",
            "inventory": "/inventory/*"
        }
    }), 200


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"}), 200


# ============================================================================
# USER ENDPOINTS
# ============================================================================

@app.route('/users', methods=['POST'])
def create_user():
    """Create a new user with wallet"""
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        
        if not username or not email:
            return jsonify({"error": "Username and email are required"}), 400
        
        # Check if user exists
        existing_user = db.session.query(User).filter(
            (User.username == username) | (User.email == email)
        ).first()
        
        if existing_user:
            return jsonify({"error": "User already exists"}), 400
        
        # Create user
        user = User(username=username, email=email)
        db.session.add(user)
        db.session.flush()  # Get user ID
        
        # Create wallet for user
        wallet = UserWallet(
            user_id=user.id,
            sf_coins=0,
            premium_gems=0,
            event_tokens=0
        )
        db.session.add(wallet)
        db.session.commit()
        
        return jsonify({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "wallet_created": True
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route('/users/user_id', methods=['GET'])
def get_user(user_id):
    """Get user information"""
    try:
        user = db.session.query(User).filter_by(id=user_id).first()
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat() if user.created_at else None
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/users', methods=['GET'])
def list_users():
    """List all users"""
    try:
        users = db.session.query(User).all()
        return jsonify({
            "users": [
                {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "is_active": user.is_active
                } for user in users
            ]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============================================================================
# WALLET ENDPOINTS
# ============================================================================

@app.route('/wallet/balance/<user_id>', methods=['GET'])
def get_wallet_balance(user_id):
    """Get wallet balance for a user"""
    try:
        # Convert string to UUID
        user_uuid = PyUUID(user_id)
        
        wallet = db.session.query(UserWallet).filter_by(user_id=user_uuid).first()
        """if not wallet:
            return jsonify({"error": "Wallet not found"}), 404"""
        
        if not wallet:
            # Create a default wallet if not found
            wallet = UserWallet(
                user_id=user_uuid,
                sf_coins=0,
                premium_gems=0,
                event_tokens=0,
                total_coins_earned=0,
                total_coins_spent=0,
                daily_earnings=0,
                daily_earning_limit=100  # or any default
            )
            db.session.add(wallet)
            db.session.commit()
        
        return jsonify({
            "sf_coins": wallet.sf_coins,
            "premium_gems": wallet.premium_gems,
            "event_tokens": wallet.event_tokens,
            "total_coins_earned": wallet.total_coins_earned,
            "total_coins_spent": wallet.total_coins_spent,
            "daily_earnings": wallet.daily_earnings,
            "daily_earning_limit": wallet.daily_earning_limit
        }), 200
    except ValueError:
        return jsonify({"error": "Invalid user ID format"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route('/wallet/history/user_id', methods=['GET'])   
def get_wallet_history(user_id):
    """Get wallet transaction history"""
    try:
        transactions = db.session.query(WalletTransaction).filter_by(user_id=user_id).order_by(WalletTransaction.created_at.desc()).all()
        
        if not transactions:
            return jsonify({"message": "No transactions found", "transactions": []}), 200
        
        history = []
        for transaction in transactions:
            history.append({
                "id": transaction.id,
                "transaction_type": transaction.transaction_type,
                "currency_type": transaction.currency_type,
                "amount": transaction.amount,
                "balance_before": transaction.balance_before,
                "balance_after": transaction.balance_after,
                "description": transaction.description,
                "created_at": transaction.created_at.isoformat() if transaction.created_at else None
            })
        
        return jsonify({"transactions": history}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/wallet/earn', methods=['POST'])
def earn_coins():
    """Earn SF Coins"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        amount = data.get('amount', 0)
        description = data.get('description', 'Earned coins')
        
        if not user_id or amount <= 0:
            return jsonify({"error": "Invalid user_id or amount"}), 400
        
        wallet = db.session.query(UserWallet).filter_by(user_id=user_id).first()
        if not wallet:
            return jsonify({"error": "Wallet not found"}), 404
        
        # Check daily limit
        if wallet.daily_earnings + amount > wallet.daily_earning_limit:
            return jsonify({"error": "Daily earning limit exceeded"}), 400
        
        # Record balance before
        balance_before = wallet.sf_coins
        
        # Update wallet
        wallet.earn_sf_coins(amount)
        
        # Create transaction record
        transaction = WalletTransaction(
            wallet_id=wallet.id,
            user_id=user_id,
            transaction_type='earn',
            currency_type='sf_coins',
            amount=amount,
            balance_before=balance_before,
            balance_after=wallet.sf_coins,
            description=description
        )
        
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify({
            "message": "Coins earned successfully",
            "sf_coins": wallet.sf_coins,
            "daily_earnings": wallet.daily_earnings,
            "transaction_id": transaction.id
        }), 200
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route('/wallet/spend', methods=['POST'])
def spend_coins():
    """Spend SF Coins"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        amount = data.get('amount', 0)
        description = data.get('description', 'Spent coins')
        
        if not user_id or amount <= 0:
            return jsonify({"error": "Invalid user_id or amount"}), 400
        
        wallet = db.session.query(UserWallet).filter_by(user_id=user_id).first()
        if not wallet:
            return jsonify({"error": "Wallet not found"}), 404
        
        # Check sufficient balance
        if wallet.sf_coins < amount:
            return jsonify({"error": "Insufficient SF Coins"}), 400
        
        # Record balance before
        balance_before = wallet.sf_coins
        
        # Update wallet
        wallet.spend_sf_coins(amount)
        
        # Create transaction record
        transaction = WalletTransaction(
            wallet_id=wallet.id,
            user_id=user_id,
            transaction_type='spend',
            currency_type='sf_coins',
            amount=amount,
            balance_before=balance_before,
            balance_after=wallet.sf_coins,
            description=description
        )
        
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify({
            "message": "Coins spent successfully",
            "sf_coins": wallet.sf_coins,
            "transaction_id": transaction.id
        }), 200
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    

@app.route('/wallet/refund', methods=['POST'])
def refund_currency():
    """Refund currency"""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    user_id = data.get('user_id')
    currency_type = data.get('currency_type')
    amount = data.get('amount')
    reason = data.get('reason', 'Refund')
    
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    if not currency_type:
        return jsonify({"error": "currency_type is required"}), 400
    if not amount or amount <= 0:
        return jsonify({"error": "amount must be positive"}), 400
    if currency_type not in ['sf_coins', 'sf_crystals']:
        return jsonify({"error": "currency_type must be sf_coins or sf_crystals"}), 400
    
    try:
        wallet = UserWallet.query.filter_by(user_id=user_id).first()
        if not wallet:
            return jsonify({"error": "Wallet not found"}), 404
        
        if currency_type == 'sf_coins':
            wallet.refund_sf_coins(amount)
            new_balance = wallet.sf_coins_balance
        else:
            wallet.refund_sf_crystals(amount)
            new_balance = wallet.sf_crystals_balance
        
        db.session.commit()
        
        return jsonify({
            "message": f"Refunded {amount} {currency_type}",
            "new_balance": new_balance,
            "reason": reason
        }), 200
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
    
@app.route('/wallet/grant', methods=['POST'])
def grant_currency():
    """Admin: Grant currency to user"""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    user_id = data.get('user_id')
    currency_type = data.get('currency_type')
    amount = data.get('amount')
    description = data.get('description', 'Admin grant')
    
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    if not currency_type:
        return jsonify({"error": "currency_type is required"}), 400
    if not amount or amount <= 0:
        return jsonify({"error": "amount must be positive"}), 400
    if currency_type not in ['sf_coins', 'sf_crystals']:
        return jsonify({"error": "currency_type must be sf_coins or sf_crystals"}), 400
    
    try:
        wallet = UserWallet.query.filter_by(user_id=user_id).first()
        if not wallet:
            return jsonify({"error": "Wallet not found"}), 404
        
        if currency_type == 'sf_coins':
            wallet.sf_coins_balance += amount
            wallet.lifetime_earned += amount
            WalletTransaction.record_transaction(
                wallet_id=wallet.id,
                user_id=user_id,
                transaction_type="admin_grant",
                currency_type="sf_coins",
                amount=amount,
                balance_before=wallet.sf_coins_balance - amount,
                balance_after=wallet.sf_coins_balance,
                description=description
            )
            new_balance = wallet.sf_coins_balance
        else:
            wallet.add_sf_crystals(amount)
            new_balance = wallet.sf_crystals_balance
        
        db.session.commit()
        
        return jsonify({
            "message": f"Granted {amount} {currency_type}",
            "new_balance": new_balance
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
@app.route('/wallet/achievement', methods=['POST'])
def award_achievement():
    """Award achievement bonus"""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    user_id = data.get('user_id')
    amount = data.get('amount')
    achievement_name = data.get('achievement_name', 'Achievement')
    
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    if not amount or amount <= 0:
        return jsonify({"error": "amount must be positive"}), 400
    
    try:
        wallet = UserWallet.query.filter_by(user_id=user_id).first()
        if not wallet:
            return jsonify({"error": "Wallet not found"}), 404
        
        wallet.award_achievement_bonus(amount)
        db.session.commit()
        
        return jsonify({
            "message": f"Awarded {amount} SF Coins for {achievement_name}",
            "new_balance": wallet.sf_coins_balance
        }), 200
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
@app.route('/wallet/event-tokens/:user_id', methods=['GET'])
def get_event_tokens(user_id):
    """Get user's event token balances"""
    try:
        event_balances = EventTokenBalance.query.filter_by(user_id=user_id).all()
        
        if not event_balances:
            return jsonify({"message": "No event tokens found", "events": []}), 200
        
        events = []
        for eb in event_balances:
            events.append({
                "event_id": eb.event_id,
                "balance": eb.balance,
                "earned_total": eb.earned_total,
                "spent_total": eb.spent_total,
                "is_expired": eb.is_expired(),
                "expires_at": eb.expires_at.isoformat() if eb.expires_at else None
            })
        
        return jsonify({"user_id": user_id, "events": events}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/wallet/reset-daily/user_id', methods=['POST'])
def reset_daily_earnings(user_id):
    """Reset daily earnings counter"""
    try:
        wallet = UserWallet.query.filter_by(user_id=user_id).first()
        if not wallet:
            return jsonify({"error": "Wallet not found"}), 404
        
        wallet.update_daily_tracker()
        db.session.commit()
        
        return jsonify({
            "message": "Daily earnings reset",
            "daily_earnings": wallet.daily_earnings,
            "last_reset": wallet.last_earning_reset.isoformat()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ============================================================================
# VIRTUAL PRODUCT ENDPOINTS
# ============================================================================

@app.route('/products', methods=['GET'])
def list_products():
    """List all active virtual products"""
    try:
        products = VirtualProduct.find_active_products()
        
        return jsonify({
            "products": [
                {
                    "id": product.id,
                    "name": product.name,
                    "description": product.description,
                    "product_type": product.product_type,
                    "currency_type": product.currency_type,
                    "price": float(product.price),
                    "is_available": product.is_available(),
                    "stock_quantity": product.stock_quantity,
                    "icon_url": product.icon_url
                } for product in products
            ]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get product details"""
    try:
        product = VirtualProduct.find_by_id(product_id)
        if not product:
            return jsonify({"error": "Product not found"}), 404
        
        return jsonify({
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "product_type": product.product_type,
            "currency_type": product.currency_type,
            "price": float(product.price),
            "duration_days": product.duration_days,
            "consumable": product.consumable,
            "max_purchases": product.max_purchases,
            "stock_quantity": product.stock_quantity,
            "min_user_level": product.min_user_level,
            "is_active": product.is_active,
            "is_available": product.is_available(),
            "icon_url": product.icon_url,
            "preview_url": product.preview_url
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/products', methods=['POST'])
def create_product():
    """Create a new virtual product (admin endpoint)"""
    try:
        data = request.get_json()
        
        required_fields = ['name', 'product_type', 'currency_type', 'price']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        product = VirtualProduct(
            name=data['name'],
            description=data.get('description'),
            product_type=data['product_type'],
            currency_type=data['currency_type'],
            price=data['price'],
            duration_days=data.get('duration_days'),
            consumable=data.get('consumable', False),
            max_purchases=data.get('max_purchases'),
            stock_quantity=data.get('stock_quantity'),
            min_user_level=data.get('min_user_level', 1),
            icon_url=data.get('icon_url'),
            preview_url=data.get('preview_url')
        )
        
        product.save()
        
        return jsonify({
            "message": "Product created successfully",
            "product_id": product.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# ============================================================================
# PURCHASE ENDPOINTS
# ============================================================================

@app.route('/products/<int:product_id>/purchase', methods=['POST'])
def purchase_product(product_id):
    """Purchase a virtual product"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({"error": "user_id is required"}), 400
        
        # Get product
        product = VirtualProduct.find_by_id(product_id)
        if not product:
            return jsonify({"error": "Product not found"}), 404
        
        if not product.is_available():
            return jsonify({"error": "Product is not available"}), 400
        
        # Get user wallet
        wallet = db.session.query(UserWallet).filter_by(user_id=user_id).first()
        if not wallet:
            return jsonify({"error": "Wallet not found"}), 404
        
        # Check purchase limits
        if product.max_purchases:
            user_purchases = ProductPurchase.find_user_product_purchases(user_id, product_id)
            if len(user_purchases) >= product.max_purchases:
                return jsonify({"error": "Maximum purchase limit reached for this product"}), 400
        
        # Check wallet balance based on currency type
        price = int(product.price)
        currency_type = product.currency_type
        
        if currency_type == 'sf_coins':
            if wallet.sf_coins < price:
                return jsonify({"error": "Insufficient SF Coins"}), 400
            balance_before = wallet.sf_coins
            wallet.spend_sf_coins(price)
            balance_after = wallet.sf_coins
        elif currency_type == 'premium_gems':
            if wallet.premium_gems < price:
                return jsonify({"error": "Insufficient Premium Gems"}), 400
            balance_before = wallet.premium_gems
            wallet.spend_premium_gems(price)
            balance_after = wallet.premium_gems
        elif currency_type == 'event_tokens':
            if wallet.event_tokens < price:
                return jsonify({"error": "Insufficient Event Tokens"}), 400
            balance_before = wallet.event_tokens
            wallet.spend_event_tokens(price)
            balance_after = wallet.event_tokens
        else:
            return jsonify({"error": f"Unsupported currency type: {currency_type}"}), 400
        
        # Create wallet transaction
        transaction = WalletTransaction(
            wallet_id=wallet.id,
            user_id=user_id,
            transaction_type='purchase',
            currency_type=currency_type,
            amount=price,
            balance_before=balance_before,
            balance_after=balance_after,
            reference_type='product',
            reference_id=product_id,
            description=f"Purchased {product.name}"
        )
        db.session.add(transaction)
        db.session.flush()
        
        # Create purchase record
        expires_at = None
        if product.duration_days:
            expires_at = datetime.utcnow() + timedelta(days=product.duration_days)
        
        purchase = ProductPurchase(
            user_id=user_id,
            product_id=product_id,
            currency_type=currency_type,
            amount_paid=price,
            status='completed',
            expires_at=expires_at,
            transaction_id=transaction.id
        )
        db.session.add(purchase)
        db.session.flush()
        
        # Add to user inventory
        inventory_item = UserInventory(
            user_id=user_id,
            product_id=product_id,
            purchase_id=purchase.id,
            quantity=1,
            expires_at=expires_at
        )
        db.session.add(inventory_item)
        
        # Update stock if applicable
        if product.stock_quantity is not None:
            product.stock_quantity -= 1
        
        # Mark purchase as delivered
        purchase.deliver()
        
        db.session.commit()
        
        return jsonify({
            "message": "Product purchased successfully",
            "purchase_id": purchase.id,
            "transaction_id": transaction.id,
            "inventory_id": inventory_item.id,
            "remaining_balance": {
                currency_type: balance_after
            }
        }), 201
        
    except ValueError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route('/purchases/user_id', methods=['GET'])
def get_user_purchases(user_id):
    """Get user's purchase history"""
    try:
        purchases = ProductPurchase.find_by_user(user_id)
        
        return jsonify({
            "purchases": [
                {
                    "id": purchase.id,
                    "product_id": purchase.product_id,
                    "product_name": purchase.product.name if purchase.product else None,
                    "currency_type": purchase.currency_type,
                    "amount_paid": float(purchase.amount_paid),
                    "status": purchase.status,
                    "purchased_at": purchase.purchased_at.isoformat() if purchase.purchased_at else None,
                    "expires_at": purchase.expires_at.isoformat() if purchase.expires_at else None,
                    "is_active": purchase.is_active()
                } for purchase in purchases
            ]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============================================================================
# INVENTORY ENDPOINTS
# ============================================================================

@app.route('/inventory/user_id', methods=['GET'])
def get_user_inventory(user_id):
    """Get user's inventory"""
    try:
        inventory_items = UserInventory.find_by_user(user_id)
        
        return jsonify({
            "inventory": [
                {
                    "id": item.id,
                    "product_id": item.product_id,
                    "product_name": item.product.name if item.product else None,
                    "product_type": item.product.product_type if item.product else None,
                    "quantity": item.quantity,
                    "remaining_uses": item.remaining_uses,
                    "is_equipped": item.is_equipped,
                    "is_active": item.is_active,
                    "is_consumed": item.is_consumed,
                    "is_valid": item.is_valid(),
                    "acquired_at": item.acquired_at.isoformat() if item.acquired_at else None,
                    "expires_at": item.expires_at.isoformat() if item.expires_at else None
                } for item in inventory_items
            ]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/inventory/inventory_id/equip', methods=['POST'])
def equip_item(inventory_id):
    """Equip an inventory item"""
    try:
        item = UserInventory.find_by_id(inventory_id)
        if not item:
            return jsonify({"error": "Inventory item not found"}), 404
        
        if not item.is_valid():
            return jsonify({"error": "Item is not valid (expired or consumed)"}), 400
        
        item.equip()
        
        return jsonify({
            "message": "Item equipped successfully",
            "inventory_id": item.id,
            "is_equipped": item.is_equipped
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route('/inventory/inventory_id/unequip', methods=['POST'])
def unequip_item(inventory_id):
    """Unequip an inventory item"""
    try:
        item = UserInventory.find_by_id(inventory_id)
        if not item:
            return jsonify({"error": "Inventory item not found"}), 404
        
        item.unequip()
        
        return jsonify({
            "message": "Item unequipped successfully",
            "inventory_id": item.id,
            "is_equipped": item.is_equipped
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route('/inventory/inventory_id/use', methods=['POST'])
def use_consumable(inventory_id):
    """Use a consumable item"""
    try:
        data = request.get_json()
        amount = data.get('amount', 1)
        
        item = UserInventory.find_by_id(inventory_id)
        if not item:
            return jsonify({"error": "Inventory item not found"}), 404
        
        if not item.is_valid():
            return jsonify({"error": "Item is not valid (expired or consumed)"}), 400
        
        if not item.product.consumable:
            return jsonify({"error": "Item is not consumable"}), 400
        
        item.use_consumable(amount)
        
        return jsonify({
            "message": "Consumable used successfully",
            "inventory_id": item.id,
            "remaining_uses": item.remaining_uses,
            "quantity": item.quantity,
            "is_consumed": item.is_consumed
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# ============================================================================
# DATABASE INITIALIZATION
# ============================================================================

if __name__ == '__main__':
    with app.app_context():
        # Create all tables
        db.create_all()
        print("Database tables created!")
        
        # Create a default test user if none exists
        test_user = db.session.query(User).filter_by(username='testuser').first()
        if not test_user:
            test_user = User(username='testuser', email='test@example.com')
            db.session.add(test_user)
            db.session.flush()
            
            # Create wallet for test user with some initial balance
            test_wallet = UserWallet(
                user_id=test_user.id,
                sf_coins=12450,
                premium_gems=350,
                event_tokens=25,
                total_coins_earned=15000,
                total_coins_spent=2550,
                daily_earnings=450
            )
            db.session.add(test_wallet)
            print(f"Created test user with ID: {test_user.id}")
        
        """Create some sample products if none exist
        product_count = db.session.query(VirtualProduct).count()
            sample_products = [
                VirtualProduct(
                    name="Premium Sword Skin",
                    description="A legendary sword skin with particle effects",
                    product_type="cosmetic",
                    currency_type="premium_gems",
                    price=150,
                    consumable=False,
                    icon_url="/assets/sword_skin.png"
                ),
                VirtualProduct(
                    name="XP Booster",
                    description="Double XP for 24 hours",
                    product_type="booster",
                    currency_type="sf_coins",
                    price=500,
                    duration_days=1,
                    consumable=False,
                    icon_url="/assets/xp_booster.png"
                ),
                VirtualProduct(
                    name="Health Potion",
                    description="Restores 100 HP",
                    product_type="consumable",
                    currency_type="sf_coins",
                    price=50,
                    consumable=True,
                    icon_url="/assets/health_potion.png"
                ),
                VirtualProduct(
                    name="Premium Membership",
                    description="30 days of premium benefits",
                    product_type="subscription",
                    currency_type="premium_gems",
                    price=500,
                    duration_days=30,
                    max_purchases=1,
                    icon_url="/assets/premium.png"
                )
            ]
            
            for product in sample_products:
                db.session.add(product)
            
            print(f"Created {len(sample_products)} sample products")
        
        db.session.commit()
        print("Database initialization complete!")"""
    
    # Run the application
    app.run(debug=True, port=5001, host='0.0.0.0')
