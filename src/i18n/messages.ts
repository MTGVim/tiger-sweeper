export interface Messages {
  appTitle: string;
  githubAria: string;
  difficultyLabel: string;
  difficulty: { easy: string; normal: string; hard: string };
  hud: {
    newGame: string;
    probability: string;
    pause: string;
    resume: string;
    options: string;
    autoSolveOn: string;
    autoSolveOff: string;
    status: { idle: string; playing: string; won: string; lost: string; paused: string };
  };
  board: {
    paused: string;
    confidence: (value: number) => string;
  };
  leaderboard: {
    title: string;
    clear: string;
    empty: string;
    modeNone: string;
    modeAssist: string;
    modeProbability: string;
    modeBoth: string;
    rank: string;
    lives: string;
    time: string;
    date: string;
    first: string;
    prev: string;
    next: string;
    last: string;
  };
  modal: {
    winTitle: string;
    loseTitle: string;
    winText: (time: number) => string;
    loseText: string;
    rankText: (rank: number) => string;
    retry: string;
    confirm: string;
  };
  options: {
    title: string;
    close: string;
    themeToXp: string;
    themeToModern: string;
    sound: string;
    preset: string;
    presetSoft: string;
    presetRetro: string;
    presetArcade: string;
  };
}

export const messages: Messages = {
  appTitle: '🐯 Tiger-Sweeper',
  githubAria: 'GitHub 저장소',
  difficultyLabel: '난이도',
  difficulty: { easy: '쉬움', normal: '보통', hard: '어려움' },
  hud: {
    newGame: '새 게임',
    probability: '👀 확률 표시',
    pause: '일시정지',
    resume: '재개',
    options: '옵션',
    autoSolveOn: '🤖 어시스트',
    autoSolveOff: '🤖 어시스트',
    status: {
      idle: '대기',
      playing: '진행중',
      won: '승리',
      lost: '패배',
      paused: '일시정지'
    }
  },
  board: {
    paused: '일시정지',
    confidence: (value) => `지뢰 확률 ${value}%`
  },
  leaderboard: {
    title: '리더보드 (로컬)',
    clear: '초기화',
    empty: '기록이 없습니다. 한 판 승리하면 기록이 생성됩니다.',
    modeNone: '기본',
    modeAssist: '어시스트',
    modeProbability: '확률',
    modeBoth: '어시스트+확률',
    rank: '순위',
    lives: '목숨',
    time: '시간',
    date: '날짜',
    first: '처음',
    prev: '이전',
    next: '다음',
    last: '마지막'
  },
  modal: {
    winTitle: '승리',
    loseTitle: '게임 오버',
    winText: (time) => `클리어 시간: ${time.toFixed(1)}초`,
    loseText: '지뢰가 폭발했습니다.',
    rankText: (rank) => `현재 순위: #${rank}`,
    retry: '다시하기',
    confirm: '확인'
  },
  options: {
    title: '옵션',
    close: '닫기',
    themeToXp: 'XP 테마',
    themeToModern: '모던 테마',
    sound: '사운드',
    preset: '프리셋',
    presetSoft: '부드러움',
    presetRetro: '레트로',
    presetArcade: '아케이드',
  }
};
