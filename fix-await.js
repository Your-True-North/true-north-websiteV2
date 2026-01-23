const fs = require('fs');
const filePath = './app/(protected)/journey/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Remove the await from the inline call
content = content.replace(
  /if \(token\) \{\s+setAuthToken\(token\)\s+await loadLikesFromDatabase\(token\)\s+\}/,
  `if (token) {
          setAuthToken(token)
          loadLikesFromDatabase(token)
        }`
);

fs.writeFileSync(filePath, content);
console.log('Fixed await issue!');
