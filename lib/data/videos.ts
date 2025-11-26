export interface Video {
  id: string
  title: string
  url: string
  embedUrl: string
  category: string
  description?: string
}

export const videos: Video[] = [
  {
    id: '1',
    title: 'The Beginning',
    url: 'https://www.youtube.com/watch?v=L7Pk4xNO63U',
    embedUrl: 'https://www.youtube-nocookie.com/embed/L7Pk4xNO63U?modestbranding=1&rel=0&showinfo=0&controls=1',
    category: 'Foundations',
    description: 'Where your journey begins'
  }
]

export const getVideosByCategory = (category: string) => {
  return videos.filter(v => v.category === category)
}
