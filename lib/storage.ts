'use client';

import type { Team, LocalSubmission } from './types';
import { SEED_TEAMS } from './data';

const KEYS = {
  TEAMS: 'nyt_teams',
  SUBMISSIONS: 'nyt_submissions',
  TEAM_ACTIONS: 'nyt_team_actions',
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

export function updateTeamOpenStatus(teamCode: string, isOpen: boolean): void {
  const teams = getTeams().map((t) =>
    t.teamCode === teamCode ? { ...t, isOpen } : t
  );
  safeSet(KEYS.TEAMS, teams);
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
        : (existingIdx >= 0 ? submissions[existingIdx].submittedAt : undefined),
  };
  if (existingIdx >= 0) {
    submissions[existingIdx] = submission;
  } else {
    submissions.push(submission);
  }
  safeSet(KEYS.SUBMISSIONS, submissions);
  return submission;
}

// ── Team Actions (지원/수락 상태) ───────────────────────────────────────────

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
  localStorage.removeItem(KEYS.TEAMS);
  localStorage.removeItem(KEYS.SUBMISSIONS);
  localStorage.removeItem(KEYS.TEAM_ACTIONS);
}
