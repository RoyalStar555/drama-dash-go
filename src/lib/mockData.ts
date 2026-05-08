// High-quality mock data fallbacks for StoryHub.
// Used when external APIs (TMDB / Jikan / Open Library) are unreachable so
// the home page always feels full and professional.

import { MediaItem, PLACEHOLDER } from "./api";

const tmdbImg = (path: string) => `https://image.tmdb.org/t/p/w500${path}`;
const tmdbBackdrop = (path: string) =>
  `https://image.tmdb.org/t/p/w1280${path}`;

export const MOCK_MOVIES: MediaItem[] = [
  {
    id: "mock-movie-1",
    category: "movie",
    title: "Dune: Part Two",
    poster: tmdbImg("/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg"),
    backdrop: tmdbBackdrop("/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg"),
    year: "2024",
    overview:
      "Paul Atreides unites with the Fremen to wage war against House Harkonnen.",
    rating: 8.3,
    originalLanguage: "en",
  },
  {
    id: "mock-movie-2",
    category: "movie",
    title: "Oppenheimer",
    poster: tmdbImg("/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg"),
    backdrop: tmdbBackdrop("/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg"),
    year: "2023",
    overview:
      "The story of J. Robert Oppenheimer's role in the development of the atomic bomb.",
    rating: 8.1,
    originalLanguage: "en",
  },
  {
    id: "mock-movie-3",
    category: "movie",
    title: "Interstellar",
    poster: tmdbImg("/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"),
    backdrop: tmdbBackdrop("/xJHokMbljvjADYdit5fK5VQsXEG.jpg"),
    year: "2014",
    overview:
      "A team of explorers travels through a wormhole in space to ensure humanity's survival.",
    rating: 8.4,
    originalLanguage: "en",
  },
  {
    id: "mock-movie-4",
    category: "movie",
    title: "The Batman",
    poster: tmdbImg("/74xTEgt7R36Fpooo50r9T25onhq.jpg"),
    backdrop: tmdbBackdrop("/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg"),
    year: "2022",
    overview:
      "Batman ventures into Gotham City's underworld to unmask the Riddler.",
    rating: 7.7,
    originalLanguage: "en",
  },
  {
    id: "mock-movie-5",
    category: "movie",
    title: "Spider-Man: Across the Spider-Verse",
    poster: tmdbImg("/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg"),
    year: "2023",
    overview:
      "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People.",
    rating: 8.6,
    originalLanguage: "en",
  },
  {
    id: "mock-movie-6",
    category: "movie",
    title: "Everything Everywhere All at Once",
    poster: tmdbImg("/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg"),
    year: "2022",
    overview:
      "A middle-aged Chinese immigrant is swept up in an insane adventure across the multiverse.",
    rating: 8.0,
    originalLanguage: "en",
  },
];

// ---- Regional Indian mock pools --------------------------------------------
// Used as language-correct fallbacks when TMDB is unreachable so Bollywood/
// Tamil/Telugu rows never leak Hollywood content.
export const MOCK_BOLLYWOOD: MediaItem[] = [
  {
    id: "mock-bolly-1", category: "movie", title: "3 Idiots",
    poster: tmdbImg("/66A9MqXOyVFCssoloscw79z8Tew.jpg"),
    year: "2009", rating: 8.4, originalLanguage: "hi",
    overview: "Two friends search for their long-lost college buddy who inspired them to think creatively.",
  },
  {
    id: "mock-bolly-2", category: "movie", title: "Dangal",
    poster: tmdbImg("/cOEhWdcSm1ojIdb6CksCmF6lOQa.jpg"),
    year: "2016", rating: 8.3, originalLanguage: "hi",
    overview: "A former wrestler trains his daughters to become world-class wrestlers.",
  },
  {
    id: "mock-bolly-3", category: "movie", title: "Lagaan",
    poster: tmdbImg("/3ITyHN9fiHU2tXrTiXbW6QONpyF.jpg"),
    year: "2001", rating: 8.1, originalLanguage: "hi",
    overview: "Villagers stake their lives on a cricket match against their colonial rulers.",
  },
  {
    id: "mock-bolly-4", category: "movie", title: "Gully Boy",
    poster: tmdbImg("/2bYNuPzfzgvHUlk7kjnYQ9AMnmB.jpg"),
    year: "2019", rating: 7.9, originalLanguage: "hi",
    overview: "A street rapper from Mumbai's slums chases his dreams of hip-hop stardom.",
  },
  {
    id: "mock-bolly-5", category: "movie", title: "Andhadhun",
    poster: tmdbImg("/2hG6Vts2ufFijKOqB0kImsqmKu7.jpg"),
    year: "2018", rating: 8.2, originalLanguage: "hi",
    overview: "A blind pianist becomes entangled in a murder mystery.",
  },
  {
    id: "mock-bolly-6", category: "movie", title: "Zindagi Na Milegi Dobara",
    poster: tmdbImg("/52AfXWuXCHn3UjD17rBruA9f5qb.jpg"),
    year: "2011", rating: 8.0, originalLanguage: "hi",
    overview: "Three friends embark on a bachelor road trip across Spain that changes their lives.",
  },
];

