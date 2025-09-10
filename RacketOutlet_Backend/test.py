import os
from dotenv import load_dotenv
import razorpay

# Load .env
load_dotenv()
RAZORPAY_KEY_ID = os.getenv('RAZORPAY_KEY_ID')
RAZORPAY_KEY_SECRET = os.getenv('RAZORPAY_KEY_SECRET')

# Initialize client
client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

# Test: Create a dummy order
try:
    order_data = {
        "amount": 100,  # ₹1.00
        "currency": "INR",
        "receipt": "test_receipt_001",
        "payment_capture": 1
    }
    order = client.order.create(data=order_data)
    print("✅ Test order created successfully:")
    print(order)
except Exception as e:
    print("❌ Failed to create order:", e)
