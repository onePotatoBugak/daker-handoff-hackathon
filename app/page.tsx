"use client";
import React from "react";
import Link from "next/link";
import {
    Trophy,
    Users,
    Rocket,
    ChevronRight,
    ArrowRight,
    Star,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import CountdownTimer from "@/components/CountdownTimer";
import ErrorState from "@/components/ErrorState";
import { fetchHomeData } from "@/lib/api";
import { useAsync } from "@/hooks/useAsync";

const NAV_CARDS = [
    {
        title: "해커톤 보러가기",
        description: "진행 중인 해커톤을 탐색하고 여정에 참여 하세요!",
        href: "/hackathons",
        icon: <Rocket className="w-6 h-6" />,
        color: "#7c3aed",
        bg: "rgba(124,58,237,0.08)",
        border: "rgba(124,58,237,0.2)",
    },
    {
        title: "팀 찾기",
        description:
            "기존의 팀에 참가하거나, 내 팀을 만들어 지원자를 모집하세요!",
        href: "/camp",
        icon: <Users className="w-6 h-6" />,
        color: "#2563eb",
        bg: "rgba(37,99,235,0.08)",
        border: "rgba(37,99,235,0.2)",
    },
    {
        title: "랭킹 보기",
        description: "전체 해커톤 랭킹을 확인하고 상위권에 도전하세요!",
        href: "/rankings",
        icon: <Trophy className="w-6 h-6" />,
        color: "#db2777",
        bg: "rgba(219,39,119,0.08)",
        border: "rgba(219,39,119,0.2)",
    },
];

/* ── Whale Space 스타일: 오른쪽 집중 배치 글로시 오브젝트 ── */
function HeroOrbs() {
    return (
        <>
            {/* ── 배경 mesh gradient (색감 레이어) ── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* 왼쪽 하단: 코랄/핑크 warm */}
                <div
                    style={{
                        position: "absolute",
                        bottom: "-20%",
                        left: "-10%",
                        width: "60%",
                        height: "80%",
                        background:
                            "radial-gradient(ellipse, rgba(249,168,212,0.55) 0%, rgba(244,114,182,0.3) 35%, transparent 65%)",
                        filter: "blur(55px)",
                    }}
                />
                {/* 중앙: 라벤더/보라 */}
                <div
                    style={{
                        position: "absolute",
                        top: "10%",
                        left: "20%",
                        width: "55%",
                        height: "70%",
                        background:
                            "radial-gradient(ellipse, rgba(196,181,253,0.45) 0%, rgba(167,139,250,0.2) 45%, transparent 70%)",
                        filter: "blur(60px)",
                    }}
                />
                {/* 오른쪽 상단: 청록/사이안 cool */}
                <div
                    style={{
                        position: "absolute",
                        top: "-15%",
                        right: "-5%",
                        width: "55%",
                        height: "75%",
                        background:
                            "radial-gradient(ellipse, rgba(125,211,252,0.5) 0%, rgba(56,189,248,0.25) 40%, transparent 68%)",
                        filter: "blur(55px)",
                    }}
                />
            </div>

            {/* ── 메인 오브: 오른쪽 중앙 — 대형 보라/핑크 글로시 구체 ── */}
            <div
                className="blob-float-a absolute pointer-events-none"
                style={{
                    top: "50%",
                    right: "8%",
                    transform: "translateY(-50%)",
                    width: "230px",
                    height: "230px",
                    borderRadius: "50%",
                    background: `
            radial-gradient(circle at 35% 28%,
              rgba(255,255,255,0.95) 0%,
              rgba(243,232,255,0.9) 12%,
              rgba(216,180,254,0.8) 28%,
              rgba(167,139,250,0.85) 50%,
              rgba(124,58,237,0.75) 72%,
              rgba(91,33,182,0.55) 88%,
              rgba(76,29,149,0.3) 100%
            )`,
                    boxShadow: `
            0 24px 64px rgba(124,58,237,0.35),
            0 8px 24px rgba(124,58,237,0.2),
            inset -16px -16px 36px rgba(0,0,0,0.1),
            inset 8px 8px 24px rgba(255,255,255,0.7)
          `,
                }}
            />

            {/* ── 서브 오브 1: 오른쪽 상단 — 소형 하늘/청록 ── */}
            <div
                className="blob-float-b absolute pointer-events-none"
                style={{
                    top: "4%",
                    right: "28%",
                    width: "110px",
                    height: "110px",
                    borderRadius: "50%",
                    background: `
            radial-gradient(circle at 35% 28%,
              rgba(255,255,255,0.95) 0%,
              rgba(224,242,254,0.9) 15%,
              rgba(125,211,252,0.82) 38%,
              rgba(56,189,248,0.78) 62%,
              rgba(2,132,199,0.6) 82%,
              rgba(3,105,161,0.35) 100%
            )`,
                    boxShadow: `
            0 12px 36px rgba(56,189,248,0.3),
            inset -8px -8px 20px rgba(0,0,0,0.08),
            inset 5px 5px 14px rgba(255,255,255,0.7)
          `,
                }}
            />

            {/* ── 서브 오브 2: 오른쪽 하단 — 소형 핑크/코랄 ── */}
            <div
                className="blob-float-c absolute pointer-events-none"
                style={{
                    bottom: "8%",
                    right: "24%",
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: `
            radial-gradient(circle at 35% 28%,
              rgba(255,255,255,0.95) 0%,
              rgba(252,231,243,0.9) 15%,
              rgba(249,168,212,0.82) 38%,
              rgba(244,114,182,0.78) 62%,
              rgba(219,39,119,0.6) 82%,
              rgba(157,23,77,0.35) 100%
            )`,
                    boxShadow: `
            0 8px 28px rgba(244,114,182,0.3),
            inset -6px -6px 16px rgba(0,0,0,0.08),
            inset 4px 4px 10px rgba(255,255,255,0.7)
          `,
                }}
            />

            {/* ── 서브 오브 3: 텍스트 우측 — 중형 라벤더 (텍스트 방해 안 되는 위치) ── */}
            <div
                className="blob-float-d absolute pointer-events-none"
                style={{
                    top: "18%",
                    right: "38%",
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background: `
            radial-gradient(circle at 35% 28%,
              rgba(255,255,255,0.95) 0%,
              rgba(237,233,254,0.9) 20%,
              rgba(196,181,253,0.82) 45%,
              rgba(139,92,246,0.7) 72%,
              rgba(109,40,217,0.45) 100%
            )`,
                    boxShadow: `
            0 6px 20px rgba(139,92,246,0.25),
            inset -4px -4px 12px rgba(0,0,0,0.07),
            inset 3px 3px 8px rgba(255,255,255,0.7)
          `,
                }}
            />

            {/* ── 배경 후광: 메인 오브 뒤 글로우 ── */}
            <div
                className="blob-float-a absolute pointer-events-none"
                style={{
                    top: "50%",
                    right: "6%",
                    transform: "translateY(-50%)",
                    width: "310px",
                    height: "310px",
                    borderRadius: "50%",
                    background:
                        "radial-gradient(circle, rgba(167,139,250,0.18) 0%, rgba(196,181,253,0.08) 50%, transparent 72%)",
                    filter: "blur(20px)",
                }}
            />
        </>
    );
}

export default function App() {
    const { data, loading, error, retry } = useAsync(fetchHomeData);

    const featured = data?.featured ?? [];
    const stats = data
        ? [
              {
                  value: String(data.stats.hackathonCount),
                  label: "해커톤",
                  suffix: "개",
              },
              {
                  value: String(data.stats.teamCount),
                  label: "등록 팀",
                  suffix: "개+",
              },
              {
                  value: String(data.stats.submitCount),
                  label: "제출 기록",
                  suffix: "개",
              },
          ]
        : null;

    return (
        <div
            className="min-h-screen overflow-x-hidden"
            style={{ background: "#f8f7ff" }}
        >
            <Navbar />

            {/* ══════════════════════════════════════════
           Hero 섹션 — Whale Space 스타일
           코랄·핑크(좌하) → 라벤더(중) → 하늘·청록(우상)
           대각선 Mesh Gradient + 오른쪽 집중 글로시 오브젝트
      ══════════════════════════════════════════ */}
            <section
                className="relative overflow-hidden"
                style={{ minHeight: "480px" }}
            >
                {/* 배경: 대각선 Mesh Gradient ─ 웨일 스페이스 핵심 */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: `
            linear-gradient(
              118deg,
              #fce7f3 0%,
              #f9d4eb 8%,
              #ede9fe 28%,
              #ddd6fe 45%,
              #c7d2fe 62%,
              #bae6fd 78%,
              #e0f7fa 92%,
              #f0f9ff 100%
            )`,
                    }}
                />

                {/* Whale Space 스타일 오브젝트 (오른쪽 집중 배치) */}
                <HeroOrbs />

                {/* Hero 콘텐츠 — 왼쪽 정렬 유지 */}
                <div className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-20">
                    <div className="max-w-lg">
                        {/* 타이틀: 웨일 스페이스처럼 진한 텍스트 */}
                        <h1
                            className="text-5xl md:text-6xl font-black leading-[1.1] mb-5 mt-10"
                            style={{ color: "#1e1b4b" }}
                        >
                            해커톤을
                            <br />
                            <span
                                style={{
                                    background:
                                        "linear-gradient(130deg, #7c3aed 0%, #4f46e5 45%, #1d4ed8 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                }}
                            >
                                제대로 경험하다
                            </span>
                        </h1>

                        <p
                            className="text-base md:text-[17px] leading-relaxed mb-10"
                            style={{ color: "#4b5563" }}
                        >
                            당신의 해커톤 여정, <b>Now Your Thon</b> 과 함께.
                        </p>

                        {/* CTA */}
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/hackathons"
                                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm text-white transition-all hover:scale-[1.03] active:scale-100"
                                style={{
                                    background:
                                        "linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #3b82f6 100%)",
                                    boxShadow:
                                        "0 4px 20px rgba(124,58,237,0.38), 0 1px 4px rgba(0,0,0,0.08)",
                                }}
                            >
                                해커톤 시작하기
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/camp"
                                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm transition-all hover:scale-[1.03] active:scale-100"
                                style={{
                                    background: "rgba(255,255,255,0.72)",
                                    border: "1.5px solid rgba(167,139,250,0.5)",
                                    color: "#5b21b6",
                                    backdropFilter: "blur(12px)",
                                    boxShadow:
                                        "0 2px 12px rgba(124,58,237,0.12)",
                                }}
                            >
                                팀원 찾기
                                <Users className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 통계 배너 ── */}
            <div className="max-w-6xl mx-auto px-6 -mt-6 mb-6 relative z-10">
                <div
                    className="grid grid-cols-3 gap-px rounded-2xl overflow-hidden"
                    style={{
                        background: "rgba(167,139,250,0.15)",
                        boxShadow: "0 4px 24px rgba(124,58,237,0.1)",
                    }}
                >
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="text-center py-5 px-4 animate-pulse"
                                style={{
                                    background: "rgba(255,255,255,0.85)",
                                    backdropFilter: "blur(12px)",
                                }}
                            >
                                <div className="h-9 bg-violet-100 rounded w-16 mx-auto mb-1" />
                                <div className="h-3 bg-violet-50 rounded w-12 mx-auto" />
                            </div>
                        ))
                    ) : error ? (
                        <div
                            className="col-span-3 py-5 px-4 text-center"
                            style={{
                                background: "rgba(255,255,255,0.85)",
                                backdropFilter: "blur(12px)",
                            }}
                        >
                            <ErrorState
                                title="통계를 불러올 수 없습니다"
                                description="잠시 후 다시 시도해주세요."
                                onRetry={retry}
                            />
                        </div>
                    ) : (
                        (stats ?? []).map((stat) => (
                            <div
                                key={stat.label}
                                className="text-center py-5 px-4"
                                style={{
                                    background: "rgba(255,255,255,0.85)",
                                    backdropFilter: "blur(12px)",
                                }}
                            >
                                <div className="flex items-baseline justify-center gap-0.5">
                                    <span
                                        className="text-3xl font-black"
                                        style={{ color: "#6d28d9" }}
                                    >
                                        {stat.value}
                                    </span>
                                    <span
                                        className="text-sm font-bold"
                                        style={{ color: "#a78bfa" }}
                                    >
                                        {stat.suffix}
                                    </span>
                                </div>
                                <p
                                    className="text-xs font-medium mt-0.5"
                                    style={{ color: "#9ca3af" }}
                                >
                                    {stat.label}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ── 네비게이션 카드 ── */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-10">
                        <p
                            className="text-xs font-bold tracking-[0.3em] uppercase mb-2"
                            style={{ color: "#a78bfa" }}
                        >
                            EXPLORE
                        </p>
                        <h2
                            className="text-3xl font-black"
                            style={{ color: "#1e1b4b" }}
                        >
                            무엇을 원하시나요?
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {NAV_CARDS.map((card) => (
                            <Link
                                key={card.href}
                                href={card.href}
                                className="group"
                            >
                                <div
                                    className="light-card h-full p-10 flex flex-col"
                                    style={{
                                        background: "rgba(255,255,255,0.9)",
                                    }}
                                >
                                    <div
                                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                                        style={{
                                            background: card.bg,
                                            border: `1.5px solid ${card.border}`,
                                            color: card.color,
                                        }}
                                    >
                                        <span className="w-8 h-8 flex items-center justify-center [&>svg]:w-8 [&>svg]:h-8">
                                            {card.icon}
                                        </span>
                                    </div>
                                    <h3
                                        className="text-2xl font-black mb-3"
                                        style={{ color: "#1e1b4b" }}
                                    >
                                        {card.title}
                                    </h3>
                                    <p
                                        className="text-base leading-relaxed flex-1 mb-6"
                                        style={{ color: "#6b7280" }}
                                    >
                                        {card.description}
                                    </p>
                                    <div
                                        className="flex items-center gap-1.5 text-base font-bold"
                                        style={{ color: card.color }}
                                    >
                                        바로가기
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 주목할 해커톤 ── */}
            {(loading || featured.length > 0) && (
                <section className="pb-12 px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex items-end justify-between mb-8">
                            <div>
                                <p
                                    className="text-xs font-bold tracking-[0.3em] uppercase mb-2"
                                    style={{ color: "#a78bfa" }}
                                >
                                    LIVE NOW
                                </p>
                                <h2
                                    className="text-3xl font-black"
                                    style={{ color: "#1e1b4b" }}
                                >
                                    지금 주목할 해커톤
                                </h2>
                            </div>
                            <Link
                                href="/hackathons"
                                className="flex items-center gap-1 text-sm font-semibold transition-colors"
                                style={{ color: "#7c3aed" }}
                            >
                                전체 보기 <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[1, 2].map((i) => (
                                    <div
                                        key={i}
                                        className="light-card p-6 animate-pulse"
                                    >
                                        <div className="h-4 bg-violet-50 rounded w-16 mb-4" />
                                        <div className="h-5 bg-violet-50 rounded w-full mb-2" />
                                        <div className="h-5 bg-violet-50 rounded w-3/4 mb-4" />
                                        <div className="flex gap-2 mb-4">
                                            <div className="h-5 bg-violet-50 rounded-full w-16" />
                                            <div className="h-5 bg-violet-50 rounded-full w-20" />
                                        </div>
                                        <div className="h-4 bg-violet-50 rounded w-32" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {featured.map((h) => (
                                    <Link
                                        key={h.slug}
                                        href={`/hackathons/${h.slug}`}
                                        className="group"
                                    >
                                        <div className="light-card p-6 relative overflow-hidden">
                                            {/* 상단 컬러 라인 */}
                                            <div
                                                className={`absolute top-0 left-0 w-full h-1 rounded-t-xl ${
                                                    h.status === "ongoing"
                                                        ? "bg-gradient-to-r from-emerald-400 to-teal-400"
                                                        : "bg-gradient-to-r from-violet-500 to-blue-500"
                                                }`}
                                            />

                                            {/* 배경 glow */}
                                            <div
                                                className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                                style={{
                                                    background:
                                                        "radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)",
                                                }}
                                            />

                                            <div className="flex items-start justify-between mb-3 mt-1">
                                                <StatusBadge
                                                    status={h.status}
                                                />
                                                <CountdownTimer
                                                    deadline={
                                                        h.period
                                                            .submissionDeadlineAt
                                                    }
                                                    label="제출 마감"
                                                />
                                            </div>
                                            <h3
                                                className="text-base font-bold mb-3 leading-snug group-hover:text-violet-700 transition-colors"
                                                style={{ color: "#1e1b4b" }}
                                            >
                                                {h.title}
                                            </h3>
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                {h.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                                                        style={{
                                                            background:
                                                                "rgba(124,58,237,0.07)",
                                                            color: "#6d28d9",
                                                            border: "1px solid rgba(124,58,237,0.15)",
                                                        }}
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <div
                                                className="flex items-center justify-between pt-3"
                                                style={{
                                                    borderTop:
                                                        "1px solid rgba(196,181,253,0.3)",
                                                }}
                                            >
                                                <span
                                                    className="text-xs"
                                                    style={{ color: "#9ca3af" }}
                                                >
                                                    마감{" "}
                                                    {new Date(
                                                        h.period
                                                            .submissionDeadlineAt,
                                                    ).toLocaleDateString(
                                                        "ko-KR",
                                                    )}
                                                </span>
                                                <span
                                                    className="flex items-center gap-1 text-xs font-semibold group-hover:text-violet-700 transition-colors"
                                                    style={{ color: "#7c3aed" }}
                                                >
                                                    자세히 보기{" "}
                                                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}
