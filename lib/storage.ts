'use client';

import type { Team, LocalSubmission } from './types';
import { SEED_TEAMS } from './data';

// UI-flow.png에 명시된 localStorage 4개 키: hackathons · teams(camp) · submissions · leaderboards
const KEYS = {
  TEAMS: 'nyt_teams',
  SUBMISSIONS: 'nyt_submissions',
  TEAM_ACTIONS: 'nyt_team_actions',
  LEADERBOARDS: 'nyt_leaderboards', // UI-flow 명세 반영
};

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage errors
  }
}

// ── Teams ──────────────────────────────────────────────────────────────────

export function getTeams(): Team[] {
  return safeGet<Team[]>(KEYS.TEAMS, SEED_TEAMS);
}

export function addTeam(data: Omit<Team, 'teamCode' | 'createdAt' | 'isLocal'>): Team {
  const teams = getTeams();
  const team: Team = {
    ...data,
    teamCode: `T-LOCAL-${Date.now()}`,
    createdAt: new Date().toISOString(),
    isLocal: true,
  };
  safeSet(KEYS.TEAMS, [...teams, team]);
  return team;
}

export function updateTeam(teamCode: string, updates: Partial<Omit<Team, 'teamCode' | 'createdAt' | 'isLocal'>>): void {
  const teams = getTeams().map((t) =>
    t.teamCode === teamCode ? { ...t, ...updates } : t
  );
  safeSet(KEYS.TEAMS, teams);
}

export function updateTeamOpenStatus(teamCode: string, isOpen: boolean): void {
  updateTeam(teamCode, { isOpen });
}

// ── Submissions ────────────────────────────────────────────────────────────

export function getSubmissions(): LocalSubmission[] {
  return safeGet<LocalSubmission[]>(KEYS.SUBMISSIONS, []);
}

export function getSubmissionBySlug(slug: string): LocalSubmission | null {
  return getSubmissions().find((s) => s.hackathonSlug === slug) ?? null;
}

export function saveSubmission(
  data: Omit<LocalSubmission, 'id' | 'savedAt'>
): LocalSubmission {
  const submissions = getSubmissions();
  const existingIdx = submissions.findIndex(
    (s) => s.hackathonSlug === data.hackathonSlug
  );
  const submission: LocalSubmission = {
    ...data,
    id: existingIdx >= 0 ? submissions[existingIdx].id : `SUB-${Date.now()}`,
    savedAt: new Date().toISOString(),
    submittedAt:
      data.status === 'submitted'
        ? new Date().toISOString()
        : existingIdx >= 0
        ? submissions[existingIdx].submittedAt
        : undefined,
  };
  if (existingIdx >= 0) {
    submissions[existingIdx] = submission;
  } else {
    submissions.push(submission);
  }
  safeSet(KEYS.SUBMISSIONS, submissions);

  // UI-flow: Submit → leaderboard 업데이트 (최종 제출 시 로컬 리더보드에 등록)
  if (data.status === 'submitted') {
    const teams = getTeams();
    const localTeam = teams.find(
      (t) => t.hackathonSlug === data.hackathonSlug && t.isLocal
    );
    addLocalLeaderboardEntry({
      hackathonSlug: data.hackathonSlug,
      teamName: localTeam?.name ?? '나의 제출',
      submittedAt: submission.submittedAt ?? new Date().toISOString(),
    });
  }

  return submission;
}

// ── Leaderboard (localStorage) ─────────────────────────────────────────────
// UI-flow.png: localStorage에 leaderboards 키 명시

export interface LocalLeaderboardEntry {
  hackathonSlug: string;
  teamName: string;
  submittedAt: string;
}

export function getLocalLeaderboardEntries(): LocalLeaderboardEntry[] {
  return safeGet<LocalLeaderboardEntry[]>(KEYS.LEADERBOARDS, []);
}

export function addLocalLeaderboardEntry(entry: LocalLeaderboardEntry): void {
  const entries = getLocalLeaderboardEntries();
  const existingIdx = entries.findIndex(
    (e) =>
      e.hackathonSlug === entry.hackathonSlug &&
      e.teamName === entry.teamName
  );
  if (existingIdx >= 0) {
    entries[existingIdx] = entry;
  } else {
    entries.push(entry);
  }
  safeSet(KEYS.LEADERBOARDS, entries);
}

export function getLocalLeaderboardBySlug(slug: string): LocalLeaderboardEntry[] {
  return getLocalLeaderboardEntries().filter((e) => e.hackathonSlug === slug);
}

// ── Team Actions (지원 상태) ────────────────────────────────────────────────

export type TeamAction = 'applied' | 'accepted';

export function getTeamAction(teamCode: string): TeamAction | null {
  const actions = safeGet<Record<string, TeamAction>>(KEYS.TEAM_ACTIONS, {});
  return actions[teamCode] ?? null;
}

export function setTeamAction(
  teamCode: string,
  action: TeamAction | null
): void {
  const actions = safeGet<Record<string, TeamAction>>(KEYS.TEAM_ACTIONS, {});
  if (action === null) {
    delete actions[teamCode];
  } else {
    actions[teamCode] = action;
  }
  safeSet(KEYS.TEAM_ACTIONS, actions);
}

export function resetStorage(): void {
  if (typeof window === 'undefined') return;
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}
