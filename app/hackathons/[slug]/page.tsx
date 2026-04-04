'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Users,
  Trophy,
  FileText,
  Info,
  BarChart3,
  Gift,
  Calendar,
  Send,
  ExternalLink,
  Save,
  AlertCircle,
  FileUp,
  X,
  UserPlus,
  XCircle,
  Loader2,
} from 'lucide-react';

// ── InviteResultPopup: 초대 결과 알림 팝업 ───────────────────────────────────

function InviteResultPopup({
  status,
  targetName,
  onClose,
}: {
  status: 'accepted' | 'rejected';
  targetName: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full text-center animate-in fade-in zoom-in duration-300">
        {status === 'accepted' ? (
          <div className="py-2">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">초대 수락!</h2>
            <p className="text-slate-500 text-sm mb-6">{targetName}님이 초대를 수락하여 팀에 합류했습니다. 환영합니다! 🎉</p>
            <button onClick={onClose} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all">
              확인
            </button>
          </div>
        ) : (
          <div className="py-2">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">초대 거절</h2>
            <p className="text-slate-500 text-sm mb-6">아쉽게도 {targetName}님이 지금은 팀에 합류하기 어렵다고 전해왔습니다.</p>
            <button onClick={onClose} className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-all">
              닫기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
import Navbar from '@/components/Navbar';
import StatusBadge from '@/components/StatusBadge';
import CountdownTimer from '@/components/CountdownTimer';
import EmptyState from '@/components/EmptyState';
import { SkeletonRow } from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import { fetchHackathonDetail } from '@/lib/api';
import { useAsync } from '@/hooks/useAsync';
import {
  getSubmissionBySlug,
  saveSubmission,
  getLocalLeaderboardBySlug,
  getTeamAction,
  setTeamAction,
} from '@/lib/storage';
import type { TeamAction } from '@/lib/storage';
import { SEED_PARTICIPANTS } from '@/lib/data'; // ⭐️ 신규 참가자 데이터 임포트
import type { Team, LocalSubmission, HackathonDetail, HackathonStatus, Leaderboard } from '@/lib/types';

type TabKey =
  | 'overview'
  | 'info'
  | 'eval'
  | 'prize'
  | 'schedule'
  | 'teams'
  | 'submit'
  | 'leaderboard';

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

type SubmitItem = NonNullable<HackathonDetail['sections']['submit']['submissionItems']>[number];

const FILE_TYPE_FALLBACKS: Record<string, { title: string; accept: string[] }> = {
  zip: {
    title: 'ZIP 파일',
    accept: ['.zip', 'application/zip', 'application/x-zip-compressed'],
  },
  pdf: {
    title: 'PDF 파일',
    accept: ['.pdf', 'application/pdf'],
  },
  csv: {
    title: 'CSV 파일',
    accept: ['.csv', 'text/csv'],
  },
};

function formatKRW(amount: number) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function normalizeSubmitItems(sections: HackathonDetail['sections']['submit']): SubmitItem[] {
  if (sections.submissionItems?.length) {
    return sections.submissionItems;
  }

  return sections.allowedArtifactTypes.map((type) => {
    const fallback = FILE_TYPE_FALLBACKS[type] ?? {
      title: `${type.toUpperCase()} 파일`,
      accept: [`.${type}`],
    };

    return {
      key: `${type}File`,
      title: fallback.title,
      kind: 'file',
      accept: fallback.accept,
    };
  });
}

function getArtifact(
  artifacts: LocalSubmission['artifacts'] | undefined,
  key: string
) {
  return artifacts?.find((artifact) => artifact.key === key);
}

function migrateLegacyArtifacts(
  submission: LocalSubmission,
  items: SubmitItem[]
): LocalSubmission['artifacts'] {
  if (submission.artifacts?.length) {
    return submission.artifacts;
  }

  const pdfItem = items.find((item) => item.accept.includes('.pdf'));
  if (submission.pdfUrl && pdfItem) {
    return [
      {
        key: pdfItem.key,
        title: pdfItem.title,
        fileName: submission.pdfUrl,
        fileSize: 0,
        mimeType: 'legacy/url',
        lastModified: 0,
        accept: pdfItem.accept,
      },
    ];
  }

  return [];
}

function mergeParticipantTeams(
  slug: string,
  teams: Team[],
  leaderboard: Leaderboard | null
): Team[] {
  const byName = new Map(teams.map((team) => [team.name, team]));

  leaderboard?.entries.forEach((entry, index) => {
    if (byName.has(entry.teamName)) return;
    byName.set(entry.teamName, {
      teamCode: `LB-${slug}-${index + 1}`,
      hackathonSlug: slug,
      name: entry.teamName,
      isOpen: false,
      memberCount: 0,
      lookingFor: [],
      intro: '리더보드 제출 기록으로 확인된 참가 팀입니다.',
      contact: { type: 'link', url: '#' },
      createdAt: entry.submittedAt,
    });
  });

  return Array.from(byName.values());
}

function MilestoneTimeline({
  milestones,
}: {
  milestones: { name: string; at: string }[];
}) {
  const [now] = useState(() => Date.now());
  return (
    <ol className="relative border-l border-violet-200 ml-3 space-y-6">
      {milestones.map((m, i) => {
        const isPast = new Date(m.at).getTime() < now;
        return (
          <li key={i} className="ml-5">
            <span className={`absolute -left-2.5 flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-white ${
              isPast ? 'bg-emerald-400' : 'bg-violet-200'
            }`}>
              {isPast ? <CheckCircle className="w-3 h-3 text-white" /> : <Clock className="w-3 h-3 text-violet-500" />}
            </span>
            <p className={`text-sm font-semibold ${isPast ? 'text-slate-700' : 'text-slate-500'}`}>{m.name}</p>
            <time className="text-xs text-slate-400">
              {new Date(m.at).toLocaleString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </time>
          </li>
        );
      })}
    </ol>
  );
}

function TeamCard({
  team,
  hackathonStatus,
  action,
  onApply,
  onAccept,
  onReject,
  hasMyTeam, // 추가된 prop
}: {
  team: Team;
  hackathonStatus: HackathonStatus;
  action: TeamAction | null;
  onApply: () => void;
  onAccept: () => void;
  onReject: () => void;
  hasMyTeam: boolean; // 추가된 prop
}) {
  const isEnded = hackathonStatus === 'ended';
  const isPending = action === 'invited' || action === 'applied';

  return (
    <div className={`light-card p-4 transition-all ${team.isLocal ? 'border-violet-300 bg-violet-50/30' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-slate-800">{team.name}</h3>
          {team.isLocal && <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-violet-600 text-white font-bold">내 팀</span>}
        </div>
        {hackathonStatus !== 'ended' && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
            team.isOpen ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'
          }`}>
            {team.isOpen ? '모집중' : '모집마감'}
          </span>
        )}
      </div>

      <p className="text-sm text-slate-500 mb-3 leading-relaxed">{team.intro}</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {team.lookingFor.map((pos) => (
          <span key={pos} className="bg-violet-50 border border-violet-100 text-xs px-2 py-0.5 rounded-full text-violet-600">{pos}</span>
        ))}
        {team.lookingFor.length === 0 && <span className="text-xs text-slate-400">모집 포지션 없음</span>}
      </div>

      <div className="flex items-center justify-between min-h-[28px]">
        <span className="text-xs text-slate-400">현재 {team.memberCount}명</span>

        {isEnded ? (
          <span className="text-xs text-slate-400">해커톤 종료</span>

        ) : team.isLocal ? (
          <span className="text-xs text-violet-500 font-bold italic">우리 팀 관리 중</span>

        ) : action === 'accepted' ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            <CheckCircle className="w-3 h-3" />합류 완료
          </span>

        ) : action === 'rejected' ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-500 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
            <XCircle className="w-3 h-3" />거절됨
          </span>

        ) : hasMyTeam ? ( // ⭐️ 최우선 순위: 내가 팀이 있다면 다른 팀은 무조건 '지원 불가' 상태 유지
          <span className="text-xs text-slate-300">지원 불가</span>

        ) : isPending ? ( // 내가 팀이 없을 때만 (지원했거나 초대받았을 때) 노출
          <div className="flex items-center gap-2">
            <span className="text-xs text-amber-500 font-bold">
              {action === 'invited' ? '초대 대기 중' : '지원 검토 중'}
            </span>
            <button onClick={onAccept}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-all shadow-sm">
              <CheckCircle className="w-3 h-3" />수락
            </button>
            <button onClick={onReject}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-red-100 text-red-600 font-semibold hover:bg-red-200 transition-all">
              <XCircle className="w-3 h-3" />거절
            </button>
          </div>

        ) : team.isOpen ? ( // 내가 팀이 없고 초대/지원 상태도 아닐 때만 '지원하기' 노출
          <div className="flex gap-2">
            <a href={team.contact.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-violet-600 underline transition-colors">
              연락하기<ExternalLink className="w-3 h-3" />
            </a>
            <button onClick={onApply}
              className="text-xs px-3 py-1 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-all font-semibold">
              지원하기
            </button>
          </div>
        ) : (
          <span className="text-xs text-slate-400">팀 모집 마감</span>
        )}
      </div>
    </div>
  );
}

/* ── MyTeamCompositionCard: 팀 선택 초대 흐름 ── */
function MyTeamCompositionCard({
  team,
  hackathonStatus,
  invitableUsers,
  onInvite,
}: {
  team: Team;
  hackathonStatus: HackathonStatus;
  invitableUsers: typeof SEED_PARTICIPANTS;
  onInvite: (userId: string, userName: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="rounded-2xl p-5" style={{ background: 'rgba(109,40,217,0.05)', border: '1.5px solid rgba(109,40,217,0.2)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
          <Users className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-black text-violet-900">이 해커톤 팀 구성</h3>
          <p className="text-xs text-violet-400 mt-0.5">내 팀 · {team.name}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            현재 <span className="font-bold text-slate-700">{team.memberCount}명</span>
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
            team.isOpen ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-slate-400 bg-slate-100 border-slate-200'
          }`}>
            {team.isOpen ? '모집 중' : '모집 마감'}
          </span>
        </div>

        {hackathonStatus !== 'ended' && (
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white' }}
          >
            <UserPlus className="w-3.5 h-3.5" />초대하기
          </button>
        )}
      </div>

      {showMenu && (
        <div className="mt-4 border-t border-violet-100 pt-3 space-y-2">
          <p className="text-xs font-semibold text-slate-500 mb-1">초대할 참가자를 선택하세요</p>
          {invitableUsers.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">초대 가능한 참가자가 없습니다.</p>
          ) : (
            invitableUsers.map((u) => (
              <button
                key={u.userId}
                onClick={() => { onInvite(u.userId, u.userName); }} // setShowMenu(false) 삭제하여 목록 유지
                className="w-full flex items-center justify-between text-left text-xs px-3 py-2 rounded-lg bg-white border border-violet-100 hover:border-violet-300 hover:bg-violet-50 transition-all"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800">{u.userName}</span>
                  <span className="text-[10px] text-slate-400">{u.position}</span>
                </div>
                <span className="text-violet-500 font-semibold flex items-center gap-1">
                  <UserPlus className="w-3 h-3" />초대 발송
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ── TeamsSection: 팀 액션 상태 통합 관리 ── */
function TeamsSection({
  slug,
  hackathonStatus,
  filteredTeams,
  onNavigate,
  onInvite,
}: {
  slug: string;
  hackathonStatus: HackathonStatus;
  filteredTeams: Team[];
  onNavigate: (path: string) => void;
  onInvite: (name: string, code: string) => void; // 이름도 전달하도록 수정
}) {
  const [actions, setActions] = useState<Record<string, TeamAction | null>>(() => {
    const init: Record<string, TeamAction | null> = {};
    filteredTeams.forEach((t) => {
      init[t.teamCode] = getTeamAction(t.teamCode);
    });
    // 참가자들에 대해서도 액션 초기화
    SEED_PARTICIPANTS.forEach((p) => {
      init[p.userId] = getTeamAction(p.userId);
    });
    return init;
  });

  function updateAction(code: string, action: TeamAction | null) {
    setTeamAction(code, action);
    setActions((prev) => ({ ...prev, [code]: action }));
  }

  const myTeam = filteredTeams.find((t) => t.isLocal);
  
  // 초대 가능: SEED_PARTICIPANTS 중 이 해커톤 소속 유저 + 거절하지 않은 유저
  const invitableUsers = SEED_PARTICIPANTS.filter((p) => {
    if (p.hackathonSlug !== slug) return false;
    const a = actions[p.userId] ?? null;
    return a === null || a === 'rejected';
  });

  // 메인 카드 목록: 모든 팀 표시 (이제 1인 참가자는 팀 데이터에 없으므로 자동 필터링됨)
  const teamCardsToShow = filteredTeams;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-800">참여 팀</h2>
        <Link href={`/camp?hackathon=${slug}`}
          className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:scale-105 bg-violet-50 text-violet-700 border border-violet-200">
          <Users className="w-3.5 h-3.5" />팀 모집 페이지
        </Link>
      </div>

      {myTeam && (
        <MyTeamCompositionCard
          team={myTeam}
          hackathonStatus={hackathonStatus}
          invitableUsers={invitableUsers} // 이름 변경
          onInvite={(userId, userName) => {
            updateAction(userId, 'invited');
            onInvite(userName, userId);
          }}
        />
      )}

      {teamCardsToShow.length === 0 ? (
        <EmptyState
          title="등록된 팀이 없습니다"
          description="아직 이 해커톤에 팀을 만든 참가자가 없습니다."
          action={{ label: '팀 만들기', onClick: () => onNavigate(`/camp?hackathon=${slug}`) }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {teamCardsToShow.map((t) => (
            <TeamCard
              key={t.teamCode}
              team={t}
              hackathonStatus={hackathonStatus}
              action={actions[t.teamCode] ?? null}
              onApply={() => updateAction(t.teamCode, 'applied')}
              onAccept={() => updateAction(t.teamCode, 'accepted')}
              onReject={() => updateAction(t.teamCode, 'rejected')}
              hasMyTeam={!!myTeam}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SubmitSection({
  slug,
  sections,
  hackathonStatus,
  teams,
  onOpenTeamsTab,
}: {
  slug: string;
  sections: HackathonDetail['sections']['submit'];
  hackathonStatus: HackathonStatus;
  teams: Team[];
  onOpenTeamsTab: () => void;
}) {
  const submitItems = useMemo(() => normalizeSubmitItems(sections), [sections]);
  const participatingTeam = useMemo(() => {
    const localTeam = teams.find((team) => team.isLocal);
    if (localTeam) return localTeam;

    return teams.find((team) => getTeamAction(team.teamCode) === 'accepted') ?? null;
  }, [teams]);
  const [draft, setDraft] = useState<LocalSubmission | null>(() => getSubmissionBySlug(slug));
  const [form, setForm] = useState<{ artifacts: NonNullable<LocalSubmission['artifacts']>; memo: string }>(() => {
    const existing = getSubmissionBySlug(slug);
    return {
      artifacts: existing ? migrateLegacyArtifacts(existing, submitItems) ?? [] : [],
      memo: existing?.memo ?? '',
    };
  });
  const [saved, setSaved] = useState<'idle' | 'saving' | 'draft-saved' | 'submitted'>(
    () => (getSubmissionBySlug(slug)?.status === 'submitted' ? 'submitted' : 'idle')
  );

  function handleSave(status: 'draft' | 'submitted') {
    if (!participatingTeam) {
      return;
    }

    if (status === 'submitted') {
      const missingItems = submitItems.filter((item) => !getArtifact(form.artifacts, item.key));
      if (missingItems.length > 0) {
        window.alert(`다음 파일을 먼저 선택하세요: ${missingItems.map((item) => item.title).join(', ')}`);
        return;
      }
    }

    setSaved('saving');
    const result = saveSubmission(
      { hackathonSlug: slug, ...form, status },
      { teamName: participatingTeam.name }
    );
    setDraft(result);
    setTimeout(() => setSaved(status === 'submitted' ? 'submitted' : 'draft-saved'), 400);
    if (status === 'draft') setTimeout(() => setSaved('idle'), 2000);
  }

  function handleFileChange(item: SubmitItem, file: File | null) {
    setForm((prev) => {
      const nextArtifacts = prev.artifacts.filter((artifact) => artifact.key !== item.key);
      if (file) {
        nextArtifacts.push({
          key: item.key,
          title: item.title,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          lastModified: file.lastModified,
          accept: item.accept,
        });
      }
      return { ...prev, artifacts: nextArtifacts };
    });
  }

  const isEnded = hackathonStatus === 'ended';
  const isSubmitted = saved === 'submitted' || draft?.status === 'submitted';
  const isLocked = !participatingTeam;

  return (
    <div className="space-y-5">
      <div
        className={`relative overflow-hidden rounded-2xl border p-5 ${
          isLocked
            ? 'border-amber-200 bg-[linear-gradient(135deg,rgba(255,251,235,1),rgba(255,247,237,1))]'
            : 'border-emerald-200 bg-[linear-gradient(135deg,rgba(236,253,245,1),rgba(240,253,250,1))]'
        }`}
      >
        <div className="absolute right-0 top-0 h-24 w-24 rounded-full blur-2xl opacity-70 pointer-events-none bg-white/60" />
        <div className="relative flex items-start gap-3">
          <div
            className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
              isLocked ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {isLocked ? <XCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className={`text-base font-black ${isLocked ? 'text-amber-950' : 'text-emerald-950'}`}>
                {isLocked ? '팀 참여 전에는 제출할 수 없습니다' : `${participatingTeam.name} 팀으로 제출할 수 있습니다`}
              </h3>
              <span
                className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                  isLocked
                    ? 'border-amber-200 bg-white/80 text-amber-700'
                    : 'border-emerald-200 bg-white/80 text-emerald-700'
                }`}
              >
                {isLocked ? '제출 잠금' : '제출 가능'}
              </span>
            </div>
            <p className={`mt-2 text-sm leading-relaxed ${isLocked ? 'text-amber-900/80' : 'text-emerald-900/80'}`}>
              {isLocked
                ? '현재 이 해커톤에서 참여 중인 팀이 확인되지 않았습니다. 팀 탭에서 팀을 만들거나, 초대를 수락한 뒤 제출을 진행하세요.'
                : '업로드한 결과물과 최종 제출 기록은 현재 참여 중인 팀에 연결됩니다.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {isLocked ? (
                <>
                  <button
                    type="button"
                    onClick={onOpenTeamsTab}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-900 px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90"
                  >
                    <Users className="h-4 w-4" />
                    팀 탭으로 이동
                  </button>
                  <Link
                    href={`/camp?hackathon=${slug}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-white/90 px-4 py-2 text-sm font-semibold text-amber-800 transition-colors hover:bg-white"
                  >
                    <UserPlus className="h-4 w-4" />
                    팀 만들기 / 찾기
                  </Link>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white/90 px-4 py-2 text-sm font-semibold text-emerald-800">
                    <Users className="h-4 w-4" />
                    현재 제출 팀: {participatingTeam.name}
                  </div>
                  <button
                    type="button"
                    onClick={onOpenTeamsTab}
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white/90 px-4 py-2 text-sm font-semibold text-emerald-800 transition-colors hover:bg-white"
                  >
                    팀 상태 확인
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {isEnded && (
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-500 text-sm font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          해커톤이 종료되어 제출이 마감되었습니다.
        </div>
      )}
      <div className="rounded-xl p-4" style={{ background: 'rgba(109,40,217,0.04)', border: '1px solid rgba(109,40,217,0.12)' }}>
        <div className="flex items-center gap-2 mb-2 text-violet-700 font-semibold text-sm">
          <Info className="w-4 h-4" />제출 가이드
        </div>
        <ul className="space-y-1">
          {sections.guide.map((g, i) => (
            <li key={i} className="text-sm text-slate-600 flex gap-2">
              <span className="text-violet-500 shrink-0">{i + 1}.</span>{g}
            </li>
          ))}
        </ul>
      </div>

      {isSubmitted && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-700 text-sm font-semibold">
          <CheckCircle className="w-4 h-4" />
          최종 제출이 완료되었습니다.
          {draft?.submittedAt && (
            <span className="text-emerald-500 text-xs ml-auto">{new Date(draft.submittedAt).toLocaleString('ko-KR')}</span>
          )}
        </div>
      )}

      {/* Form */}
      <div className="space-y-4">
        {submitItems.map((item) => {
          const artifact = getArtifact(form.artifacts, item.key);

          return (
            <div key={item.key} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">{item.title}</label>
                  <p className="text-xs text-slate-400 mt-1">허용 형식: {item.accept.join(', ')}</p>
                  {item.description && <p className="text-xs text-slate-500 mt-1">{item.description}</p>}
                </div>
                <FileUp className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
              </div>

              <input
                type="file"
                accept={item.accept.join(',')}
                disabled={isSubmitted || isEnded || isLocked}
                onChange={(e) => handleFileChange(item, e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-violet-700 hover:file:bg-violet-100 disabled:opacity-50"
              />

              {artifact ? (
                <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-emerald-800">{artifact.fileName}</p>
                    <p className="text-xs text-emerald-600">
                      {artifact.fileSize > 0 ? formatFileSize(artifact.fileSize) : '기존 저장 파일'} · {artifact.mimeType || '형식 미확인'}
                    </p>
                  </div>
                  {!isSubmitted && !isEnded && !isLocked && (
                    <button
                      type="button"
                      onClick={() => handleFileChange(item, null)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                    >
                      <X className="w-3.5 h-3.5" />
                      제거
                    </button>
                  )}
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-400">선택된 파일이 없습니다.</p>
              )}
            </div>
          );
        })}

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">메모 (선택)</label>
          <textarea value={form.memo}
            onChange={(e) => setForm((p) => ({ ...p, memo: e.target.value }))}
            disabled={isSubmitted || isEnded || isLocked} rows={2} placeholder="제출에 대한 메모를 남기세요"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-violet-400 disabled:opacity-50 resize-none" />
        </div>

        {draft?.savedAt && !isSubmitted && (
          <p className="text-xs text-slate-400">마지막 임시저장: {new Date(draft.savedAt).toLocaleString('ko-KR')}</p>
        )}

        {!isSubmitted && !isEnded && !isLocked && (
          <div className="flex gap-3">
            <button onClick={() => handleSave('draft')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm rounded-xl transition-all font-semibold">
              <Save className="w-4 h-4" />
              {saved === 'saving' ? '저장 중...' : saved === 'draft-saved' ? '저장됨 ✓' : '임시저장'}
            </button>
            <button onClick={() => handleSave('submitted')}
              className="flex items-center gap-2 px-4 py-2 text-white text-sm rounded-xl transition-all font-semibold hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #6d28d9, #4f46e5)' }}>
              <Send className="w-4 h-4" />최종 제출
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function LeaderboardSection({
  slug,
  note,
  leaderboard,
  teams,
}: {
  slug: string;
  note: string;
  leaderboard: Leaderboard | null;
  teams: Team[];
}) {
  const lb = leaderboard;
  const [localEntries, setLocalEntries] = useState<{ teamName: string; submittedAt: string }[]>([]);

  useEffect(() => {
    setLocalEntries(getLocalLeaderboardBySlug(slug));
  }, [slug]);

  // 로컬 제출 중 seed에 없는 것만 추가 (UI-flow: "leaderboards 업데이트")
  const pendingEntries = localEntries.filter(
    (le) => !lb?.entries.some((e) => e.teamName === le.teamName)
  );
  const participantOnlyTeams = teams.filter(
    (team) =>
      team.isLocal &&
      !lb?.entries.some((entry) => entry.teamName === team.name) &&
      !pendingEntries.some((entry) => entry.teamName === team.name)
  );

  if (!lb && pendingEntries.length === 0 && participantOnlyTeams.length === 0) {
    return (
      <EmptyState
        title="집계 중입니다"
        description="대회 종료 후 리더보드가 공개됩니다."
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500 flex items-center gap-1.5">
        <AlertCircle className="w-3.5 h-3.5 text-violet-400" />{note}
      </p>

      {lb && lb.entries.length >= 2 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[2, 1, 3].map((targetRank) => {
            const e = lb.entries.find((x) => x.rank === targetRank);
            if (!e) return <div key={targetRank} />;
            return (
              <div key={e.rank} className={`border rounded-xl p-4 text-center ${
                e.rank === 1 ? 'bg-yellow-50 border-yellow-200'
                : e.rank === 2 ? 'bg-slate-50 border-slate-200'
                : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="text-2xl mb-1">{MEDAL[e.rank]}</div>
                <div className="font-bold text-slate-800 text-sm">{e.teamName}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {typeof e.score === 'number' && e.score < 2 ? e.score.toFixed(4) : e.score.toFixed(1)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-violet-50 text-slate-500 text-xs uppercase">
              <th className="py-3 px-4 text-left">순위</th>
              <th className="py-3 px-4 text-left">팀</th>
              <th className="py-3 px-4 text-right">점수</th>
              {lb?.entries[0]?.scoreBreakdown && (
                <>
                  <th className="py-3 px-4 text-right hidden sm:table-cell">참가자(30%)</th>
                  <th className="py-3 px-4 text-right hidden sm:table-cell">심사위원(70%)</th>
                </>
              )}
              <th className="py-3 px-4 text-right hidden md:table-cell">제출일</th>
              <th className="py-3 px-4 text-right hidden md:table-cell">산출물</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {lb?.entries.map((e) => (
              <tr key={e.rank} className="hover:bg-violet-50/50 transition-colors">
                <td className="py-3 px-4 font-bold text-slate-600">{MEDAL[e.rank] ?? `#${e.rank}`}</td>
                <td className="py-3 px-4 font-semibold text-slate-800">{e.teamName}</td>
                <td className="py-3 px-4 text-right font-mono text-slate-700">
                  {typeof e.score === 'number' && e.score < 2 ? e.score.toFixed(4) : e.score.toFixed(1)}
                </td>
                {e.scoreBreakdown && (
                  <>
                    <td className="py-3 px-4 text-right text-slate-500 hidden sm:table-cell">{e.scoreBreakdown.participant}</td>
                    <td className="py-3 px-4 text-right text-slate-500 hidden sm:table-cell">{e.scoreBreakdown.judge}</td>
                  </>
                )}
                <td className="py-3 px-4 text-right text-xs text-slate-400 hidden md:table-cell">
                  {new Date(e.submittedAt).toLocaleDateString('ko-KR')}
                </td>
                <td className="py-3 px-4 text-right hidden md:table-cell">
                  {e.artifacts?.webUrl && (
                    <a href={e.artifacts.webUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-violet-500 hover:text-violet-700 underline">웹사이트</a>
                  )}
                </td>
              </tr>
            ))}
            {pendingEntries.map((le) => (
              <tr key={`local-${le.teamName}`} className="hover:bg-amber-50/50 bg-amber-50/30 transition-colors">
                <td className="py-3 px-4 text-slate-400">-</td>
                <td className="py-3 px-4 font-semibold text-slate-800">
                  <div className="flex items-center gap-2">
                    {le.teamName}
                    <span className="text-xs text-amber-600 border border-amber-200 bg-amber-50 px-1.5 py-0.5 rounded-full">집계 예정</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right"><span className="text-xs text-slate-400">집계 중</span></td>
                {lb?.entries[0]?.scoreBreakdown && (<><td className="hidden sm:table-cell" /><td className="hidden sm:table-cell" /></>)}
                <td className="py-3 px-4 text-right text-xs text-slate-400 hidden md:table-cell">
                  {new Date(le.submittedAt).toLocaleDateString('ko-KR')}
                </td>
                <td className="hidden md:table-cell" />
              </tr>
            ))}
            {participantOnlyTeams.map((team) => (
              <tr key={`team-${team.teamCode}`} className="hover:bg-sky-50/50 bg-sky-50/30 transition-colors">
                <td className="py-3 px-4 text-slate-400">-</td>
                <td className="py-3 px-4 font-semibold text-slate-800">
                  <div className="flex items-center gap-2">
                    {team.name}
                    <span className="text-xs text-sky-600 border border-sky-200 bg-sky-50 px-1.5 py-0.5 rounded-full">참여중</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right"><span className="text-xs text-slate-400">미제출</span></td>
                {lb?.entries[0]?.scoreBreakdown && (<><td className="hidden sm:table-cell" /><td className="hidden sm:table-cell" /></>)}
                <td className="py-3 px-4 text-right text-xs text-slate-400 hidden md:table-cell">
                  {new Date(team.createdAt).toLocaleDateString('ko-KR')}
                </td>
                <td className="hidden md:table-cell" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {lb && <p className="text-xs text-slate-400 text-right">업데이트: {new Date(lb.updatedAt).toLocaleString('ko-KR')}</p>}
    </div>
  );
}

export default function HackathonDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  // 초대 결과 팝업 상태
  const [inviteResult, setInviteResult] = useState<{
    show: boolean;
    status: 'accepted' | 'rejected';
    targetName: string;
  }>({ show: false, status: 'accepted', targetName: '' });

  // 하단 토스트 상태
  const [showToast, setShowToast] = useState(false);

  const { data, loading, error, retry } = useAsync(() => fetchHackathonDetail(slug));
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    if (data?.teams) {
      const merged = mergeParticipantTeams(slug, data.teams, data.leaderboard);
      setTeams(merged);
    }
  }, [slug, data]);

  const hackathon = data?.hackathon ?? null;
  const detail = data?.detail ?? null;
  const leaderboard = data?.leaderboard ?? null;
  
  const filteredTeams = useMemo(() => teams, [teams]);

  function handleInvite(userName: string, userId: string) {
    // 1. 즉시 하단 토스트 표시
    setInviteResult(prev => ({ ...prev, targetName: userName, show: false })); // 이전 팝업 닫기 및 이름 설정
    setShowToast(true);

    // 2. 5초 후 결과 결정 및 팝업 표시
    setTimeout(() => {
      setShowToast(false); // 토스트 숨기기
      
      const isAccepted = Math.random() > 0.5;
      const finalStatus = isAccepted ? 'accepted' : 'rejected';
      
      setInviteResult({ show: true, status: finalStatus, targetName: userName });

      if (isAccepted) {
        const myTeam = teams.find(t => t.isLocal && t.hackathonSlug === slug);
        if (myTeam) {
          const newMemberCount = myTeam.memberCount + 1;
          const newIsOpen = newMemberCount >= 5 ? false : myTeam.isOpen;
          
          setTeams(prevTeams => prevTeams.map(t => 
            t.teamCode === myTeam.teamCode 
              ? { ...t, memberCount: newMemberCount, isOpen: newIsOpen } 
              : t
          ));
          
          import('@/lib/storage').then(m => {
            m.updateTeam(myTeam.teamCode, { memberCount: newMemberCount, isOpen: newIsOpen });
          });
        }
      }
    }, 5000);
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: '#f5f3ff' }}>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="h-8 w-32 bg-violet-50 rounded animate-pulse mb-6" />
          <div className="rounded-2xl bg-white border border-violet-100 p-7 mb-5 shadow-sm animate-pulse">
            <div className="h-4 bg-violet-50 rounded w-24 mb-4" />
            <div className="h-8 bg-violet-50 rounded w-3/4 mb-5" />
            <div className="h-4 bg-violet-50 rounded w-48" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ background: '#f5f3ff' }}>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-16">
          <ErrorState description="해커톤 정보를 불러오는 중 오류가 발생했습니다." onRetry={retry} />
        </main>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen" style={{ background: '#f5f3ff' }}>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-16">
          <EmptyState
            title="해커톤을 찾을 수 없습니다"
            description={`'${slug}'에 해당하는 해커톤이 존재하지 않습니다.`}
            action={{ label: '목록으로 돌아가기', onClick: () => router.push('/hackathons') }}
          />
        </main>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen" style={{ background: '#f5f3ff' }}>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-16">
          <EmptyState title="상세 데이터가 없습니다" description="이 해커톤의 상세 정보가 아직 제공되지 않았습니다." />
        </main>
      </div>
    );
  }

  const sections = detail.sections;

  const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: '개요', icon: <FileText className="w-4 h-4" /> },
    { key: 'info', label: '안내', icon: <Info className="w-4 h-4" /> },
    { key: 'eval', label: '평가', icon: <BarChart3 className="w-4 h-4" /> },
    ...(sections?.prize ? [{ key: 'prize' as TabKey, label: '상금', icon: <Gift className="w-4 h-4" /> }] : []),
    { key: 'schedule', label: '일정', icon: <Calendar className="w-4 h-4" /> },
    { key: 'teams', label: '팀', icon: <Users className="w-4 h-4" /> },
    { key: 'submit', label: '제출', icon: <Send className="w-4 h-4" /> },
    { key: 'leaderboard', label: '리더보드', icon: <Trophy className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#f5f3ff' }}>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-violet-600 mb-6 transition-colors group font-medium">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          해커톤 목록으로
        </button>

        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-violet-100 p-7 mb-5 shadow-sm">
          <div className={`absolute top-0 left-0 w-full h-1 rounded-t-2xl ${
            hackathon.status === 'ongoing' ? 'bg-gradient-to-r from-emerald-400 to-teal-400' :
            hackathon.status === 'upcoming' ? 'bg-gradient-to-r from-violet-500 to-blue-500' :
            'bg-gradient-to-r from-slate-200 to-slate-300'
          }`} />
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(109,40,217,0.04) 0%, transparent 70%)' }} />

          <div className="flex flex-wrap items-center gap-2 mb-4 mt-1">
            <StatusBadge status={hackathon.status} />
            {hackathon.tags.map((tag) => (
              <span key={tag} className="text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-violet-50 text-violet-600 border border-violet-100">
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-slate-800 mb-5 leading-snug">{hackathon.title}</h1>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-violet-400" />
              <span>제출 마감</span>
              <span className="text-slate-700 font-semibold">{new Date(hackathon.period.submissionDeadlineAt).toLocaleDateString('ko-KR')}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <Clock className="w-3.5 h-3.5 text-violet-400" />
              <span>대회 종료</span>
              <span className="text-slate-700 font-semibold">{new Date(hackathon.period.endAt).toLocaleDateString('ko-KR')}</span>
            </div>
            {hackathon.status !== 'ended' && <CountdownTimer deadline={hackathon.period.submissionDeadlineAt} label="마감" />}
          </div>
        </div>

        {/* Tabs */}
        <div className="overflow-x-auto mb-5">
          <div className="flex gap-1 rounded-2xl p-1.5 min-w-max bg-white border border-violet-100 shadow-sm">
            {TABS.map(({ key, label, icon }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap"
                style={activeTab === key
                  ? { background: 'linear-gradient(135deg, rgba(109,40,217,0.1), rgba(79,70,229,0.1))', color: '#6d28d9', border: '1px solid rgba(109,40,217,0.2)' }
                  : { color: '#94a3b8' }
                }
                onMouseEnter={(e) => { if (activeTab !== key) (e.currentTarget as HTMLElement).style.color = '#6d28d9'; }}
                onMouseLeave={(e) => { if (activeTab !== key) (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}
              >
                <span className={activeTab === key ? 'text-violet-600' : ''}>{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl border border-violet-100 p-7 shadow-sm">
            {activeTab === 'overview' && (
              <div className="space-y-5">
                <h2 className="text-xl font-black text-slate-800">개요</h2>
                <p className="text-slate-600 leading-relaxed text-[15px]">{sections.overview.summary}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl p-4 bg-slate-50 border border-slate-100">
                    <p className="text-xs text-slate-400 mb-1">개인 참가</p>
                    <p className="text-base font-bold" style={{ color: sections.overview.teamPolicy.allowSolo ? '#059669' : '#dc2626' }}>
                      {sections.overview.teamPolicy.allowSolo ? '가능' : '불가'}
                    </p>
                  </div>
                  <div className="rounded-xl p-4 bg-slate-50 border border-slate-100">
                    <p className="text-xs text-slate-400 mb-1">최대 팀원 수</p>
                    <p className="text-base font-bold text-slate-800">{sections.overview.teamPolicy.maxTeamSize}명</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'info' && (
              <div className="space-y-4">
                <h2 className="text-xl font-black text-slate-800">안내사항</h2>
                <ul className="space-y-2.5">
                  {sections.info.notice.map((n, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-600 rounded-xl p-4"
                      style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.18)' }}>
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />{n}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-3 mt-2">
                  {sections.info.links?.rules ? (
                    <a href={sections.info.links.rules} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:scale-105 bg-violet-50 text-violet-700 border border-violet-200">
                      <ExternalLink className="w-3.5 h-3.5" />규정 보기
                    </a>
                  ) : (
                    <span className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60">
                      규정 보기 (준비 중)
                    </span>
                  )}
                  {sections.info.links?.faq ? (
                    <a href={sections.info.links.faq} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:scale-105 bg-violet-50 text-violet-700 border border-violet-200">
                      <ExternalLink className="w-3.5 h-3.5" />FAQ 보기
                    </a>
                  ) : (
                    <span className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60">
                      FAQ 보기 (준비 중)
                    </span>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'eval' && (
              <div className="space-y-5">
                <h2 className="text-xl font-black text-slate-800">평가 기준</h2>
                <div className="rounded-xl p-5 bg-slate-50 border border-slate-100">
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">평가 지표</div>
                  <div className="text-lg font-bold text-slate-800 mb-2">{sections.eval.metricName}</div>
                  <p className="text-sm text-slate-500">{sections.eval.description}</p>
                </div>
                {sections.eval.scoreDisplay && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-600 mb-4">점수 구성 ({sections.eval.scoreDisplay.label})</h3>
                    <div className="space-y-4">
                      {sections.eval.scoreDisplay.breakdown.map((b, idx) => {
                        const colors = ['#7c3aed', '#4f46e5', '#0891b2'];
                        return (
                          <div key={b.key}>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-slate-700 font-semibold">{b.label}</span>
                              <span className="font-bold" style={{ color: colors[idx % colors.length] }}>{b.weightPercent}%</span>
                            </div>
                            <div className="h-2.5 rounded-full overflow-hidden bg-slate-100">
                              <div className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${b.weightPercent}%`, background: `linear-gradient(90deg, ${colors[idx % colors.length]}, ${colors[(idx + 1) % colors.length]})` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {sections.eval.limits && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl p-4 bg-slate-50 border border-slate-100">
                      <p className="text-xs text-slate-400 mb-1">최대 실행 시간</p>
                      <p className="text-base font-bold text-slate-800">{sections.eval.limits.maxRuntimeSec}초</p>
                    </div>
                    <div className="rounded-xl p-4 bg-slate-50 border border-slate-100">
                      <p className="text-xs text-slate-400 mb-1">일일 최대 제출</p>
                      <p className="text-base font-bold text-slate-800">{sections.eval.limits.maxSubmissionsPerDay}회</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'prize' && sections.prize && (
              <div className="space-y-4">
                <h2 className="text-xl font-black text-slate-800">시상 내역</h2>
                <div className="space-y-3">
                  {sections.prize.items.map((p, idx) => {
                    const configs = [
                      { emoji: '🥇', bg: '#fefce8', border: '#fef08a', color: '#d97706' },
                      { emoji: '🥈', bg: '#f8fafc', border: '#e2e8f0', color: '#64748b' },
                      { emoji: '🥉', bg: '#fff7ed', border: '#fed7aa', color: '#ea580c' },
                    ];
                    const c = configs[idx] ?? { emoji: '🏅', bg: '#f8fafc', border: '#e2e8f0', color: '#64748b' };
                    return (
                      <div key={p.place} className="flex items-center justify-between rounded-2xl p-5"
                        style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">{c.emoji}</span>
                          <div>
                            <p className="font-bold text-slate-800">{p.place}</p>
                            <p className="text-xs text-slate-400">순위 상금</p>
                          </div>
                        </div>
                        <span className="text-xl font-black" style={{ color: c.color }}>{formatKRW(p.amountKRW)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="space-y-4">
                <h2 className="text-xl font-black text-slate-800">진행 일정</h2>
                <MilestoneTimeline milestones={sections.schedule.milestones} />
              </div>
            )}

            {activeTab === 'teams' && (
              <TeamsSection
                key={slug}
                slug={slug}
                hackathonStatus={hackathon.status}
                filteredTeams={filteredTeams}
                onNavigate={(path) => router.push(path)}
                onInvite={handleInvite}
              />
            )}

            {activeTab === 'submit' && (
              <div className="space-y-4">
                <h2 className="text-xl font-black text-slate-800">제출</h2>
                <SubmitSection
                  key={slug}
                  slug={slug}
                  sections={sections.submit}
                  hackathonStatus={hackathon.status}
                  teams={filteredTeams}
                  onOpenTeamsTab={() => setActiveTab('teams')}
                />
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div className="space-y-4">
                <h2 className="text-xl font-black text-slate-800">리더보드</h2>
                <LeaderboardSection slug={slug} note={sections.leaderboard.note} leaderboard={leaderboard} teams={data?.teams ?? []} />
              </div>
            )}
        </div>
      </main>

      {inviteResult.show && (
        <InviteResultPopup
          status={inviteResult.status}
          targetName={inviteResult.targetName}
          onClose={() => setInviteResult(prev => ({ ...prev, show: false }))}
        />
      )}

      {/* 하단 토스트 알림 */}
      {showToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-slate-800 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700">
            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-bold">초대가 완료되었습니다.</span>
          </div>
        </div>
      )}
    </div>
  );
}
