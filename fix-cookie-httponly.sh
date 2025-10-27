#!/bin/bash

# Fix the login API to make cookie readable by JavaScript
cat > temp_fix.js << 'TEMP_EOF'
const fs = require('fs');
const file = 'app/api/auth/login/route.js';
let content = fs.readFileSync(file, 'utf8');

// Replace httpOnly: true with httpOnly: false
content = content.replace(
  'httpOnly: true,',
  'httpOnly: false, // Allow client-side access for auth check'
);

fs.writeFileSync(file, content);
console.log('✅ Fixed cookie httpOnly setting');
TEMP_EOF

node temp_fix.js
rm temp_fix.js

git add app/api/auth/login/route.js
git commit -m "Fix: Make auth_token cookie readable by client for auth checks"
git push origin main

echo "✅ Cookie will now be readable by JavaScript"
echo "⏳ Wait 1-2 minutes for Vercel deployment"
