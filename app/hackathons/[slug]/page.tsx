'use client';

import { use, useState, useEffect } from 'react';
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
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import StatusBadge from '@/components/StatusBadge';
import CountdownTimer from '@/components/CountdownTimer';
import EmptyState from '@/components/EmptyState';
import { HACKATHONS, HACKATHON_DETAILS, SEED_LEADERBOARDS } from '@/lib/data';
import {
  getTeams,
  getSubmissionBySlug,
  saveSubmission,
} from '@/lib/storage';
import type { Team, LocalSubmission, LeaderboardEntry, HackathonDetail } from '@/lib/types';

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

function formatKRW(amount: number) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(amount);
}

function MilestoneTimeline({
  milestones,
}: {
  milestones: { name: string; at: string }[];
}) {
  const now = Date.now();
  return (
    <ol className="relative border-l border-slate-700 ml-3 space-y-6">
      {milestones.map((m, i) => {
        const isPast = new Date(m.at).getTime() < now;
        return (
          <li key={i} className="ml-5">
            <span
              className={`absolute -left-2.5 flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-slate-950 ${
                isPast ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              {isPast ? (
                <CheckCircle className="w-3 h-3 text-white" />
              ) : (
                <Clock className="w-3 h-3 text-slate-400" />
              )}
            </span>
            <p className={`text-sm font-medium ${isPast ? 'text-slate-300' : 'text-white'}`}>
              {m.name}
            </p>
            <time className="text-xs text-slate-500">
              {new Date(m.at).toLocaleString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </time>
          </li>
        );
      })}
    </ol>
  );
}

function TeamCard({ team }: { team: Team }) {
  const [action, setAction] = useState<'applied' | 'accepted' | null>(null);

  useEffect(() => {
    const { getTeamAction } = require('@/lib/storage');
    setAction(getTeamAction(team.teamCode));
  }, [team.teamCode]);

  function handleApply() {
    const { setTeamAction } = require('@/lib/storage');
    if (action === 'applied') {
      setTeamAction(team.teamCode, null);
      setAction(null);
    } else {
      setTeamAction(team.teamCode, 'applied');
      setAction('applied');
    }
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-white">{team.name}</h3>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            team.isOpen
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-slate-700 text-slate-500 border border-slate-600'
          }`}
        >
          {team.isOpen ? '모집중' : '모집마감'}
        </span>
      </div>
      <p className="text-sm text-slate-400 mb-3 leading-relaxed">{team.intro}</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {team.lookingFor.map((pos) => (
          <span
            key={pos}
            className="bg-slate-700 text-xs px-2 py-0.5 rounded-full text-slate-300"
          >
            {pos}
          </span>
        ))}
        {team.lookingFor.length === 0 && (
          <span className="text-xs text-slate-500">모집 포지션 없음</span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          현재 {team.memberCount}명
        </span>
        {team.isOpen ? (
          <div className="flex gap-2">
            <a
              href={team.contact.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 underline"
            >
              연락하기
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={handleApply}
              className={`text-xs px-3 py-1 rounded-lg transition-all font-medium ${
                action === 'applied'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {action === 'applied' ? '지원완료 ✓' : '지원하기'}
            </button>
          </div>
        ) : (
          <span className="text-xs text-slate-500">팀 모집 마감</span>
        )}
      </div>
    </div>
  );
}

function SubmitSection({
  slug,
  sections,
}: {
  slug: string;
  sections: HackathonDetail['sections']['submit'];
}) {
  const [draft, setDraft] = useState<LocalSubmission | null>(null);
  const [form, setForm] = useState({ plan: '', url: '', pdfUrl: '', memo: '' });
  const [saved, setSaved] = useState<'idle' | 'saving' | 'draft-saved' | 'submitted'>('idle');

  useEffect(() => {
    const existing = getSubmissionBySlug(slug);
    if (existing) {
      setDraft(existing);
      setForm({
        plan: existing.plan ?? '',
        url: existing.url ?? '',
        pdfUrl: existing.pdfUrl ?? '',
        memo: existing.memo ?? '',
      });
      setSaved(existing.status === 'submitted' ? 'submitted' : 'idle');
    }
  }, [slug]);

  function handleSave(status: 'draft' | 'submitted') {
    setSaved('saving');
    const result = saveSubmission({ hackathonSlug: slug, ...form, status });
    setDraft(result);
    setTimeout(() => setSaved(status === 'submitted' ? 'submitted' : 'draft-saved'), 400);
    if (status === 'draft') setTimeout(() => setSaved('idle'), 2000);
  }

  const isSubmitted = saved === 'submitted' || draft?.status === 'submitted';

  return (
    <div className="space-y-5">
      {/* Guide */}
      <div className="bg-blue-950/40 border border-blue-800/40 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2 text-blue-400 font-semibold text-sm">
          <Info className="w-4 h-4" />
          제출 가이드
        </div>
        <ul className="space-y-1">
          {sections.guide.map((g, i) => (
            <li key={i} className="text-sm text-slate-300 flex gap-2">
              <span className="text-blue-400 shrink-0">{i + 1}.</span>
              {g}
            </li>
          ))}
        </ul>
      </div>

      {isSubmitted && (
        <div className="flex items-center gap-2 bg-emerald-900/30 border border-emerald-700/40 rounded-xl p-4 text-emerald-400 text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          최종 제출이 완료되었습니다.
          {draft?.submittedAt && (
            <span className="text-emerald-500/70 text-xs ml-auto">
              {new Date(draft.submittedAt).toLocaleString('ko-KR')}
            </span>
          )}
        </div>
      )}

      {/* Form */}
      <div className="space-y-4">
        {sections.submissionItems ? (
          sections.submissionItems.map((item) => (
            <div key={item.key}>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                {item.title}
              </label>
              {item.format === 'text_or_url' ? (
                <textarea
                  value={form.plan}
                  onChange={(e) => setForm((p) => ({ ...p, plan: e.target.value }))}
                  disabled={isSubmitted}
                  rows={3}
                  placeholder="기획서 내용 또는 URL을 입력하세요"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500 disabled:opacity-50 resize-none"
                />
              ) : (
                <input
                  type="url"
                  value={item.key === 'web' ? form.url : form.pdfUrl}
                  onChange={(e) =>
                    setForm((p) =>
                      item.key === 'web'
                        ? { ...p, url: e.target.value }
                        : { ...p, pdfUrl: e.target.value }
                    )
                  }
                  disabled={isSubmitted}
                  placeholder={`https://`}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500 disabled:opacity-50"
                />
              )}
            </div>
          ))
        ) : (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              제출물 URL / 파일명
            </label>
            <input
              type="text"
              value={form.url}
              onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
              disabled={isSubmitted}
              placeholder="제출물 URL 또는 파일명 입력"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500 disabled:opacity-50"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            메모 (선택)
          </label>
          <textarea
            value={form.memo}
            onChange={(e) => setForm((p) => ({ ...p, memo: e.target.value }))}
            disabled={isSubmitted}
            rows={2}
            placeholder="제출에 대한 메모를 남기세요"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500 disabled:opacity-50 resize-none"
          />
        </div>

        {draft?.savedAt && !isSubmitted && (
          <p className="text-xs text-slate-500">
            마지막 임시저장: {new Date(draft.savedAt).toLocaleString('ko-KR')}
          </p>
        )}

        {!isSubmitted && (
          <div className="flex gap-3">
            <button
              onClick={() => handleSave('draft')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm rounded-lg transition-all font-medium"
            >
              <Save className="w-4 h-4" />
              {saved === 'saving' ? '저장 중...' : saved === 'draft-saved' ? '저장됨 ✓' : '임시저장'}
            </button>
            <button
              onClick={() => handleSave('submitted')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-all font-medium"
            >
              <Send className="w-4 h-4" />
              최종 제출
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
}: {
  slug: string;
  note: string;
}) {
  const lb = SEED_LEADERBOARDS[slug];

  if (!lb) {
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
        <AlertCircle className="w-3.5 h-3.5" />
        {note}
      </p>

      {/* Top 3 Podium */}
      {lb.entries.length >= 2 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[1, 0, 2].map((idx) => {
            const entry = lb.entries[idx];
            if (!entry) return <div key={idx} />;
            const rank = idx + 1;
            const actualRank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
            const e = lb.entries.find((x) => x.rank === actualRank);
            if (!e) return <div key={idx} />;
            return (
              <div
                key={e.rank}
                className={`bg-slate-800 border rounded-xl p-4 text-center ${
                  e.rank === 1
                    ? 'border-yellow-500/40 bg-yellow-500/5'
                    : e.rank === 2
                    ? 'border-slate-500/40'
                    : 'border-amber-700/30'
                }`}
              >
                <div className="text-2xl mb-1">{MEDAL[e.rank]}</div>
                <div className="font-bold text-white text-sm">{e.teamName}</div>
                <div className="text-xs text-slate-400 mt-1">
                  {typeof e.score === 'number' && e.score < 2
                    ? e.score.toFixed(4)
                    : e.score.toFixed(1)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800/60 text-slate-400 text-xs uppercase">
              <th className="py-3 px-4 text-left">순위</th>
              <th className="py-3 px-4 text-left">팀</th>
              <th className="py-3 px-4 text-right">점수</th>
              {lb.entries[0]?.scoreBreakdown && (
                <>
                  <th className="py-3 px-4 text-right hidden sm:table-cell">
                    참가자(30%)
                  </th>
                  <th className="py-3 px-4 text-right hidden sm:table-cell">
                    심사위원(70%)
                  </th>
                </>
              )}
              <th className="py-3 px-4 text-right hidden md:table-cell">제출일</th>
              <th className="py-3 px-4 text-right hidden md:table-cell">산출물</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {lb.entries.map((e) => (
              <tr
                key={e.rank}
                className="hover:bg-slate-800/40 transition-colors"
              >
                <td className="py-3 px-4 font-bold text-slate-300">
                  {MEDAL[e.rank] ?? `#${e.rank}`}
                </td>
                <td className="py-3 px-4 font-semibold text-white">
                  {e.teamName}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-200">
                  {typeof e.score === 'number' && e.score < 2
                    ? e.score.toFixed(4)
                    : e.score.toFixed(1)}
                </td>
                {e.scoreBreakdown && (
                  <>
                    <td className="py-3 px-4 text-right text-slate-400 hidden sm:table-cell">
                      {e.scoreBreakdown.participant}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 hidden sm:table-cell">
                      {e.scoreBreakdown.judge}
                    </td>
                  </>
                )}
                <td className="py-3 px-4 text-right text-xs text-slate-500 hidden md:table-cell">
                  {new Date(e.submittedAt).toLocaleDateString('ko-KR')}
                </td>
                <td className="py-3 px-4 text-right hidden md:table-cell">
                  {e.artifacts?.webUrl && (
                    <a
                      href={e.artifacts.webUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 underline"
                    >
                      웹사이트
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500 text-right">
        업데이트: {new Date(lb.updatedAt).toLocaleString('ko-KR')}
      </p>
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
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    setTeams(getTeams());
  }, []);

  const hackathon = HACKATHONS.find((h) => h.slug === slug);
  const detail = HACKATHON_DETAILS[slug];

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
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

  const sections = detail?.sections;
  const filteredTeams = teams.filter((t) => t.hackathonSlug === slug);

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
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 mb-5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          해커톤 목록
        </button>

        {/* Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-5">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <StatusBadge status={hackathon.status} />
            {hackathon.tags.map((tag) => (
              <span
                key={tag}
                className="bg-slate-800 border border-slate-700 text-xs px-2 py-0.5 rounded-full text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-2xl font-bold text-white mb-4 leading-snug">
            {hackathon.title}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              제출 마감:{' '}
              {new Date(hackathon.period.submissionDeadlineAt).toLocaleDateString('ko-KR')}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              대회 종료:{' '}
              {new Date(hackathon.period.endAt).toLocaleDateString('ko-KR')}
            </div>
            {hackathon.status !== 'ended' && (
              <CountdownTimer
                deadline={hackathon.period.submissionDeadlineAt}
                label="제출 마감"
              />
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="overflow-x-auto mb-6">
          <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 min-w-max">
            {TABS.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === key
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {!detail ? (
          <EmptyState
            title="상세 데이터가 없습니다"
            description="이 해커톤의 상세 정보가 아직 제공되지 않았습니다."
          />
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold">개요</h2>
                <p className="text-slate-300 leading-relaxed">
                  {sections.overview.summary}
                </p>
                <div className="bg-slate-800 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-slate-300 mb-2">팀 구성 정책</h3>
                  <ul className="text-sm text-slate-400 space-y-1">
                    <li>
                      개인 참가:{' '}
                      <span className="text-slate-200">
                        {sections.overview.teamPolicy.allowSolo ? '가능' : '불가'}
                      </span>
                    </li>
                    <li>
                      최대 팀원 수:{' '}
                      <span className="text-slate-200">
                        {sections.overview.teamPolicy.maxTeamSize}명
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'info' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold">안내사항</h2>
                <ul className="space-y-2">
                  {sections.info.notice.map((n, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-sm text-slate-300 bg-slate-800 rounded-lg p-3"
                    >
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      {n}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-3 mt-4">
                  <a
                    href={sections.info.links.rules}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    규정 보기
                  </a>
                  <a
                    href={sections.info.links.faq}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    FAQ 보기
                  </a>
                </div>
              </div>
            )}

            {activeTab === 'eval' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold">평가 기준</h2>
                <div className="bg-slate-800 rounded-xl p-4">
                  <div className="text-sm font-semibold text-slate-300 mb-1">
                    지표: {sections.eval.metricName}
                  </div>
                  <p className="text-sm text-slate-400">{sections.eval.description}</p>
                </div>
                {sections.eval.scoreDisplay && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 mb-3">
                      점수 구성 ({sections.eval.scoreDisplay.label})
                    </h3>
                    <div className="space-y-3">
                      {sections.eval.scoreDisplay.breakdown.map((b) => (
                        <div key={b.key}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-300">{b.label}</span>
                            <span className="text-slate-400">{b.weightPercent}%</span>
                          </div>
                          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${b.weightPercent}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {sections.eval.limits && (
                  <div className="bg-slate-800 rounded-xl p-4 text-sm text-slate-400 space-y-1">
                    <div>
                      최대 실행 시간: {sections.eval.limits.maxRuntimeSec}초
                    </div>
                    <div>
                      일일 최대 제출: {sections.eval.limits.maxSubmissionsPerDay}회
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'prize' && sections.prize && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold">시상 내역</h2>
                <div className="space-y-3">
                  {sections.prize.items.map((p) => (
                    <div
                      key={p.place}
                      className="flex items-center justify-between bg-slate-800 rounded-xl p-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {p.place === '1st'
                            ? '🥇'
                            : p.place === '2nd'
                            ? '🥈'
                            : p.place === '3rd'
                            ? '🥉'
                            : '🏅'}
                        </span>
                        <span className="font-semibold text-white">{p.place}</span>
                      </div>
                      <span className="text-lg font-bold text-emerald-400">
                        {formatKRW(p.amountKRW)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold">일정</h2>
                <MilestoneTimeline milestones={sections.schedule.milestones} />
              </div>
            )}

            {activeTab === 'teams' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">팀 목록</h2>
                  <Link
                    href={`/camp?hackathon=${slug}`}
                    className="text-sm text-blue-400 hover:text-blue-300 underline"
                  >
                    팀 모집 페이지 →
                  </Link>
                </div>
                {filteredTeams.length === 0 ? (
                  <EmptyState
                    title="등록된 팀이 없습니다"
                    description="아직 이 해커톤에 팀을 만든 참가자가 없습니다."
                    action={{
                      label: '팀 만들기',
                      onClick: () => router.push(`/camp?hackathon=${slug}`),
                    }}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredTeams.map((t) => (
                      <TeamCard key={t.teamCode} team={t} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'submit' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold">제출</h2>
                <SubmitSection slug={slug} sections={sections.submit} />
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold">리더보드</h2>
                <LeaderboardSection
                  slug={slug}
                  note={sections.leaderboard.note}
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
