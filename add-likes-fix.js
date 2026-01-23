const fs = require('fs');
const filePath = './app/(protected)/journey/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Change videoLikes state from object to array
content = content.replace(
  /const \[videoLikes, setVideoLikes\] = useState\(\{\}\)/,
  `const [videoLikes, setVideoLikes] = useState<string[]>([])
  const [authToken, setAuthToken] = useState<string | null>(null)`
);

// Add loadLikesFromDatabase function before the useEffect
const loadLikesFunc = `
  const loadLikesFromDatabase = async (token: string) => {
    try {
      const res = await fetch('/api/reactions', {
        headers: { 'Authorization': \`Bearer \${token}\` }
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.likes) {
          setVideoLikes(data.likes)
        }
      }
    } catch (error) {
      console.error('Failed to load likes from database:', error)
    }
  }

  `;

content = content.replace(
  /(const checkAuth = async \(\) => {)/,
  loadLikesFunc + '$1'
);

// Add token fetching and loadLikes call after setUser
content = content.replace(
  /(logger\.debug\('Journey', 'User authenticated', parsedUser\.email\)\s+setUser\(parsedUser\))/,
  `$1

        const token = localStorage.getItem('auth_token') || document.cookie
          .split('; ')
          .find(row => row.startsWith('auth_token='))
          ?.split('=')[1]

        if (token) {
          setAuthToken(token)
          await loadLikesFromDatabase(token)
        }`
);

// Fix handleLikeVideo to use database
const newHandleLike = `
  const handleLikeVideo = async (videoId: string) => {
    if (!authToken) return

    const wasLiked = videoLikes.includes(videoId)
    
    if (wasLiked) {
      setVideoLikes(videoLikes.filter(id => id !== videoId))
    } else {
      setVideoLikes([...videoLikes, videoId])
    }

    try {
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${authToken}\`
        },
        body: JSON.stringify({ videoId, type: 'like' })
      })

      if (!res.ok) {
        if (wasLiked) {
          setVideoLikes([...videoLikes, videoId])
        } else {
          setVideoLikes(videoLikes.filter(id => id !== videoId))
        }
      }
    } catch (error) {
      console.error('Failed to toggle like:', error)
      if (wasLiked) {
        setVideoLikes([...videoLikes, videoId])
      } else {
        setVideoLikes(videoLikes.filter(id => id !== videoId))
      }
    }
  }`;

content = content.replace(
  /const handleLikeVideo = \(videoId\) => \{[\s\S]*?\n  \}/m,
  newHandleLike
);

// Fix getVideoLikesCount
content = content.replace(
  /return baseLikes \+ \(videoLikes\[videoId\] \? 1 : 0\)/,
  'return baseLikes + (videoLikes.includes(videoId) ? 1 : 0)'
);

// Fix like button checks
content = content.replace(
  /videoLikes\[selectedVideo\.id\]/g,
  'videoLikes.includes(selectedVideo.id)'
);

fs.writeFileSync(filePath, content);
console.log('Added database persistence!');
