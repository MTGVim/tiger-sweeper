{
  "project": {
    "name": "minesweeper-pwa",
    "version": "1.0.0",
    "stack": {
      "framework": "React 18",
      "language": "TypeScript",
      "buildTool": "Vite",
      "stateManagement": "Context + useReducer",
      "styling": "CSS Modules",
      "pwa": "vite-plugin-pwa",
      "ci": "GitHub Actions",
      "deployment": "GitHub Pages"
    }
  },

  "setup": {
    "commands": [
      "yarn create vite minesweeper-pwa --template react-ts",
      "cd minesweeper-pwa",
      "yarn install",
      "yarn add vite-plugin-pwa",
      "yarn add -D @types/node"
    ]
  },

  "folderStructure": [
    "src/core",
    "src/context",
    "src/components/Board",
    "src/components/Cell",
    "src/components/HUD",
    "src/components/Modal",
    "src/components/DifficultySelector",
    "src/hooks",
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
    "Cell": {
      "x": "number",
      "y": "number",
      "isMine": "boolean",
      "isOpen": "boolean",
      "isFlagged": "boolean",
      "adjacentMines": "number"
    },
    "GameState": {
      "board": "Cell[][]",
      "status": "idle | playing | won | lost",
      "timer": "number",
      "remainingMines": "number",
      "difficulty": "easy | normal | hard",
      "aiMode": "boolean",
      "theme": "modern | windowsXP"
    }
  },

  "coreLogic": {
    "rules": [
      "First click safe",
      "Recursive flood fill",
      "Win when all non-mine cells open",
      "Lose immediately when mine opened",
      "Timer starts on first move",
      "Disable interactions after game end"
    ],
    "functions": [
      "generateBoard",
      "placeMines",
      "calculateAdjacentCounts",
      "openCell",
      "floodFill",
      "toggleFlag",
      "checkWin",
      "resetGame",
      "startTimer",
      "stopTimer"
    ]
  },

  "aiSystem": {
    "enabled": true,
    "modes": ["deterministic", "probabilistic"],
    "deterministicRules": [
      "If number equals flagged neighbors -> open others",
      "If number equals unopened neighbors -> flag others"
    ],
    "probabilisticRules": [
      "Calculate probability of mine for each frontier cell",
      "Choose lowest probability safe move",
      "Fallback to random if equal probability"
    ],
    "ui": {
      "aiToggleButton": true,
      "stepExecution": true,
      "autoRunIntervalMs": 300
    }
  },

  "ui": {
    "layout": {
      "responsive": true,
      "boardGrid": "CSS Grid",
      "mobileSupport": true
    },
    "states": [
      "closed",
      "open",
      "flagged",
      "mine",
      "exploded"
    ],
    "animations": [
      "cell press scale",
      "mine explode flash",
      "win confetti"
    ],
    "soundEffects": {
      "enabled": true,
      "events": ["click", "flag", "win", "lose"]
    }
  },

  "themeSystem": {
    "themes": {
      "modern": {
        "colors": {
          "background": "#f4f4f4",
          "board": "#dddddd"
        }
      },
      "windowsXP": {
        "colors": {
          "background": "#008080",
          "board": "#c0c0c0"
        },
        "font": "Tahoma",
        "3dBorders": true
      }
    },
    "toggleable": true
  },

  "pwa": {
    "manifest": {
      "name": "Minesweeper PWA",
      "short_name": "Minesweeper",
      "display": "standalone",
      "start_url": "/",
      "background_color": "#ffffff",
      "theme_color": "#111111",
      "icons": [
        { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
        { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
      ]
    },
    "workbox": {
      "globPatterns": ["**/*.{js,css,html,png,svg}"],
      "runtimeCaching": [
        {
          "urlPattern": ".*\\.(png|jpg|jpeg|svg)",
          "handler": "CacheFirst"
        },
        {
          "urlPattern": ".*\\.(js|css)",
          "handler": "StaleWhileRevalidate"
        }
      ]
    },
    "requirements": [
      "Offline after first visit",
      "Installable",
      "Lighthouse PWA >= 90"
    ]
  },

  "ciCd": {
    "githubActions": {
      "file": ".github/workflows/deploy.yml",
      "trigger": "push to main",
      "steps": [
        "checkout",
        "setup node 20",
        "yarn install --frozen-lockfile",
        "yarn build",
        "deploy to GitHub Pages artifact"
      ]
    }
  },

  "deployment": {
    "platform": "GitHub Pages",
    "buildOutputDirectory": "dist"
  },

  "verificationChecklist": [
    "Board renders",
    "First click safe verified",
    "Flood fill correct",
    "Win/Lose modal works",
    "AI deterministic works",
    "AI probabilistic works",
    "Theme switch works",
    "Offline test passed",
    "Installable confirmed",
    "CI deploy successful"
  ]
}
