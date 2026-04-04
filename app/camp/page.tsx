'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, X, ExternalLink, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import EmptyState from '@/components/EmptyState';
import { HACKATHONS, ALL_POSITIONS } from '@/lib/data';
import { getTeams, addTeam, updateTeamOpenStatus, getTeamAction, setTeamAction } from '@/lib/storage';
import type { Team } from '@/lib/types';

function TeamCard({
  team,
  onStatusChange,
}: {
  team: Team;
  onStatusChange: () => void;
}) {
  const [action, setActionState] = useState<'applied' | 'accepted' | null>(null);

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

  const hackathon = HACKATHONS.find((h) => h.slug === team.hackathonSlug);

  return (
    <article className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col h-full">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-white text-base">{team.name}</h3>
          {hackathon && (
            <Link
              href={`/hackathons/${hackathon.slug}`}
              className="text-xs text-blue-400 hover:text-blue-300 underline mt-0.5 block"
            >
              {hackathon.title}
            </Link>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
              team.isOpen
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-700/60 text-slate-500 border-slate-600/40'
            }`}
          >
            {team.isOpen ? '모집중' : '모집마감'}
          </span>
          {team.isLocal && (
            <span className="text-xs text-slate-500 border border-slate-700 rounded-full px-2 py-0.5">
              내 팀
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-slate-400 mb-3 leading-relaxed flex-1">{team.intro}</p>

      <div className="mb-3">
        <p className="text-xs text-slate-500 mb-1.5">모집 포지션</p>
        <div className="flex flex-wrap gap-1.5">
          {team.lookingFor.length > 0 ? (
            team.lookingFor.map((pos) => (
              <span
                key={pos}
                className="bg-slate-800 border border-slate-700 text-xs px-2 py-0.5 rounded-full text-slate-300"
              >
                {pos}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-500">포지션 모집 없음</span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-800">
        <span className="text-xs text-slate-500">현재 {team.memberCount}명</span>
        <div className="flex items-center gap-2">
          {team.isLocal && (
            <button
              onClick={() => {
                updateTeamOpenStatus(team.teamCode, !team.isOpen);
                onStatusChange();
              }}
              className="text-xs px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-all"
            >
              {team.isOpen ? '모집 마감' : '모집 재개'}
            </button>
          )}
          {team.isOpen && !team.isLocal && (
            <>
              <a
                href={team.contact.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
              >
                연락하기
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={handleApply}
                className={`text-xs px-3 py-1 rounded-lg transition-all font-medium ${
                  action === 'applied'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                {action === 'applied' ? '지원완료 ✓' : '지원하기'}
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

function CreateTeamForm({
  defaultHackathon,
  onCreated,
  onClose,
}: {
  defaultHackathon?: string;
  onCreated: () => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: '',
    hackathonSlug: defaultHackathon ?? '',
    intro: '',
    lookingFor: [] as string[],
    contactUrl: '',
    memberCount: 1,
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
    if (!form.hackathonSlug) errs.hackathon = '해커톤을 선택해주세요.';
    if (!form.intro.trim()) errs.intro = '팀 소개를 입력해주세요.';
    if (!form.contactUrl.trim()) errs.contactUrl = '연락처 URL을 입력해주세요.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    addTeam({
      hackathonSlug: form.hackathonSlug,
      name: form.name.trim(),
      isOpen: true,
      memberCount: form.memberCount,
      lookingFor: form.lookingFor,
      intro: form.intro.trim(),
      contact: { type: 'link', url: form.contactUrl.trim() },
    });
    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h2 className="text-lg font-bold">팀 만들기</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              팀 이름 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="팀 이름을 입력하세요"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500"
            />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              해커톤 <span className="text-red-400">*</span>
            </label>
            <select
              value={form.hackathonSlug}
              onChange={(e) =>
                setForm((p) => ({ ...p, hackathonSlug: e.target.value }))
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-500"
            >
              <option value="">해커톤 선택</option>
              {HACKATHONS.map((h) => (
                <option key={h.slug} value={h.slug}>
                  {h.title}
                </option>
              ))}
            </select>
            {errors.hackathon && (
              <p className="text-xs text-red-400 mt-1">{errors.hackathon}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              팀 소개 <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.intro}
              onChange={(e) => setForm((p) => ({ ...p, intro: e.target.value }))}
              rows={3}
              placeholder="팀 목표, 진행 방식, 원하는 팀원 등을 소개해주세요"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500 resize-none"
            />
            {errors.intro && <p className="text-xs text-red-400 mt-1">{errors.intro}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              현재 팀원 수
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={form.memberCount}
              onChange={(e) =>
                setForm((p) => ({ ...p, memberCount: Number(e.target.value) }))
              }
              className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              모집 포지션 (복수 선택)
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_POSITIONS.map((pos) => (
                <button
                  type="button"
                  key={pos}
                  onClick={() => togglePosition(pos)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    form.lookingFor.includes(pos)
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              연락처 URL <span className="text-red-400">*</span>
            </label>
            <input
              type="url"
              value={form.contactUrl}
              onChange={(e) =>
                setForm((p) => ({ ...p, contactUrl: e.target.value }))
              }
              placeholder="https://open.kakao.com/... 또는 https://forms.gle/..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500"
            />
            {errors.contactUrl && (
              <p className="text-xs text-red-400 mt-1">{errors.contactUrl}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-xl transition-all font-medium"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-xl transition-all font-medium"
            >
              팀 생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CampContent() {
  const searchParams = useSearchParams();
  const hackathonFilter = searchParams.get('hackathon') ?? 'all';

  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedHackathon, setSelectedHackathon] =
    useState<string>(hackathonFilter);
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [openOnly, setOpenOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setTeams(getTeams());
  }, []);

  function refreshTeams() {
    setTeams(getTeams());
  }

  const filtered = useMemo(() => {
    return teams.filter((t) => {
      if (selectedHackathon !== 'all' && t.hackathonSlug !== selectedHackathon)
        return false;
      if (positionFilter !== 'all' && !t.lookingFor.includes(positionFilter))
        return false;
      if (openOnly && !t.isOpen) return false;
      return true;
    });
  }, [teams, selectedHackathon, positionFilter, openOnly]);

  const hasFilter =
    selectedHackathon !== 'all' || positionFilter !== 'all' || openOnly;

  function resetFilters() {
    setSelectedHackathon('all');
    setPositionFilter('all');
    setOpenOnly(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      {showForm && (
        <CreateTeamForm
          defaultHackathon={
            selectedHackathon !== 'all' ? selectedHackathon : undefined
          }
          onCreated={refreshTeams}
          onClose={() => setShowForm(false)}
        />
      )}

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">팀 찾기</h1>
            <p className="text-slate-400 text-sm">
              총 {teams.length}개 팀 · 조건에 맞는 {filtered.length}개 표시 중
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-xl transition-all font-medium"
          >
            <Plus className="w-4 h-4" />
            팀 만들기
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-slate-900 rounded-xl border border-slate-800">
          <select
            value={selectedHackathon}
            onChange={(e) => setSelectedHackathon(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 cursor-pointer focus:outline-none focus:border-slate-500"
          >
            <option value="all">전체 해커톤</option>
            {HACKATHONS.map((h) => (
              <option key={h.slug} value={h.slug}>
                {h.title}
              </option>
            ))}
          </select>

          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 cursor-pointer focus:outline-none focus:border-slate-500"
          >
            <option value="all">전체 포지션</option>
            {ALL_POSITIONS.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={openOnly}
              onChange={(e) => setOpenOnly(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 cursor-pointer"
            />
            모집중만 보기
          </label>

          {hasFilter && (
            <button
              onClick={resetFilters}
              className="text-xs text-slate-400 underline underline-offset-2 hover:text-slate-200 transition-colors ml-auto"
            >
              필터 초기화
            </button>
          )}
        </div>

        {/* Team Grid */}
        {filtered.length === 0 ? (
          <EmptyState
            title="조건에 맞는 팀이 없습니다"
            description={
              hasFilter
                ? '다른 조건으로 검색하거나 직접 팀을 만들어보세요.'
                : '아직 등록된 팀이 없습니다. 첫 번째 팀을 만들어보세요!'
            }
            action={{
              label: hasFilter ? '필터 초기화' : '팀 만들기',
              onClick: hasFilter ? resetFilters : () => setShowForm(true),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((team) => (
              <TeamCard key={team.teamCode} team={team} onStatusChange={refreshTeams} />
            ))}
          </div>
        )}

        {/* 팀 없을 때 안내 배너 */}
        {filtered.length > 0 && (
          <div className="mt-8 bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">원하는 팀을 못 찾으셨나요?</p>
                <p className="text-xs text-slate-400">직접 팀을 만들고 팀원을 모집해보세요.</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-all font-medium"
            >
              <Plus className="w-4 h-4" />
              팀 만들기
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CampPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <CampContent />
    </Suspense>
  );
}
