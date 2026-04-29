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
  },
  {
    id: "mock-movie-5",
    category: "movie",
    title: "Spider-Man: Across the Spider-Verse",
    poster: tmdbImg("/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg"),
    backdrop: tmdbBackdrop("/4HodYYKEIsGOdinkGi2Ucfxm/lDsI.jpg"),
    year: "2023",
    overview:
      "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People.",
    rating: 8.6,
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
  },
];

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
