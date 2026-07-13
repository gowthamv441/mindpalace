# Mind Palace — Design Document

## Architecture Overview

```
+------------------------------------------+
|           GitHub Pages (Static)          |
|  HTML + CSS + JS (Client-side app)       |
+------------------------------------------+
        |                       |
        v                       v
+----------------+    +-------------------+
| localStorage   |    | GitHub Gist API   |
| (offline/fast) |    | (cross-device     |
|                |    |  manual sync)     |
+----------------+    +-------------------+
```

### Hosting
- GitHub Pages (static site, no backend)
- Single-page app with tab-based navigation

### Storage Strategy
- **Primary**: localStorage for instant read/write
- **Sync**: GitHub Gist (private) for cross-device persistence
- **Flow**: Work offline with localStorage → manual Sync button pushes/pulls from Gist

### Sync Mechanism
- One private Gist stores all app data as a single JSON file
- Sync button in UI: "Push" (upload local → Gist) / "Pull" (download Gist → local)
- Conflict resolution: last-write-wins with timestamp comparison
- GitHub Personal Access Token stored in localStorage (entered once via settings)
- Gist ID stored after first creation

---

## Data Model

All data stored as a single JSON object with top-level keys:

```json
{
  "version": 1,
  "lastSyncedAt": "2026-07-13T10:00:00Z",
  "profile": { ... },
  "xp": { ... },
  "habits": [ ... ],
  "journal": { ... },
  "goals": [ ... ],
  "achievements": [ ... ],
  "quests": { ... },
  "dungeons": { ... },
  "shadows": [ ... ],
  "library": { ... },
  "workouts": { ... },
  "inventory": { ... },
  "settings": { ... }
}
```

### Profile
```json
{
  "hunterName": "string",
  "hunterClass": "Fighter|Mage|Assassin|Healer|Tank|Ranger",
  "rank": "E|D|C|B|A|S",
  "level": 1,
  "title": "string (equipped title)",
  "stats": {
    "strength": 10,
    "intelligence": 10,
    "discipline": 10,
    "vitality": 10,
    "agility": 10
  }
}
```

### XP System
```json
{
  "totalXP": 0,
  "currentLevelXP": 0,
  "xpToNextLevel": 100,
  "level": 1,
  "multiplier": 1.0,
  "history": [
    { "date": "2026-07-13", "amount": 50, "source": "habit", "detail": "Morning run" }
  ]
}
```

**XP Formula**: `xpToNextLevel = floor(100 * 1.5^(level-1))`

**XP Rewards**:
| Action | Base XP |
|--------|---------|
| Complete a habit | 10 |
| Journal entry | 15 |
| Complete a goal milestone | 25 |
| Finish a goal (boss kill) | 100-500 |
| Daily quest (D-rank) | 15 |
| Daily quest (C-rank) | 25 |
| Daily quest (B-rank) | 40 |
| Daily quest (A-rank) | 60 |
| Clear weekly dungeon | 150 |
| Clear monthly raid | 500 |
| Book finished | 50 |
| Workout logged | 20 |

**Streak Multipliers**:
| Streak | Multiplier |
|--------|-----------|
| 7 days | 1.25x |
| 14 days | 1.5x |
| 30 days | 2.0x |
| 60 days | 2.5x |
| 100 days | 3.0x |

### Habits
```json
[
  {
    "id": "string",
    "name": "Morning Run",
    "icon": "string",
    "difficulty": "D|C|B|A|S",
    "xp": 10,
    "streak": 7,
    "longestStreak": 14,
    "completedDates": ["2026-07-13", "2026-07-12"],
    "createdAt": "timestamp"
  }
]
```

### Journal
```json
{
  "entries": {
    "2026-07-13": {
      "content": "string",
      "mood": "emoji",
      "tags": ["work", "personal"],
      "createdAt": "timestamp"
    }
  }
}
```

### Goals (Boss Fights)
```json
[
  {
    "id": "string",
    "name": "Learn TypeScript",
    "difficulty": "B|A|S",
    "bossHP": 100,
    "currentHP": 100,
    "milestones": [
      { "id": "string", "name": "Complete basics course", "done": false, "damage": 25 }
    ],
    "deadline": "2026-09-01",
    "status": "active|defeated|escaped",
    "xpReward": 200,
    "shadowReward": { "name": "TypeScript Knight", "type": "mage" },
    "createdAt": "timestamp"
  }
]
```

### Daily Quests
```json
{
  "date": "2026-07-13",
  "quests": [
    {
      "id": "string",
      "name": "Write 500 words",
      "rank": "C",
      "xp": 25,
      "completed": false,
      "type": "discipline|intelligence|strength|vitality|agility"
    }
  ],
  "emergencyQuest": null | { ... },
  "allCompleteBonus": 50
}
```

