import type { Hackathon, HackathonDetail, Team, Leaderboard } from './types';

export const HACKATHONS: Hackathon[] = [
  {
    slug: 'aimers-8-model-lite',
    title: 'Aimers 8기 : 모델 경량화 온라인 해커톤',
    status: 'ended',
    tags: ['LLM', 'Compression', 'vLLM'],
    thumbnailUrl: 'https://example.com/public/img/aimers8.png',
    period: {
      timezone: 'Asia/Seoul',
      submissionDeadlineAt: '2026-02-25T10:00:00+09:00',
      endAt: '2026-02-26T10:00:00+09:00',
    },
    links: {
      detail: '/hackathons/aimers-8-model-lite',
      rules: 'https://example.com/public/rules/aimers8',
      faq: 'https://example.com/public/faq/aimers8',
    },
  },
  {
    slug: 'monthly-vibe-coding-2026-02',
    title: '월간 해커톤 : 바이브 코딩 개선 AI 아이디어 공모전 (2026.02)',
    status: 'ended',  // 원본 JSON은 "ongoing"이나 endAt(2026-03-09)이 지남 → 실제 종료
    tags: ['Idea', 'GenAI', 'Workflow'],
    thumbnailUrl: 'https://example.com/public/img/vibe202602.png',
    period: {
      timezone: 'Asia/Seoul',
      submissionDeadlineAt: '2026-03-03T10:00:00+09:00',
      endAt: '2026-03-09T10:00:00+09:00',
    },
    links: {
      detail: '/hackathons/monthly-vibe-coding-2026-02',
      rules: 'https://example.com/public/rules/vibe202602',
      faq: 'https://example.com/public/faq/vibe202602',
    },
  },
  {
    slug: 'daker-handover-2026-03',
    title: '긴급 인수인계 해커톤: 명세서만 보고 구현하라',
    status: 'ongoing',  // 원본 JSON은 "upcoming"이나 접수 시작(2026-03-04) 이후 진행 중
    tags: ['VibeCoding', 'Web', 'Vercel', 'Handover'],
    thumbnailUrl: 'https://example.com/public/img/daker-handover-202603.png',
    period: {
      timezone: 'Asia/Seoul',
      submissionDeadlineAt: '2026-04-06T10:00:00+09:00',
      endAt: '2026-04-27T10:00:00+09:00',
    },
    links: {
      detail: '/hackathons/daker-handover-2026-03',
      rules: 'https://example.com/public/rules/daker-handover-202603',
      faq: 'https://example.com/public/faq/daker-handover-202603',
    },
  },
];

