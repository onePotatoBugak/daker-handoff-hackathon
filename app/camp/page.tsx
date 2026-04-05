'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, X, ExternalLink, Users, Pencil } from 'lucide-react';
import Navbar from '@/components/Navbar';
import EmptyState from '@/components/EmptyState';
import { SkeletonCard } from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import { fetchCampData } from '@/lib/api';
import { getTeams, addTeam, updateTeam, updateTeamOpenStatus, getTeamAction, setTeamAction } from '@/lib/storage';
import type { TeamAction } from '@/lib/storage';
import { useAsync } from '@/hooks/useAsync';
import type { Hackathon, Team } from '@/lib/types';

// ── 팀 카드 ──────────────────────────────────────────────────────────────

function TeamCard({
  team,
  hackathons,
  onStatusChange,
  onEdit,
}: {
  team: Team;
  hackathons: Hackathon[];
  onStatusChange: () => void;
  onEdit: (team: Team) => void;
}) {
  const [action, setActionState] = useState<TeamAction | null>(null);

  useEffect(() => {
    setActionState(getTeamAction(team.teamCode));
  }, [team.teamCode]);

  function handleApply() {
    if (action === 'applied') {
      setTeamAction(team.teamCode, null);
      setActionState(null);
    } else {
      setTeamAction(team.teamCode, 'applied');
      setActionState('applied');
    }
  }

  const hackathon = team.hackathonSlug
    ? hackathons.find((h) => h.slug === team.hackathonSlug)
    : null;

  return (
    <article className="light-card p-5 flex flex-col h-full">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="font-bold text-slate-800 text-base truncate">{team.name}</h3>
          {hackathon ? (
            <Link href={`/hackathons/${hackathon.slug}`}
              className="text-xs text-violet-500 hover:text-violet-700 underline mt-0.5 block truncate">
              {hackathon.title}
            </Link>
          ) : (
            <span className="text-xs text-slate-400 mt-0.5 block">해커톤 미지정</span>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
            team.isOpen
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-100 text-slate-400 border-slate-200'
          }`}>
            {team.isOpen ? '모집중' : '모집마감'}
          </span>
          {team.isLocal && (
            <span className="text-xs text-violet-500 border border-violet-200 bg-violet-50 rounded-full px-2 py-0.5">
              내 팀
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-slate-500 mb-3 leading-relaxed flex-1">{team.intro}</p>

      <div className="mb-3">
        <p className="text-xs text-slate-400 mb-1.5">모집 포지션</p>
        <div className="flex flex-wrap gap-1.5">
          {team.lookingFor.length > 0 ? (
            team.lookingFor.map((pos) => (
              <span key={pos} className="bg-violet-50 border border-violet-100 text-xs px-2 py-0.5 rounded-full text-violet-600">
                {pos}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400">포지션 모집 없음</span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-400">현재 {team.memberCount}명</span>
        <div className="flex items-center gap-2">
          {team.isLocal && (
            <>
              <button onClick={() => onEdit(team)}
                className="flex items-center gap-1 text-xs px-2.5 py-1 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-lg transition-all border border-violet-100">
                <Pencil className="w-3 h-3" />수정
              </button>
              <button
                onClick={() => { updateTeamOpenStatus(team.teamCode, !team.isOpen); onStatusChange(); }}
                className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all">
                {team.isOpen ? '모집 마감' : '재개'}
              </button>
            </>
          )}
          {hackathon?.status === 'ended' && !team.isLocal && (
            <span className="text-xs text-slate-400">해커톤 종료</span>
          )}
          {team.isOpen && !team.isLocal && hackathon?.status !== 'ended' && (
            <>
              <a href={team.contact.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-violet-600 transition-colors">
                연락하기<ExternalLink className="w-3 h-3" />
              </a>
              <button onClick={handleApply}
                className={`text-xs px-3 py-1 rounded-lg transition-all font-semibold ${
                  action === 'applied'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-violet-600 hover:bg-violet-700 text-white'
                }`}>
                {action === 'applied' ? '지원완료 ✓' : '지원하기'}
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

// ── 팀 생성/수정 폼 ──────────────────────────────────────────────────────

function TeamForm({
  defaultHackathon,
  editTarget,
  hackathons,
  positions,
  onDone,
  onClose,
}: {
  defaultHackathon?: string;
  editTarget?: Team;
  hackathons: Hackathon[];
  positions: string[];
  onDone: () => void;
  onClose: () => void;
}) {
  const isEdit = !!editTarget;
  const [form, setForm] = useState({
    name: editTarget?.name ?? '',
    hackathonSlug: editTarget?.hackathonSlug ?? defaultHackathon ?? '',
    intro: editTarget?.intro ?? '',
    lookingFor: editTarget?.lookingFor ?? ([] as string[]),
    contactUrl: editTarget?.contact.url ?? '',
    memberCount: editTarget?.memberCount ?? 1,
    isOpen: editTarget?.isOpen ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function togglePosition(pos: string) {
    setForm((p) => ({
      ...p,
      lookingFor: p.lookingFor.includes(pos)
        ? p.lookingFor.filter((x) => x !== pos)
        : [...p.lookingFor, pos],
    }));
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = '팀 이름을 입력해주세요.';
    if (!form.intro.trim()) errs.intro = '팀 소개를 입력해주세요.';
    if (!form.contactUrl.trim()) errs.contactUrl = '연락처 URL을 입력해주세요.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    if (isEdit && editTarget) {
      updateTeam(editTarget.teamCode, {
        name: form.name.trim(),
        hackathonSlug: form.hackathonSlug || '',
        intro: form.intro.trim(),
        lookingFor: form.lookingFor,
        contact: { type: 'link', url: form.contactUrl.trim() },
        memberCount: form.memberCount,
        isOpen: form.isOpen,
      });
    } else {
      addTeam({
        hackathonSlug: form.hackathonSlug || '',
        name: form.name.trim(),
        isOpen: form.isOpen,
        memberCount: form.memberCount,
        lookingFor: form.lookingFor,
        intro: form.intro.trim(),
        contact: { type: 'link', url: form.contactUrl.trim() },
      });
    }
    onDone();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white border border-violet-100 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">{isEdit ? '팀 수정' : '팀 만들기'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              팀 이름 <span className="text-red-500">*</span>
            </label>
            <input type="text" value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="팀 이름을 입력하세요"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-100" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              해커톤 <span className="text-slate-400 text-xs font-normal">(선택사항)</span>
            </label>
            <select value={form.hackathonSlug}
              onChange={(e) => setForm((p) => ({ ...p, hackathonSlug: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-violet-400">
              <option value="">연결 안 함</option>
              {hackathons.map((h) => <option key={h.slug} value={h.slug}>{h.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              모집 상태 <span className="text-red-500">*</span>
            </label>
            <select
              value={form.isOpen ? 'true' : 'false'}
              onChange={(e) => setForm((p) => ({ ...p, isOpen: e.target.value === 'true' }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-violet-400"
            >
              <option value="true">모집 중</option>
              <option value="false">모집 마감</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1 ml-1">팀원 모집을 잠시 멈추려면 '모집 마감'으로 설정하세요.</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              팀 소개 <span className="text-red-500">*</span>
            </label>
            <textarea value={form.intro}
              onChange={(e) => setForm((p) => ({ ...p, intro: e.target.value }))}
              rows={3} placeholder="팀 목표, 진행 방식, 원하는 팀원 등을 소개해주세요"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-violet-400 resize-none" />
            {errors.intro && <p className="text-xs text-red-500 mt-1">{errors.intro}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">현재 팀원 수</label>
            <input type="number" min={1} max={10} value={form.memberCount}
              onChange={(e) => setForm((p) => ({ ...p, memberCount: Number(e.target.value) }))}
              className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-violet-400" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              모집 포지션 <span className="text-slate-400 text-xs font-normal">(복수 선택)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {positions.map((pos) => (
                <button type="button" key={pos} onClick={() => togglePosition(pos)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    form.lookingFor.includes(pos)
                      ? 'bg-violet-600 border-violet-500 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-violet-300'
                  }`}>
                  {pos}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              연락처 URL <span className="text-red-500">*</span>
            </label>
            <input type="url" value={form.contactUrl}
              onChange={(e) => setForm((p) => ({ ...p, contactUrl: e.target.value }))}
              placeholder="https://open.kakao.com/... 또는 https://forms.gle/..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-violet-400" />
            {errors.contactUrl && <p className="text-xs text-red-500 mt-1">{errors.contactUrl}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm rounded-xl transition-all font-semibold">
              취소
            </button>
            <button type="submit"
              className="flex-1 py-2.5 text-white text-sm rounded-xl transition-all font-semibold hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #6d28d9, #4f46e5)' }}>
              {isEdit ? '수정 완료' : '팀 생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── 메인 페이지 ──────────────────────────────────────────────────────────

function CampContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hackathonFilter = searchParams.get('hackathon') ?? 'all';

  const { data, loading, error, retry } = useAsync(fetchCampData);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedHackathon, setSelectedHackathon] = useState<string>(hackathonFilter);
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [openOnly, setOpenOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Team | undefined>(undefined);

  // URL 파라미터 변경 감지 및 상태 동기화
  useEffect(() => {
    const h = searchParams.get('hackathon') ?? 'all';
    setSelectedHackathon(h);
  }, [searchParams]);

  // 데이터 로드 완료 후 teams 초기화
  useEffect(() => {
    if (data) setTeams(data.teams);
  }, [data]);

  const hackathons = data?.hackathons ?? [];
  const positions = data?.positions ?? [];
  const availableHackathons = useMemo(
    () => hackathons.filter((hackathon) => hackathon.status !== 'ended'),
    [hackathons]
  );
  const endedHackathonSlugs = useMemo(
    () => new Set(hackathons.filter((hackathon) => hackathon.status === 'ended').map((hackathon) => hackathon.slug)),
    [hackathons]
  );
  const visibleTeams = useMemo(
    () => teams.filter((team) => !team.hackathonSlug || !endedHackathonSlugs.has(team.hackathonSlug)),
    [teams, endedHackathonSlugs]
  );

  function refreshTeams() {
    setTeams(getTeams());
  }

  // 필터 변경 핸들러: URL도 함께 업데이트
  function handleHackathonChange(slug: string) {
    setSelectedHackathon(slug);
    const params = new URLSearchParams(searchParams.toString());
    if (slug === 'all') {
      params.delete('hackathon');
    } else {
      params.set('hackathon', slug);
    }
    router.push(`/camp?${params.toString()}`, { scroll: false });
  }

  const filtered = useMemo(() => {
    return visibleTeams.filter((t) => {
      if (selectedHackathon !== 'all') {
        if (selectedHackathon === 'none') {
          if (t.hackathonSlug) return false;
        } else {
          if (t.hackathonSlug !== selectedHackathon) return false;
        }
      }
      if (positionFilter !== 'all' && !t.lookingFor.includes(positionFilter))
        return false;
      if (openOnly && !t.isOpen) return false;
      return true;
    });
  }, [visibleTeams, selectedHackathon, positionFilter, openOnly]);

  const hasFilter = selectedHackathon !== 'all' || positionFilter !== 'all' || openOnly;

  function resetFilters() {
    handleHackathonChange('all');
    setPositionFilter('all');
    setOpenOnly(false);
  }

  function openCreate() {
    setEditTarget(undefined);
    setShowForm(true);
  }

  function openEdit(team: Team) {
    setEditTarget(team);
    setShowForm(true);
  }

  return (
    <div className="min-h-screen" style={{ background: '#f5f3ff' }}>
      <Navbar />
      {showForm && (
        <TeamForm
          defaultHackathon={
            selectedHackathon !== 'all' && selectedHackathon !== 'none'
              ? selectedHackathon
              : undefined
          }
          editTarget={editTarget}
          hackathons={hackathons}
          positions={positions}
          onDone={refreshTeams}
          onClose={() => { setShowForm(false); setEditTarget(undefined); }}
        />
      )}

      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <p className="text-xs text-violet-400 uppercase tracking-[0.3em] font-bold mb-2">TEAM FINDER</p>
          <h1 className="text-4xl font-black text-slate-800">팀 찾기</h1>
          <p className="text-slate-500 text-sm mt-1.5">
            총 <span className="text-violet-700 font-semibold">{visibleTeams.length}개</span> 팀 ·
            조건에 맞는 <span className="text-violet-700 font-semibold">{filtered.length}개</span> 표시 중
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-7 p-5 rounded-2xl bg-white border border-violet-100 shadow-sm">
          <select value={selectedHackathon} onChange={(e) => handleHackathonChange(e.target.value)}
            className="text-sm px-3 py-1.5 rounded-lg cursor-pointer focus:outline-none"
            style={{ background: '#f5f3ff', color: '#64748b', border: '1px solid #e2e8f0' }}>
            <option value="all">전체 해커톤</option>
            {availableHackathons.map((h) => <option key={h.slug} value={h.slug}>{h.title}</option>)}
          </select>

          <select value={positionFilter} onChange={(e) => setPositionFilter(e.target.value)}
            className="text-sm px-3 py-1.5 rounded-lg cursor-pointer focus:outline-none"
            style={{ background: '#f5f3ff', color: '#64748b', border: '1px solid #e2e8f0' }}>
            <option value="all">전체 포지션</option>
            {positions.map((pos) => <option key={pos} value={pos}>{pos}</option>)}
          </select>

          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)}
              className="w-4 h-4 rounded border-violet-300 cursor-pointer accent-violet-600" />
            모집중만 보기
          </label>

          {hasFilter && (
            <button onClick={resetFilters}
              className="text-xs text-violet-500 underline underline-offset-2 hover:text-violet-700 transition-colors ml-auto">
              필터 초기화
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <ErrorState description="팀 목록을 불러오는 중 오류가 발생했습니다." onRetry={retry} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="조건에 맞는 팀이 없습니다"
            description={hasFilter ? '다른 조건으로 검색하거나 직접 팀을 만들어보세요.' : '아직 등록된 팀이 없습니다. 첫 번째 팀을 만들어보세요!'}
            action={{ label: hasFilter ? '필터 초기화' : '팀 만들기', onClick: hasFilter ? resetFilters : openCreate }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((team) => (
              <TeamCard key={team.teamCode} team={team} hackathons={hackathons} onStatusChange={refreshTeams} onEdit={openEdit} />
            ))}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="mt-8 bg-white border border-violet-100 rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">원하는 팀을 못 찾으셨나요?</p>
                <p className="text-xs text-slate-500">직접 팀을 만들고 팀원을 모집해보세요.</p>
              </div>
            </div>
            <button onClick={openCreate}
              className="flex items-center gap-1.5 px-4 py-2 text-white text-sm rounded-xl transition-all font-semibold hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #6d28d9, #4f46e5)' }}>
              <Plus className="w-4 h-4" />팀 만들기
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CampPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: '#f5f3ff' }} />}>
      <CampContent />
    </Suspense>
  );
}
