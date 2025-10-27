#!/bin/bash
echo "=== CHECKING FOR CLIENT-SIDE REDIRECTS IN LOGIN PAGE ==="
grep -n "window.location\|router.push\|router.replace\|redirect" app/\(auth\)/auth/login/page.tsx
echo ""
echo "=== CHECKING useEffect HOOKS (what runs on page load) ==="
grep -A 10 "useEffect" app/\(auth\)/auth/login/page.tsx
echo ""
echo "=== CHECKING IF THERE'S A JOURNEY PAGE THAT REDIRECTS BACK ==="
if [ -f "app/journey/page.tsx" ]; then
  echo "Journey page exists, checking for redirects:"
  grep -n "redirect\|window.location\|router" app/journey/page.tsx | head -20
elif [ -f "app/journey/page.js" ]; then
  echo "Journey page exists, checking for redirects:"
  grep -n "redirect\|window.location\|router" app/journey/page.js | head -20
else
  echo "No journey page found"
fi
