#!/bin/bash
echo "Creating a test user API call..."
echo ""
echo "Run this to create a test user:"
echo ""
echo 'curl -X POST https://true-north-website-v2-cni8.vercel.app/api/auth/register \\'
echo '  -H "Content-Type: application/json" \\'
echo '  -d '"'"'{"email":"test@truenorth.me","password":"TestPass123!","name":"Test User"}'"'"' \\'
echo '  -v'
echo ""
echo "This will create a test account you can login with"
