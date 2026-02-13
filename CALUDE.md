{
  "project": {
    "name": "minesweeper-pwa",
    "version": "1.0.0",
    "stack": {
      "framework": "React 18",
      "language": "TypeScript",
      "buildTool": "Vite",
      "stateManagement": "Context + useReducer",
      "styling": "Tailwind CSS + CSS Modules",
      "pwa": "vite-plugin-pwa",
      "ci": "GitHub Actions",
      "deployment": "GitHub Pages"
    }
  },
  "commands": {
    "install": "yarn install",
    "dev": "yarn dev",
    "build": "yarn build",
    "preview": "yarn preview",
    "test": "yarn test"
  },
  "folderStructure": [
    "src/core",
    "src/context",
    "src/components/Board",
    "src/components/Cell",
    "src/components/DifficultySelector",
    "src/components/HUD",
    "src/components/Leaderboard",
    "src/components/Modal",
    "src/hooks",
    "src/i18n",
    "src/theme",
    "public/icons",
    ".github/workflows"
  ],
  "difficulties": {
    "easy": { "width": 9, "height": 9, "mines": 10 },
    "normal": { "width": 16, "height": 16, "mines": 40 },
    "hard": { "width": 30, "height": 16, "mines": 99 }
  },
  "dataModels": {
    "GameState": {
      "status": "idle | playing | won | lost",
      "difficulty": "easy | normal | hard",
      "aiMode": "boolean",
      "aiSpeed": "1 | 2 | 4 | 8 | 16",
      "showProbabilities": "boolean",
      "theme": "modern | windowsXP",
      "soundEnabled": "boolean",
      "soundPreset": "soft | retro | arcade"
    }
  },
  "gameplay": {
    "rules": [
      "First click safe",
      "Flood fill open",
      "Number chording (open/flag neighbors when conditions match)",
      "Lives system (mine hit reduces life until game over)",
      "Win/Lose status handling with lockout"
    ],
    "assist": {
      "autoMode": true,
      "speeds": [1, 2, 4, 8, 16],
      "probabilityOverlay": true
    }
  },
  "ui": {
    "language": "ko only",
    "layout": [
      "Top: title/github",
      "Sticky: status bar + streak",
      "Middle: board grid",
      "Below board: difficulty + controls",
      "Bottom: leaderboard"
    ],
    "mobile": {
      "modeToggle": "open/flag floating toggle",
      "longPressFlag": true,
      "hapticOnLongPress": true
    }
  },
  "audio": {
    "events": ["click", "flag", "explode", "win", "lose"],
    "externalFiles": {
      "explode": "/sounds/vine-boom.mp3",
      "win": "/sounds/yahoo-yodel.mp3",
      "lose": "/sounds/ocean-meme.mp3"
    },
    "overlapPolicy": "same event sound is restarted (no stacking)",
    "volumeControl": "removed from UI"
  },
  "persistence": {
    "localStorage": [
      "theme",
      "leaderboard",
      "streaks",
      "difficulty",
      "aiMode",
      "aiSpeed",
      "showProbabilities"
    ]
  },
  "pwa": {
    "offline": true,
    "installable": true,
    "buildOutput": "dist"
  },
  "ciCd": {
    "workflow": ".github/workflows/deploy.yml",
    "trigger": "push to main",
    "pipeline": ["yarn install --frozen-lockfile", "yarn build", "deploy to GitHub Pages"]
  }
}
