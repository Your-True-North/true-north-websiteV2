#!/bin/bash
echo "Testing login API directly..."
echo ""
echo "Run this command to test login:"
echo ""
echo 'curl -X POST https://true-north-website-v2-cni8.vercel.app/api/auth/login \\'
echo '  -H "Content-Type: application/json" \\'
echo '  -d '"'"'{"email":"Navigate@yourtruenorth.me","password":"YOUR_PASSWORD_HERE"}'"'"' \\'
echo '  -v'
echo ""
echo "Replace YOUR_PASSWORD_HERE with your actual password"
echo "The -v flag will show the response headers including any Set-Cookie headers"
