const fs = require('fs');
const filePath = './app/(protected)/journey/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Remove the broken await section (lines ~140-160)
content = content.replace(/\/\/ Load likes from database and comments from localStorage[\s\S]*?catch \(err\) \{[\s\S]*?console\.error\('\[Journey\] Failed to load user data:', err\)[\s\S]*?\}/m, 
  `// Load comments from localStorage
      try {
        const savedComments = localStorage.getItem('videoComments')
        if (savedComments) setVideoComments(JSON.parse(savedComments))
      } catch (err) {
        console.error('[Journey] Failed to load comments:', err)
      }`
);

fs.writeFileSync(filePath, content);
console.log('Fixed!');