export const MOCK_TAMIL: MediaItem[] = [
  {
    id: "mock-tamil-1", category: "movie", title: "Vikram",
    poster: tmdbImg("/qigfgT8B8LtXrN3NAhkYEoTaJlx.jpg"),
    year: "2022", rating: 8.4, originalLanguage: "ta",
    overview: "A special agent investigates a series of murders by a masked vigilante group.",
  },
  {
    id: "mock-tamil-2", category: "movie", title: "Kaithi",
    poster: tmdbImg("/2tBjzwpCk87R6P4hmcPwM4cz6Bi.jpg"),
    year: "2019", rating: 8.5, originalLanguage: "ta",
    overview: "An ex-convict races against time to deliver injured officers to safety.",
  },
  {
    id: "mock-tamil-3", category: "movie", title: "Jai Bhim",
    poster: tmdbImg("/7TpUcXgto5Z69e1cjoCdQ3HWnvE.jpg"),
    year: "2021", rating: 8.7, originalLanguage: "ta",
    overview: "A lawyer fights for justice for a tribal woman whose husband is wrongfully arrested.",
  },
  {
    id: "mock-tamil-4", category: "movie", title: "Soorarai Pottru",
    poster: tmdbImg("/zQNWQiEulCLrWDLNxPa8wSI6wpY.jpg"),
    year: "2020", rating: 8.6, originalLanguage: "ta",
    overview: "A man from a small village dreams of launching a low-cost airline.",
  },
  {
    id: "mock-tamil-5", category: "movie", title: "Master",
    poster: tmdbImg("/qzA87Wf4jnIhLcDqtHJlzKNcCcZ.jpg"),
    year: "2021", rating: 7.4, originalLanguage: "ta",
    overview: "An alcoholic professor is sent to a juvenile school where he confronts a ruthless gangster.",
  },
  {
    id: "mock-tamil-6", category: "movie", title: "96",
    poster: tmdbImg("/7Eq7mJKv5qYrEfgQYQEgL8cLQDH.jpg"),
    year: "2018", rating: 8.5, originalLanguage: "ta",
    overview: "Schoolmates reunite after 22 years and revisit their unfinished love story.",
  },
];

export const MOCK_TELUGU: MediaItem[] = [
  {
    id: "mock-tel-1", category: "movie", title: "RRR",
    poster: tmdbImg("/nEufeZlyAOLqO2brrs0yeF1lgXO.jpg"),
    year: "2022", rating: 7.9, originalLanguage: "te",
    overview: "Two revolutionaries fight against the British Raj in 1920s India.",
  },
  {
    id: "mock-tel-2", category: "movie", title: "Baahubali: The Beginning",
    poster: tmdbImg("/ssqr5BzcUlpoYTsjwSXkE8KRZGm.jpg"),
    year: "2015", rating: 8.0, originalLanguage: "te",
    overview: "An adventurous young man sets out to discover the truth about his lineage.",
  },
  {
    id: "mock-tel-3", category: "movie", title: "Pushpa: The Rise",
    poster: tmdbImg("/pf2ttO2gbARZHc3hFKfXdkbiCbt.jpg"),
    year: "2021", rating: 7.6, originalLanguage: "te",
    overview: "A coolie rises in the world of red sandalwood smuggling in the Seshachalam forests.",
  },
  {
    id: "mock-tel-4", category: "movie", title: "Eega",
    poster: tmdbImg("/qIv9Bv1XgQhAvw6ZnOwGFlRpr6r.jpg"),
    year: "2012", rating: 7.7, originalLanguage: "te",
    overview: "A murdered man is reincarnated as a housefly and seeks revenge on his killer.",
  },
  {
    id: "mock-tel-5", category: "movie", title: "Arjun Reddy",
    poster: tmdbImg("/fAiRD1zxJ0XSHZWXSc4aSXKcSDa.jpg"),
    year: "2017", rating: 8.0, originalLanguage: "te",
    overview: "A short-tempered surgeon spirals after losing the love of his life.",
  },
  {
    id: "mock-tel-6", category: "movie", title: "Magadheera",
    poster: tmdbImg("/4MpcU2pJqSsMpVZG3bI3ZspGhVQ.jpg"),
    year: "2009", rating: 7.5, originalLanguage: "te",
    overview: "A reincarnated warrior must protect his beloved across two lifetimes.",
  },
];

