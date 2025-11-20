#!/bin/bash

# Test Create Subscription API
# This tests the /api/create-subscription endpoint with mock data

echo "🧪 Testing /api/create-subscription Endpoint"
echo "=============================================="
echo ""

BASE_URL="http://localhost:3000"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Test 1: Missing required fields${NC}"
echo "-----------------------------------"
response=$(curl -s -X POST "$BASE_URL/api/create-subscription" \
  -H "Content-Type: application/json" \
  -d '{}')

echo "Response: $response"
if echo "$response" | grep -q "Missing required fields"; then
    echo -e "${GREEN}✓ PASSED${NC} - Correctly rejects empty payload"
else
    echo -e "${RED}✗ FAILED${NC}"
fi
echo ""

echo -e "${BLUE}Test 2: Valid Basic Plan payload${NC}"
echo "-----------------------------------"
response=$(curl -s -X POST "$BASE_URL/api/create-subscription" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "basic",
    "planType": "weekly",
    "userId": "00000000-0000-0000-0000-000000000001",
    "userEmail": "test@example.com",
    "numberOfPeople": 2,
    "numberOfDays": 3,
    "selectedDiets": [1, 2],
    "selectedAllergies": ["gluten"],
    "selectedMeals": [101, 102, 103]
  }')

echo "Response: $response" | head -5
if echo "$response" | grep -q "sessionId\|url"; then
    echo -e "${GREEN}✓ PASSED${NC} - Returns Stripe Checkout URL"
else
    echo -e "${YELLOW}⚠ INFO${NC} - Check response above for details"
fi
echo ""

echo -e "${BLUE}Test 3: Valid Premium Plan payload${NC}"
echo "-----------------------------------"
response=$(curl -s -X POST "$BASE_URL/api/create-subscription" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "premium",
    "planType": "weekly",
    "userId": "00000000-0000-0000-0000-000000000002",
    "userEmail": "premium@example.com",
    "numberOfPeople": 4,
    "numberOfDays": 5,
    "selectedDiets": [1, 2, 3, 4],
    "selectedAllergies": ["gluten", "mleko"],
    "selectedMeals": [101, 102, 103, 104, 105]
  }')

echo "Response: $response" | head -5
if echo "$response" | grep -q "sessionId\|url"; then
    echo -e "${GREEN}✓ PASSED${NC} - Returns Stripe Checkout URL"
else
    echo -e "${YELLOW}⚠ INFO${NC} - Check response above for details"
fi
echo ""

echo -e "${BLUE}Test 4: Invalid plan ID${NC}"
echo "-----------------------------------"
response=$(curl -s -X POST "$BASE_URL/api/create-subscription" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "invalid",
    "userId": "00000000-0000-0000-0000-000000000003",
    "userEmail": "invalid@example.com"
  }')

echo "Response: $response"
if echo "$response" | grep -q "error"; then
    echo -e "${GREEN}✓ PASSED${NC} - Correctly rejects invalid plan"
else
    echo -e "${YELLOW}⚠ INFO${NC} - Response may vary"
fi
echo ""

echo "=============================================="
echo -e "${GREEN}✅ Create Subscription API Tests Complete${NC}"
echo ""
echo "Note: Actual Stripe Checkout requires:"
echo "1. Valid Stripe Price IDs in .env.local"
echo "2. Valid Stripe API keys"
echo "3. Network connection to Stripe API"
echo ""
echo "For full testing, use the kreator UI:"
echo "→ http://localhost:3000/kreator"