### Dungeons
```json
{
  "weekly": {
    "id": "string",
    "name": "Discipline Dungeon",
    "type": "discipline",
    "startDate": "2026-07-07",
    "endDate": "2026-07-13",
    "challenges": [
      { "id": "string", "name": "7-day habit streak", "completed": false }
    ],
    "cleared": false,
    "rewards": { "xp": 150, "currency": 50 }
  },
  "monthly": {
    "id": "string",
    "name": "Raid Boss: July Challenge",
    "startDate": "2026-07-01",
    "endDate": "2026-07-31",
    "tasks": [ ... ],
    "cleared": false,
    "rewards": { "xp": 500, "currency": 200, "title": "July Conqueror" }
  }
}
```

### Shadow Army
```json
[
  {
    "id": "string",
    "name": "Iron Runner",
    "type": "knight|mage|assassin|healer|tank|ranger",
    "source": "goal:goal_id | achievement:ach_id",
    "rank": "D|C|B|A|S",
    "acquiredAt": "timestamp",
    "passiveBonus": { "stat": "strength", "value": 1 }
  }
]
```

### Rank-Up Gates
```json
{
  "currentRank": "E",
  "gates": {
    "D": {
      "requirements": {
        "minLevel": 5,
        "streakDays": 7,
        "dungeonClears": 1,
        "goalsCompleted": 1
      },
      "unlocked": false,
      "cleared": false
    },
    "C": {
      "requirements": {
        "minLevel": 15,
        "streakDays": 21,
        "dungeonClears": 5,
        "goalsCompleted": 3
      },
      "unlocked": false,
      "cleared": false
    },
    "B": {
      "requirements": {
        "minLevel": 30,
        "streakDays": 45,
        "dungeonClears": 12,
        "goalsCompleted": 7
      },
      "unlocked": false,
      "cleared": false
    },
    "A": {
      "requirements": {
        "minLevel": 50,
        "streakDays": 90,
        "dungeonClears": 25,
        "goalsCompleted": 15
      },
      "unlocked": false,
      "cleared": false
    },
    "S": {
      "requirements": {
        "minLevel": 80,
        "streakDays": 180,
        "dungeonClears": 50,
        "goalsCompleted": 30
      },
      "unlocked": false,
      "cleared": false
    }
  }
}
```

### Library — Books
```json
{
  "books": [
    {
      "id": "string",
      "title": "Atomic Habits",
      "author": "James Clear",
      "cover": "url or empty",
      "status": "want|reading|completed",
      "progress": 75,
      "totalPages": 320,
      "rating": 5,
      "notes": ["string"],
      "startedAt": "timestamp",
      "completedAt": "timestamp"
    }
  ],
  "knowledge": [
    {
      "id": "string",
      "title": "string",
      "content": "string",
      "source": "url|book|podcast",
      "tags": ["tech", "productivity"],
      "createdAt": "timestamp"
    }
  ],
  "resources": [
    {
      "id": "string",
      "title": "string",
      "url": "string",
      "type": "article|video|podcast|link",
      "tags": ["string"],
      "pinned": false,
      "createdAt": "timestamp"
    }
  ]
}
```

### Workout Library
```json
{
  "exercises": [
    {
      "id": "string",
      "name": "Bench Press",
      "muscleGroup": "chest|back|shoulders|arms|legs|core",
      "secondaryMuscles": ["triceps", "shoulders"],
      "equipment": "barbell|dumbbell|bodyweight|cable|machine",
      "difficulty": "beginner|intermediate|advanced",
      "instructions": "string",
      "image": "url or empty"
    }
  ],
  "plans": [
    {
      "id": "string",
      "name": "Push Pull Legs",
      "days": {
        "monday": {
          "label": "Push",
          "exercises": [
            { "exerciseId": "string", "sets": 4, "reps": "8-10", "rest": 90 }
          ]
        }
      },
      "active": true
    }
  ],
  "logs": [
    {
      "id": "string",
      "date": "2026-07-13",
      "planId": "string",
      "dayLabel": "Push",
      "entries": [
        {
          "exerciseId": "string",
          "sets": [
            { "weight": 80, "reps": 10, "rpe": 8 }
          ]
        }
      ],
      "duration": 65,
      "notes": ""
    }
  ],
  "prs": {
    "exercise_id": { "weight": 100, "reps": 1, "date": "2026-07-13" }
  },
  "bodyLog": [
    { "date": "2026-07-13", "weight": 75, "measurements": {} }
  ]
}
```

### Inventory & Shop
```json
{
  "currency": 500,
  "owned": [
    { "id": "string", "type": "theme|title|consumable", "name": "Dark Monarch Theme", "active": false }
  ],
  "shop": [
    { "id": "string", "name": "XP Boost (2x, 24h)", "type": "consumable", "price": 100 },
    { "id": "string", "name": "Streak Shield", "type": "consumable", "price": 150 },
    { "id": "string", "name": "Crimson Theme", "type": "theme", "price": 300 }
  ]
}
```

---

## Sync Design

### Setup Flow
1. User goes to Settings
2. Enters GitHub Personal Access Token (scope: `gist`)
3. App creates a private Gist named `mindpalace_data.json`
4. Gist ID saved to localStorage