export const MOCK_INDIAN_MIX: MediaItem[] = [
  ...MOCK_BOLLYWOOD.slice(0, 2),
  ...MOCK_TAMIL.slice(0, 2),
  ...MOCK_TELUGU.slice(0, 2),
];

export const MOCK_INDIAN_BY_LANG: Record<string, MediaItem[]> = {
  hi: MOCK_BOLLYWOOD,
  ta: MOCK_TAMIL,
  te: MOCK_TELUGU,
};

export const MOCK_DRAMAS: MediaItem[] = [
  {
    id: "mock-drama-1",
    category: "drama",
    title: "Squid Game",
    poster: tmdbImg("/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg"),
    backdrop: tmdbBackdrop("/qw3J9cNeLioOLoR68WX7z79aCdK.jpg"),
    year: "2021",
    overview:
      "Hundreds of cash-strapped players accept a strange invitation to compete in children's games for a tempting prize.",
    rating: 7.8,
  },
  {
    id: "mock-drama-2",
    category: "drama",
    title: "Crash Landing on You",
    poster: tmdbImg("/q7Eb0XUfJbIIXxV0YkbqCVnWZ0i.jpg"),
    year: "2019",
    overview:
      "A South Korean heiress crash-lands in North Korea and meets a stoic army officer.",
    rating: 8.7,
  },
  {
    id: "mock-drama-3",
    category: "drama",
    title: "Goblin",
    poster: tmdbImg("/4mMK7zlGfqv5ZsnyV4noLrW0g0V.jpg"),
    year: "2016",
    overview:
      "A modern-day goblin seeks his bride to end his immortal life.",
    rating: 8.6,
  },
  {
    id: "mock-drama-4",
    category: "drama",
    title: "Itaewon Class",
    poster: tmdbImg("/2cNUJ3RM1gAcQhkmHoTCpIFwTLb.jpg"),
    year: "2020",
    overview:
      "Ex-cons open a bar-restaurant in Itaewon and chase their dreams against all odds.",
    rating: 8.2,
  },
  {
    id: "mock-drama-5",
    category: "drama",
    title: "Vincenzo",
    poster: tmdbImg("/dvXJgEDQXhL9Ouot2WkBHpQiHGd.jpg"),
    backdrop: tmdbBackdrop("/n8PbT0SpsaCsFcr3wkEbaqLqqsA.jpg"),
    year: "2021",
    overview:
      "A Korean-Italian mafia lawyer returns to Seoul and takes on a mighty conglomerate.",
    rating: 8.4,
  },
  {
    id: "mock-drama-6",
    category: "drama",
    title: "My Demon",
    poster: tmdbImg("/8XJ8aBTeFvaZTwPK5pInAcxOW7p.jpg"),
    year: "2023",
    overview:
      "A heartless heiress strikes a contract marriage with a charming demon who's lost his powers.",
    rating: 8.0,
  },
];

export const MOCK_ANIME: MediaItem[] = [
  {
    id: "mock-anime-1",
    category: "anime",
    title: "Attack on Titan",
    poster:
      "https://cdn.myanimelist.net/images/anime/10/47347l.jpg",
    year: "2013",
    overview:
      "Humans live within enormous walled cities to protect themselves from giant humanoid Titans.",
    rating: 9.0,
    trailerQuery: "Attack on Titan trailer",
  },
  {
    id: "mock-anime-2",
    category: "anime",
    title: "Demon Slayer",
    poster:
      "https://cdn.myanimelist.net/images/anime/1286/99889l.jpg",
    year: "2019",
    overview:
      "A kind-hearted boy becomes a demon slayer after his family is slaughtered and his sister turned into a demon.",
    rating: 8.5,
    trailerQuery: "Demon Slayer trailer",
  },
  {
    id: "mock-anime-3",
    category: "anime",
    title: "Jujutsu Kaisen",
    poster:
      "https://cdn.myanimelist.net/images/anime/1171/109222l.jpg",
    year: "2020",
    overview:
      "A boy swallows a cursed talisman and becomes host to a powerful curse, joining sorcerers to fight evil.",
    rating: 8.6,
    trailerQuery: "Jujutsu Kaisen trailer",
  },
  {
    id: "mock-anime-4",
    category: "anime",
    title: "Frieren: Beyond Journey's End",
    poster:
      "https://cdn.myanimelist.net/images/anime/1015/138006l.jpg",
    year: "2023",
    overview:
      "An elven mage reflects on her past adventures with the now-deceased heroes she once journeyed with.",
    rating: 9.3,
    trailerQuery: "Frieren trailer",
  },
  {
    id: "mock-anime-5",
    category: "anime",
    title: "Spy x Family",
    poster:
      "https://cdn.myanimelist.net/images/anime/1441/122795l.jpg",
    year: "2022",
    overview:
      "A spy must build a fake family to execute a mission — unaware his wife is an assassin and his daughter a telepath.",
    rating: 8.5,
    trailerQuery: "Spy x Family trailer",
  },
  {
    id: "mock-anime-6",
    category: "anime",
    title: "Chainsaw Man",
    poster:
      "https://cdn.myanimelist.net/images/anime/1806/126216l.jpg",
    year: "2022",
    overview:
      "A young devil-hunter merges with his chainsaw devil pet to become a hybrid hero.",
    rating: 8.5,
    trailerQuery: "Chainsaw Man trailer",
  },
];

