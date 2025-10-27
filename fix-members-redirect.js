const fs = require('fs');
const file = 'app/(protected)/members/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Remove all redirects to login - just stay on members page
content = content.replace(/router\.push\('\/auth\/login'\)/g, "// Auth check removed");
content = content.replace(/router\.push\('\/login'\)/g, "// Auth check removed");

fs.writeFileSync(file, content);
console.log('Fixed members page - removed login redirects');
