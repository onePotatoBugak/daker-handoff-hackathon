export type HackathonStatus = 'ongoing' | 'ended' | 'upcoming';

export interface Hackathon {
  slug: string;
  title: string;
  status: HackathonStatus;
  tags: string[];
  thumbnailUrl: string;
  period: {
    timezone: string;
    submissionDeadlineAt: string;
    endAt: string;
  };
  links: {
    detail: string;
    rules: string;
    faq: string;
  };
}

export interface HackathonDetail {
  slug: string;
  title: string;
  sections: {
    overview: {
      summary: string;
      teamPolicy: {
        allowSolo: boolean;
        maxTeamSize: number;
      };
    };
    info: {
      notice: string[];
      links?: {
        rules?: string;
        faq?: string;
      };
    };
    eval: {
      metricName: string;
      description: string;
      scoreSource?: string;
      scoreDisplay?: {
        label: string;
        breakdown: Array<{
          key: string;
          label: string;
          weightPercent: number;
        }>;
      };
      limits?: {
        maxRuntimeSec: number;
        maxSubmissionsPerDay: number;
      };
    };
    schedule: {
      timezone: string;
      milestones: Array<{
        name: string;
        at: string;
      }>;
    };
    prize?: {
      items: Array<{
        place: string;
        amountKRW: number;
      }>;
    };
    teams: {
      campEnabled: boolean;
      listUrl: string;
    };
    submit: {
      allowedArtifactTypes: string[];
      submissionUrl: string;
      guide: string[];
      submissionItems?: Array<{
        key: string;
        title: string;
        kind: 'file';
        accept: string[];
        description?: string;
      }>;
    };
    leaderboard: {
      publicLeaderboardUrl: string;
      note: string;
    };
  };
}

export interface Team {
  teamCode: string;
  hackathonSlug: string;  // 빈 문자열 허용 — camp 폼에서 해커톤 없이 생성 가능
  name: string;
  isOpen: boolean;
  memberCount: number;
  lookingFor: string[];
  intro: string;
  contact: {
    type: string;
    url: string;
  };
  createdAt: string;
  isLocal?: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  teamName: string;
  score: number;
  submittedAt: string;
  scoreBreakdown?: {
    participant: number;
    judge: number;
  };
  artifacts?: {
    webUrl?: string;
    pdfUrl?: string;
    planTitle?: string;
  };
}

export interface Leaderboard {
  hackathonSlug: string;
  updatedAt: string;
  entries: LeaderboardEntry[];
}

export interface LocalSubmission {
  id: string;
  hackathonSlug: string;
  artifacts?: Array<{
    key: string;
    title: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    lastModified: number;
    accept: string[];
  }>;
  plan?: string;
  url?: string;
  pdfUrl?: string;
  memo?: string;
  status: 'draft' | 'submitted';
  savedAt: string;
  submittedAt?: string;
}