export const MOCK_MANGA: MediaItem[] = [
  {
    id: "mock-manga-1",
    category: "manga",
    title: "One Piece",
    poster:
      "https://cdn.myanimelist.net/images/manga/2/253146l.jpg",
    year: "1997",
    overview:
      "Monkey D. Luffy sails the Grand Line in search of the legendary One Piece treasure.",
    rating: 9.2,
  },
  {
    id: "mock-manga-2",
    category: "manga",
    title: "Berserk",
    poster:
      "https://cdn.myanimelist.net/images/manga/1/157897l.jpg",
    year: "1989",
    overview:
      "Guts, a lone mercenary, embarks on a brutal quest for vengeance in a dark medieval world.",
    rating: 9.4,
  },
  {
    id: "mock-manga-3",
    category: "manga",
    title: "Vagabond",
    poster:
      "https://cdn.myanimelist.net/images/manga/1/259070l.jpg",
    year: "1998",
    overview:
      "A retelling of the life of legendary Japanese swordsman Miyamoto Musashi.",
    rating: 9.1,
  },
  {
    id: "mock-manga-4",
    category: "manga",
    title: "Vinland Saga",
    poster:
      "https://cdn.myanimelist.net/images/manga/2/188925l.jpg",
    year: "2005",
    overview:
      "Thorfinn pursues revenge against the man who killed his father in the Viking age.",
    rating: 9.0,
  },
  {
    id: "mock-manga-5",
    category: "manga",
    title: "Chainsaw Man",
    poster:
      "https://cdn.myanimelist.net/images/manga/3/216464l.jpg",
    year: "2018",
    overview:
      "Denji becomes a devil-human hybrid hunter for a shadowy government agency.",
    rating: 8.6,
  },
  {
    id: "mock-manga-6",
    category: "manga",
    title: "Solo Leveling",
    poster:
      "https://cdn.myanimelist.net/images/manga/2/222295l.jpg",
    year: "2018",
    overview:
      "The weakest hunter in the world receives a mysterious quest log that lets him level up endlessly.",
    rating: 8.8,
  },
];

export const MOCK_BOOKS: MediaItem[] = [
  {
    id: "mock-book-1",
    category: "book",
    title: "The Hobbit",
    poster: "https://covers.openlibrary.org/b/id/12003830-L.jpg",
    year: "1937",
    overview: "By J.R.R. Tolkien",
    rating: 4.7,
    externalUrl: "https://openlibrary.org/works/OL262758W/The_Hobbit",
  },
  {
    id: "mock-book-2",
    category: "book",
    title: "Project Hail Mary",
    poster: "https://covers.openlibrary.org/b/id/10523438-L.jpg",
    year: "2021",
    overview: "By Andy Weir",
    rating: 4.5,
  },
  {
    id: "mock-book-3",
    category: "book",
    title: "Dune",
    poster: "https://covers.openlibrary.org/b/id/12749540-L.jpg",
    year: "1965",
    overview: "By Frank Herbert",
    rating: 4.6,
  },
  {
    id: "mock-book-4",
    category: "book",
    title: "The Name of the Wind",
    poster: "https://covers.openlibrary.org/b/id/8281996-L.jpg",
    year: "2007",
    overview: "By Patrick Rothfuss",
    rating: 4.6,
  },
  {
    id: "mock-book-5",
    category: "book",
    title: "Mistborn: The Final Empire",
    poster: "https://covers.openlibrary.org/b/id/10421000-L.jpg",
    year: "2006",
    overview: "By Brandon Sanderson",
    rating: 4.7,
  },
  {
    id: "mock-book-6",
    category: "book",
    title: "1984",
    poster: "https://covers.openlibrary.org/b/id/7222246-L.jpg",
    year: "1949",
    overview: "By George Orwell",
    rating: 4.5,
  },
];

export const MOCK_BY_CATEGORY = {
  movie: MOCK_MOVIES,
  drama: MOCK_DRAMAS,
  anime: MOCK_ANIME,
  manga: MOCK_MANGA,
  book: MOCK_BOOKS,
} as const;

// Ensure poster fallback safety
for (const list of Object.values(MOCK_BY_CATEGORY)) {
  for (const it of list) if (!it.poster) it.poster = PLACEHOLDER;
}
