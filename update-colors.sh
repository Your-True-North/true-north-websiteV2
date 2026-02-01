#!/bin/bash

# Navigate to project directory
cd ~/truenorth-final

echo "Starting color palette update..."
echo "================================"

# Journey page
echo "📝 Updating Journey page..."
cp "app/(protected)/journey/page.tsx" "app/(protected)/journey/page.tsx.backup"

sed -i '' 's/#0a0a0a/#fafafa/g; s/#0a0a0b/#ffffff/g; s/#9bc4b8/#e67e22/g' "app/(protected)/journey/page.tsx"

# Members page  
echo "📝 Updating Members page..."
cp "app/(protected)/members/page.tsx" "app/(protected)/members/page.tsx.backup"

sed -i '' 's/#0a0a0a/#fafafa/g; s/#0a0a0b/#ffffff/g; s/#9bc4b8/#e67e22/g' "app/(protected)/members/page.tsx"

# Calls page
echo "📝 Updating Calls page..."
cp "app/(protected)/calls/page.tsx" "app/(protected)/calls/page.tsx.backup"

sed -i '' 's/#0a0a0a/#fafafa/g; s/#9bc4b8/#e67e22/g' "app/(protected)/calls/page.tsx"

# Replays page
echo "📝 Updating Replays page..."
cp "app/(protected)/replays/page.tsx" "app/(protected)/replays/page.tsx.backup"

sed -i '' 's/#0a0a0a/#fafafa/g; s/#9bc4b8/#e67e22/g' "app/(protected)/replays/page.tsx"

echo "================================"
echo "✅ Color palette update complete!"
echo ""
echo "Backups created with .backup extension"
