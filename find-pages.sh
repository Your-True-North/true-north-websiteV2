#!/bin/bash
echo "=== ALL PAGES IN YOUR APP ==="
find app -name "page.tsx" -o -name "page.js" | grep -v node_modules | sort
echo ""
echo "=== CHECKING IF MEMBERS PAGE EXISTS ==="
ls -la app/members/ 2>&1 || echo "No members directory"
echo ""
echo "=== CHECKING ACTUAL FOLDER STRUCTURE ==="
ls -la app/ | grep -v node_modules