// extraDetails의 daker-handover-2026-03 데이터를 slug 기준으로 정규화한 결과입니다.
export const HACKATHON_DETAILS: Record<string, HackathonDetail> = {
  'aimers-8-model-lite': {
    slug: 'aimers-8-model-lite',
    title: 'Aimers 8기 : 모델 경량화 온라인 해커톤',
    sections: {
      overview: {
        summary: '제한된 평가 환경에서 모델의 성능과 추론 속도를 함께 최적화합니다.',
        teamPolicy: { allowSolo: true, maxTeamSize: 5 },
      },
      info: {
        notice: [
          '제출 마감 이후 추가 제출은 불가합니다.',
          '평가 환경은 고정이며, 제출물은 별도 설치 없이 실행 가능해야 합니다.',
        ],
        faq: {
          items: [
            {
              question: '팀을 구성하지 않고 개인으로 참가할 수 있나요?',
              answer: '네, 개인 참가가 가능합니다. 제출 시 팀원이 1명인 팀으로 등록됩니다.',
            },
            {
              question: '제출 파일 형식에 제한이 있나요?',
              answer: '단일 zip 파일만 허용됩니다. 압축 내부 구조는 규정 문서를 참고하세요.',
            },
            {
              question: '평가 환경 사양을 알 수 있나요?',
              answer: 'GPU 1장 기준 고정 환경이며, CUDA 12.x + PyTorch 2.x가 제공됩니다. 별도 패키지 설치는 불가합니다.',
            },
            {
              question: '일일 제출 횟수 제한을 초과하면 어떻게 되나요?',
              answer: '해당 일의 추가 제출이 차단됩니다. 다음 날 자정(KST) 이후 다시 제출 가능합니다.',
            },
            {
              question: '리더보드 점수 공식은 어디서 확인하나요?',
              answer: '규정 패널의 "점수 산출 방식" 섹션에서 FinalScore 산식 전문을 확인하세요.',
            },
          ],
        },
        rules: {
          sections: [
            {
              title: '참가 자격',
              items: [
                '만 18세 이상 누구나 참가 가능합니다.',
                '팀 구성은 1~5인이며 개인 참가도 허용됩니다.',
                '동일인이 복수 팀에 속할 수 없습니다.',
              ],
            },
            {
              title: '제출 규정',
              items: [
                '제출물은 단일 zip 파일이어야 합니다.',
                '압축 해제 후 run.sh 또는 run.py 하나가 진입점이어야 합니다.',
                '외부 네트워크 접근은 평가 환경에서 차단됩니다.',
                '제출 마감(2026-02-25 10:00 KST) 이후 제출은 리더보드에 반영되지 않습니다.',
              ],
            },
            {
              title: '점수 산출 방식',
              items: [
                'FinalScore = 0.5 × 정확도 점수 + 0.5 × 속도 점수',
                '정확도 점수: 평가 데이터셋 기준 모델 성능(AUC/F1 등)',
                '속도 점수: (최대실행시간 − 실제실행시간) / 최대실행시간 × 100',
                '실행 시간이 1,200초를 초과하면 해당 제출은 0점 처리됩니다.',
              ],
            },
            {
              title: '시상 및 결과',
              items: [
                '최종 순위는 대회 종료(2026-02-26) 이후 공개 리더보드 기준으로 확정됩니다.',
                '동점인 경우 먼저 제출한 팀이 상위 순위를 차지합니다.',
                '시상금은 수상 확정 후 30일 이내 지급됩니다.',
              ],
            },
          ],
        },
      },
      eval: {
        metricName: 'FinalScore',
        description: '성능과 속도를 종합한 점수(세부 산식은 규정 참고).',
        limits: { maxRuntimeSec: 1200, maxSubmissionsPerDay: 5 },
      },
      schedule: {
        timezone: 'Asia/Seoul',
        milestones: [
          { name: '리더보드 제출 마감', at: '2026-02-25T10:00:00+09:00' },
          { name: '대회 종료', at: '2026-02-26T10:00:00+09:00' },
        ],
      },
      prize: {
        items: [
          { place: '1st', amountKRW: 3000000 },
          { place: '2nd', amountKRW: 1500000 },
          { place: '3rd', amountKRW: 800000 },
        ],
      },
      teams: {
        campEnabled: true,
        listUrl: '/camp?hackathon=aimers-8-model-lite',
      },
      submit: {
        allowedArtifactTypes: ['zip'],
        submissionUrl: '/hackathons/aimers-8-model-lite#submit',
        guide: [
          '제출물은 규정에 맞는 단일 zip 파일로 업로드합니다.',
          "업로드 후 '제출' 버튼을 눌러야 리더보드에 반영됩니다.",
        ],
      },
      leaderboard: {
        publicLeaderboardUrl: '/hackathons/aimers-8-model-lite#leaderboard',
        note: 'Public 리더보드는 제출 마감 시점 기준으로 고정될 수 있습니다(규정 참고).',
      },
    },
  },
  'monthly-vibe-coding-2026-02': {
    slug: 'monthly-vibe-coding-2026-02',
    title: '월간 해커톤 : 바이브 코딩 개선 AI 아이디어 공모전 (2026.02)',
    sections: {
      overview: {
        summary:
          '바이브 코딩 환경에서 개발 경험을 개선하는 AI 기반 아이디어를 제안하고 구현합니다. GenAI 활용 워크플로우 혁신을 목표로 합니다.',
        teamPolicy: { allowSolo: true, maxTeamSize: 4 },
      },
      info: {
        notice: [
          '아이디어 제안 및 프로토타입 구현을 함께 제출해야 합니다.',
          '생성형 AI 도구 사용은 자유롭게 허용됩니다.',
          '외부 API 사용 시 심사자가 별도 키 없이 확인할 수 있어야 합니다.',
        ],
        faq: {
          items: [
            {
              question: '아이디어만 제출해도 되나요, 아니면 구현도 필요한가요?',
              answer: '아이디어 설명(PDF)과 프로토타입 URL을 함께 제출해야 합니다. 프로토타입은 완성도보다 동작 여부가 중요합니다.',
            },
            {
              question: 'GenAI 도구는 어디까지 사용할 수 있나요?',
              answer: 'Claude, GPT, Gemini 등 생성형 AI 도구 사용은 제한 없이 허용됩니다. 사용한 도구를 PDF에 명시해 주세요.',
            },
            {
              question: '외부 API 키가 필요한 서비스를 사용해도 되나요?',
              answer: '가능하지만, 심사자가 별도 API 키 없이 동작을 확인할 수 있어야 합니다. 데모 계정 또는 Mock 모드를 제공하세요.',
            },
            {
              question: 'PDF 분량 제한이 있나요?',
              answer: '권장 분량은 10~20슬라이드이며, 아이디어 설명·구현 내용·기대 효과가 포함되어야 합니다.',
            },
            {
              question: '팀원은 해커톤 시작 후에도 추가할 수 있나요?',
              answer: '제출 마감(2026-03-03) 전까지 팀 구성 변경이 가능합니다. 최종 제출 시 팀 정보를 확정해 주세요.',
            },
          ],
        },
        rules: {
          sections: [
            {
              title: '참가 자격',
              items: [
                '개인 및 최대 4인 팀으로 참가 가능합니다.',
                '국내외 거주 무관하게 참가할 수 있습니다.',
              ],
            },
            {
              title: '제출 규정',
              items: [
                '프로토타입 URL과 발표 자료 PDF를 모두 제출해야 합니다.',
                'URL은 심사 기간(~2026-03-09) 동안 외부 접근 가능해야 합니다.',
                'PDF는 슬라이드 형식이어야 하며 PDF로 변환하여 제출합니다.',
              ],
            },
            {
              title: '평가 기준',
              items: [
                '참신성 40%: 기존 도구와 차별화된 접근 방식',
                '구현 완성도 40%: 프로토타입의 실제 동작 수준',
                '발표력 20%: 아이디어 전달력과 문서 품질',
              ],
            },
            {
              title: '시상',
              items: [
                '심사위원 평가는 제출 마감 후 진행되며, 결과는 2026-03-09에 공개됩니다.',
                '시상금은 수상자 확인 후 30일 이내 지급됩니다.',
              ],
            },
          ],
        },
      },
      eval: {
        metricName: 'IdeaScore',
        description: '아이디어의 참신성, 실용성, 구현 완성도를 종합 평가합니다.',
        scoreDisplay: {
          label: '아이디어 점수',
          breakdown: [
            { key: 'idea', label: '참신성', weightPercent: 40 },
            { key: 'impl', label: '구현 완성도', weightPercent: 40 },
            { key: 'present', label: '발표력', weightPercent: 20 },
          ],
        },
      },
      schedule: {
        timezone: 'Asia/Seoul',
        milestones: [
          { name: '제출 마감', at: '2026-03-03T10:00:00+09:00' },
          { name: '대회 종료 및 결과 발표', at: '2026-03-09T10:00:00+09:00' },
        ],
      },
      prize: {
        items: [
          { place: '1st', amountKRW: 1000000 },
          { place: '2nd', amountKRW: 500000 },
          { place: '3rd', amountKRW: 300000 },
        ],
      },
      teams: {
        campEnabled: true,
        listUrl: '/camp?hackathon=monthly-vibe-coding-2026-02',
      },
      submit: {
        allowedArtifactTypes: ['url', 'pdf'],
        submissionUrl: '/hackathons/monthly-vibe-coding-2026-02#submit',
        guide: [
          '프로토타입 URL과 발표 자료(PDF)를 함께 제출합니다.',
          'PDF는 아이디어 설명, 구현 내용, 기대 효과를 포함해야 합니다.',
        ],
        submissionItems: [
          { key: 'web', title: '프로토타입 URL', format: 'url' },
          { key: 'pdf', title: '발표 자료 PDF', format: 'pdf_url' },
        ],
      },
      leaderboard: {
        publicLeaderboardUrl: '/hackathons/monthly-vibe-coding-2026-02#leaderboard',
        note: '아이디어 해커톤의 점수는 심사위원 평가 후 공개됩니다.',
      },
    },
  },
  // extraDetails[0]의 daker-handover-2026-03 데이터를 정규화
  'daker-handover-2026-03': {
    slug: 'daker-handover-2026-03',
    title: '긴급 인수인계 해커톤: 명세서만 보고 구현하라',
    sections: {
      overview: {
        summary:
          '기능 명세서만 남기고 사라진 개발자의 문서를 기반으로 바이브 코딩을 통해 웹서비스를 구현·배포하는 해커톤입니다.',
        teamPolicy: { allowSolo: true, maxTeamSize: 5 },
      },
      info: {
        notice: [
          '예시 자료 외 데이터는 제공되지 않습니다.',
          '더미 데이터/로컬 저장소(localStorage 등)를 활용해 구현하세요.',
          '배포 URL은 외부에서 접속 가능해야하며 심사 기간동안 접근 가능해야합니다.',
          '외부 API/외부 DB를 쓰는 경우에도 심사자가 별도 키 없이 확인 가능해야 합니다.',
        ],
        faq: {
          items: [
            {
              question: '제공되는 명세서 외에 추가 자료를 요청할 수 있나요?',
              answer: '아니요, 예시 자료(명세서)만 제공됩니다. 부족한 정보는 참가자가 합리적으로 해석하여 구현하면 됩니다.',
            },
            {
              question: '데이터베이스나 서버가 없어도 제출할 수 있나요?',
              answer: '네, localStorage나 더미 데이터를 활용한 프론트엔드 구현도 유효합니다. 심사자가 별도 설정 없이 브라우저에서 확인 가능해야 합니다.',
            },
            {
              question: '배포 플랫폼에 제한이 있나요?',
              answer: 'Vercel, Netlify, GitHub Pages 등 무엇이든 가능합니다. 외부에서 접근 가능한 URL이어야 합니다.',
            },
            {
              question: '기획서 제출 이후 구현 방향을 바꿔도 되나요?',
              answer: '네, 최종 제출물(웹링크·PDF)이 기준입니다. 기획서는 참여 의사 확인용이므로 방향 변경이 허용됩니다.',
            },
            {
              question: '투표는 어떻게 진행되나요?',
              answer: '1차 투표(2026-04-13~17)에서 참가자 전원이 다른 팀의 결과물에 투표합니다. 이후 심사위원 내부 평가가 진행됩니다.',
            },
            {
              question: 'AI 코딩 도구(Cursor, Copilot 등)를 사용해도 되나요?',
              answer: '네, 바이브 코딩 해커톤 취지에 맞게 AI 도구 사용이 적극 권장됩니다.',
            },
          ],
        },
        rules: {
          sections: [
            {
              title: '참가 자격 및 팀 구성',
              items: [
                '개인 또는 최대 5인 팀으로 참가 가능합니다.',
                '팀 구성은 접수 기간(~2026-03-30) 중에 확정해야 합니다.',
                '동일인이 복수 팀에 속하는 것은 금지됩니다.',
              ],
            },
            {
              title: '제출 규정',
              items: [
                '1단계: 기획서(텍스트 또는 URL) — 2026-03-30까지',
                '2단계: 최종 웹링크 — 2026-04-06까지',
                '3단계: 솔루션 PDF — 2026-04-13까지',
                '각 단계 마감을 지키지 못하면 해당 항목은 미제출로 처리됩니다.',
                '배포 URL은 심사 기간(~2026-04-24) 동안 외부 접속 가능해야 합니다.',
              ],
            },
            {
              title: '구현 범위',
              items: [
                '제공된 명세서를 기반으로 웹서비스를 자유롭게 구현합니다.',
                '더미 데이터 및 localStorage 사용이 허용됩니다.',
                '외부 API·DB 사용 시 심사자가 별도 키 없이 확인 가능해야 합니다.',
              ],
            },
            {
              title: '평가 및 시상',
              items: [
                '최종 점수 = 참가자 투표(30%) + 심사위원 평가(70%)',
                '결과는 2026-04-27 공개됩니다.',
                '시상금 없음(명예 해커톤) — 수상팀에게는 디지털 배지가 지급됩니다.',
              ],
            },
          ],
        },
      },
      eval: {
        metricName: 'FinalScore',
        description: '참가팀/심사위원 투표 점수를 가중치로 합산한 최종 점수',
        scoreSource: 'vote',
        scoreDisplay: {
          label: '투표 점수',
          breakdown: [
            { key: 'participant', label: '참가자', weightPercent: 30 },
            { key: 'judge', label: '심사위원', weightPercent: 70 },
          ],
        },
      },
      schedule: {
        timezone: 'Asia/Seoul',
        milestones: [
          { name: '접수/기획서 제출 기간', at: '2026-03-04T10:00:00+09:00' },
          { name: '접수/기획서 제출 마감', at: '2026-03-30T10:00:00+09:00' },
          { name: '최종 웹링크 제출 마감', at: '2026-04-06T10:00:00+09:00' },
          { name: '최종 솔루션 PDF 제출 마감', at: '2026-04-13T10:00:00+09:00' },
          { name: '1차 투표평가 시작', at: '2026-04-13T12:00:00+09:00' },
          { name: '1차 투표평가 마감', at: '2026-04-17T10:00:00+09:00' },
          { name: '2차 내부평가 종료', at: '2026-04-24T23:59:00+09:00' },
          { name: '최종 결과 발표', at: '2026-04-27T10:00:00+09:00' },
        ],
      },
      teams: {
        campEnabled: true,
        listUrl: '/camp?hackathon=daker-handover-2026-03',
      },
      submit: {
        allowedArtifactTypes: ['text', 'url', 'pdf'],
        submissionUrl: '/hackathons/daker-handover-2026-03#submit',
        guide: [
          '기획서 → 웹링크 → PDF를 단계별로 제출합니다.',
          '배포 URL은 외부에서 접속 가능해야 하며 심사 기간 동안 접근 가능해야 합니다.',
          'PPT는 PDF로 변환하여 제출합니다.',
        ],
        submissionItems: [
          { key: 'plan', title: '기획서(1차 제출)', format: 'text_or_url' },
          { key: 'web', title: '최종 웹링크 제출', format: 'url' },
          { key: 'pdf', title: '최종 솔루션 PDF 제출', format: 'pdf_url' },
        ],
      },
      leaderboard: {
        publicLeaderboardUrl: '/hackathons/daker-handover-2026-03#leaderboard',
        note: '아이디어 해커톤의 점수(score)는 투표 결과를 기반으로 표시됩니다.',
      },
    },
  },
};

