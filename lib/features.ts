// One switch for the member area. Everything below is off but still in the
// code. Set a flag to true to bring that feature back.
export const features = {
  // Pages. While off, they redirect to /members (see middleware.ts).
  communityPage: false,   // /community
  aboutPage: false,       // /about-cor
  astrologyPage: false,   // /astrology
  journeyPage: false,     // /journey
  replaysPage: false,     // /replays (replays live inside /calls)

  // Home (/members)
  legacyHome: false,         // the old home: welcome header, coaching card, bento grid, account panel
  homeJourneyTracker: false, // dedication path tracker
  homeStats: false,          // videos watched, time invested, completion
  homeSpacesPanel: false,
  homeActiveNowPanel: false, // "7 online"
  pushPrompt: false,
  installBanner: false,
  progressLevels: false,     // calls to /api/progress/calculate and /api/milestones

  // Video player
  videoComments: false,
  videoReactions: false,

  // Navigation: the old sidebar with the bell, More sheet, badges, Resources and About
  legacyNav: false,
}

// Member routes that redirect to /members while their flag is off.
export const hiddenRoutes: Record<string, boolean> = {
  '/community': features.communityPage,
  '/about-cor': features.aboutPage,
  '/astrology': features.astrologyPage,
  '/journey': features.journeyPage,
  '/replays': features.replaysPage,
}
