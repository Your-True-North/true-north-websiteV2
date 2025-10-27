#!/bin/bash

# Find and replace dashboard with members in all files
find app -type f \( -name "*.tsx" -o -name "*.jsx" -o -name "*.ts" -o -name "*.js" \) -exec sed -i '' 's|/dashboard|/members|g' {} +

echo "Fixed all dashboard links to point to /members"