export const SEED_TEAMS: Team[] = [
  {
    teamCode: 'T-ALPHA',
    hackathonSlug: 'aimers-8-model-lite',
    name: 'Team Alpha',
    isOpen: true,
    memberCount: 3,
    lookingFor: ['Backend', 'ML Engineer'],
    intro: '추론 최적화/경량화 실험을 함께 진행할 팀원을 찾습니다.',
    contact: { type: 'link', url: 'https://open.kakao.com/o/example1' },
    createdAt: '2026-02-20T11:00:00+09:00',
  },
  {
    teamCode: 'T-BETA',
    hackathonSlug: 'monthly-vibe-coding-2026-02',
    name: 'PromptRunners',
    isOpen: true,
    memberCount: 1,
    lookingFor: ['Frontend', 'Designer'],
    intro: '프롬프트 품질 점수화 + 개선 가이드 UX를 기획합니다.',
    contact: { type: 'link', url: 'https://forms.gle/example2' },
    createdAt: '2026-02-18T18:30:00+09:00',
  },
  {
    teamCode: 'T-HANDOVER-01',
    hackathonSlug: 'daker-handover-2026-03',
    name: '404found',
    isOpen: true,
    memberCount: 3,
    lookingFor: ['Frontend', 'Designer'],
    intro: '명세서 기반으로 기본 기능을 빠르게 완성하고 UX 확장을 노립니다.',
    contact: { type: 'link', url: 'https://open.kakao.com/o/example3' },
    createdAt: '2026-03-04T11:00:00+09:00',
  },
  {
    teamCode: 'T-HANDOVER-02',
    hackathonSlug: 'daker-handover-2026-03',
    name: 'LGTM',
    isOpen: false,
    memberCount: 5,
    lookingFor: [],
    intro: '기획서-구현-문서화를 깔끔하게 맞추는 방향으로 진행합니다.',
    contact: { type: 'link', url: 'https://forms.gle/example4' },
    createdAt: '2026-03-05T09:20:00+09:00',
  },
];

