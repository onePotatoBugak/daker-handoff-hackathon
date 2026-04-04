import { HACKATHONS, HACKATHON_DETAILS, SEED_LEADERBOARDS, SEED_TEAMS, ALL_POSITIONS } from './data';
import { getTeams, getLocalLeaderboardEntries } from './storage';
import type { Hackathon, HackathonDetail, Leaderboard, Team } from './types';
import type { LocalLeaderboardEntry } from './storage';

const DELAY = 500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchHackathons(): Promise<Hackathon[]> {
  await sleep(DELAY);
  return HACKATHONS;
}

export async function fetchHackathonDetail(slug: string): Promise<{
  hackathon: Hackathon | null;
  detail: HackathonDetail | null;
  leaderboard: Leaderboard | null;
  teams: Team[];
}> {
  await sleep(DELAY);
  return {
    hackathon: HACKATHONS.find((h) => h.slug === slug) ?? null,
    detail: HACKATHON_DETAILS[slug] ?? null,
    leaderboard: SEED_LEADERBOARDS[slug] ?? null,
    teams: getTeams().filter((t) => t.hackathonSlug === slug),
  };
}

export async function fetchCampData(): Promise<{
  hackathons: Hackathon[];
  teams: Team[];
  positions: string[];
}> {
  await sleep(DELAY);
  return {
    hackathons: HACKATHONS,
    teams: getTeams(),
    positions: ALL_POSITIONS,
  };
}

export async function fetchRankingData(): Promise<{
  hackathons: Hackathon[];
  leaderboards: Record<string, Leaderboard>;
  localEntries: LocalLeaderboardEntry[];
}> {
  await sleep(DELAY);
  return {
    hackathons: HACKATHONS,
    leaderboards: SEED_LEADERBOARDS,
    localEntries: getLocalLeaderboardEntries(),
  };
}

export async function fetchHomeData(): Promise<{
  featured: Hackathon[];
  stats: { hackathonCount: number; teamCount: number; submitCount: number };
}> {
  await sleep(DELAY);
  return {
    featured: HACKATHONS.filter((h) => h.status === 'ongoing' || h.status === 'upcoming'),
    stats: {
      hackathonCount: HACKATHONS.length,
      teamCount: SEED_TEAMS.length,
      submitCount: Object.values(SEED_LEADERBOARDS).reduce((s, lb) => s + lb.entries.length, 0),
    },
  };
}
