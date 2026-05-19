import { gameSchema } from "./schemas";

export const games = [
  {
    title: "Descent Into Madness",
    slug: "descent-into-madness",
    engine: "TBD",
    year: "TBD",
    status: "placeholder",
    pitch:
      "Draft: atmospheric game-development archive entry. Replace with final gameplay loop, engine, and media.",
    role: "TBD: final design, programming, and art role details pending.",
    notes: [
      "MEDIA TBD: gameplay poster and capture pending.",
      "TBD: final systems notes and prototype scope.",
      "Coming soon: design breakdown and build status.",
    ],
  },
  {
    title: "PUBG Unreal Study",
    slug: "pubg-unreal",
    engine: "Unreal Engine",
    year: "TBD",
    status: "draft",
    pitch:
      "Draft: Unreal-focused study lane for gameplay systems, map logic, or technical experiments.",
    role: "TBD: final scope pending.",
    notes: [
      "Placeholder screenshot set required.",
      "TBD: replace with final implementation notes.",
      "No public claims until scope is verified.",
    ],
  },
  {
    title: "LAST KERNEL",
    slug: "last-kernel",
    engine: "TBD",
    year: "TBD",
    status: "coming-soon",
    pitch:
      "Coming soon: reserved archive lane. Replace with final description only when ready.",
    role: "TBD",
    notes: [
      "Crossover concept TBD.",
      "Media and design notes pending.",
      "Keep lightweight until the main site is stable.",
    ],
  },
].map((game) => gameSchema.parse(game));

export function getGame(slug: string) {
  return games.find((game) => game.slug === slug);
}