// extraLeaderboards의 daker-handover-2026-03 데이터를 slug 기준으로 정규화
export const SEED_LEADERBOARDS: Record<string, Leaderboard> = {
  'aimers-8-model-lite': {
    hackathonSlug: 'aimers-8-model-lite',
    updatedAt: '2026-02-26T10:00:00+09:00',
    entries: [
      {
        rank: 1,
        teamName: 'Team Alpha',
        score: 0.7421,
        submittedAt: '2026-02-24T21:05:00+09:00',
      },
      {
        rank: 2,
        teamName: 'Team Gamma',
        score: 0.7013,
        submittedAt: '2026-02-25T09:40:00+09:00',
      },
    ],
  },
  // extraLeaderboards[0]의 daker-handover-2026-03 데이터를 정규화
  'daker-handover-2026-03': {
    hackathonSlug: 'daker-handover-2026-03',
    updatedAt: '2026-04-17T10:00:00+09:00',
    entries: [
      {
        rank: 1,
        teamName: '404found',
        score: 87.5,
        submittedAt: '2026-04-13T09:58:00+09:00',
        scoreBreakdown: { participant: 82, judge: 90 },
        artifacts: {
          webUrl: 'https://404found.vercel.app',
          pdfUrl: 'https://example.com/404found-solution.pdf',
          planTitle: '404found 기획서',
        },
      },
      {
        rank: 2,
        teamName: 'LGTM',
        score: 84.2,
        submittedAt: '2026-04-13T09:40:00+09:00',
        scoreBreakdown: { participant: 79, judge: 88 },
        artifacts: {
          webUrl: 'https://lgtm-hack.vercel.app',
          pdfUrl: 'https://example.com/lgtm-solution.pdf',
          planTitle: 'LGTM 기획서',
        },
      },
    ],
  },
};

export const ALL_POSITIONS = [
  'Frontend',
  'Backend',
  'ML Engineer',
  'Designer',
  'PM',
  'DevOps',
  'Data Analyst',
  'Full Stack',
];