### Sync Flow
```
[Push]
1. Gather all localStorage data into single JSON
2. Add timestamp: lastSyncedAt = now
3. PATCH Gist via GitHub API with updated content
4. Show success toast

[Pull]
1. GET Gist content via GitHub API
2. Compare timestamps (local vs remote)
3. If remote is newer: replace localStorage, reload UI
4. If local is newer: warn user, offer to overwrite anyway
5. Show success toast

[Conflict]
- Last-write-wins based on lastSyncedAt timestamp
- Option to "Force Push" or "Force Pull" in settings
```

### API Calls
```
Create Gist:  POST https://api.github.com/gists
Update Gist:  PATCH https://api.github.com/gists/{gist_id}
Read Gist:    GET https://api.github.com/gists/{gist_id}
```

Headers: `Authorization: Bearer <token>`

---

## UI Structure

### Navigation (Bottom Tab Bar)
```
[ Home ] [ Journal ] [ Habits ] [ Goals ] [ More ]
```

"More" tab opens a menu page with:
- Library (Books, Knowledge, Resources)
- Workouts
- Dungeons
- Shadow Army
- Shop
- Settings (Sync, Theme, Export)

### Page Breakdown

| Page | Content |
|------|---------|
| Home | Welcome typing msg, Hunter profile card, Summary stats, Quick nav cards, Daily quests |
| Journal | Day navigator, Diary page, Recent entries |
| Habits | Today's habits with check-off, Streak display, Grid visualization |
| Goals | Active goals as boss HP bars, Milestones, Completed goals |
| Dungeons | Active weekly/monthly dungeon, Challenge checklist, Rewards preview |
| Shadow Army | Grid/list of shadow soldiers, Total count, Passive bonuses |
| Library | Tab sub-nav: Books / Knowledge / Resources |
| Workouts | Tab sub-nav: Exercises / Plans / Log / Progress |
| Shop | Currency display, Items grid, Owned items |
| Settings | Profile edit, Sync controls, Data export/import, About |

### Mobile-First Responsive
- Bottom tab bar always visible
- Content max-width 600px centered
- Cards and panels fill width
- Touch-friendly tap targets (min 44px)
- Smooth transitions between sections

---

## File Structure

```
mindpalace/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── store.js          (localStorage + sync engine)
│   ├── app.js            (router, init)
│   ├── home.js           (home page + profile display)
│   ├── profile.js        (profile editor)
│   ├── xp.js             (XP/leveling engine)
│   ├── journal.js        (journal CRUD)
│   ├── habits.js         (habits + streaks)
│   ├── goals.js          (goals as boss fights)
│   ├── quests.js         (daily quest generation)
│   ├── dungeons.js       (weekly/monthly dungeons)
│   ├── shadows.js        (shadow army)
│   ├── ranks.js          (rank-up gate logic)
│   ├── library.js        (books, knowledge, resources)
│   ├── workouts.js       (exercise DB, plans, logging)
│   ├── shop.js           (inventory + shop)
│   ├── achievements.js   (badges + titles)
│   ├── sync.js           (GitHub Gist sync)
│   └── settings.js       (settings page)
├── REQUIREMENTS.md
├── DESIGN.md
└── README.md
```

---

## Design Tokens (Solo Leveling Theme)

| Token | Value | Usage |
|-------|-------|-------|
| --bg | #0a0e14 | Page background |
| --card | #0a0e14 | Card background |
| --surface | #1e2a3a | Elevated surfaces |
| --accent | #4cc9ff | Primary accent (neon blue) |
| --accent-dim | rgba(76,201,255,0.15) | Subtle highlights |
| --accent-glow | 0 0 15px rgba(76,201,255,0.15) | Glow effects |
| --text | #e0f2ff | Primary text |
| --muted | #8bacc1 | Secondary text |
| --border | #1e2a3a | Borders |
| --danger | #ff4c4c | Destructive actions |
| --gold | #ffd700 | Rare/legendary items |
| --purple | #a855f7 | S-rank / epic |
| Font heading | Orbitron | Titles, stats, rank |
| Font body | Rajdhani | Body text, UI labels |

---

## Implementation Phases

### Phase 1: Core RPG Engine
- XP system with leveling
- Integrate XP into existing habits/journal/goals
- Rank-up gate checks
- Daily quest generation
- Sync engine (GitHub Gist)

### Phase 2: Dungeons & Shadows
- Weekly dungeon system
- Monthly raid boss
- Shadow army from completed goals
- Boss fight HP mechanic for goals

### Phase 3: Library
- Book tracking (add, progress, complete)
- Knowledge base (quick capture, tags, search)
- Resource collection (links, videos, bookmarks)

### Phase 4: Workout System
- Exercise database with muscle groups
- Workout plan builder
- Session logging with sets/reps/weight
- PR tracking and progress charts

### Phase 5: Economy & Polish
- Skill trees
- Shop & inventory
- Consumable items
- Themes & customization unlocks
- Data export/import
