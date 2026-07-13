# Mind Palace — Requirements Document

## Vision

A Solo Leveling-themed personal development app that turns real-life habits, goals, and learning into a full RPG experience. The user is a Hunter progressing through ranks (E to S) by completing daily quests, clearing dungeons, building a shadow army, and leveling up through discipline.

---

## 1. Systems

### 1.1 Leveling & XP System

- Every action earns XP: completing habits, writing journal entries, finishing goals, reading books, logging workouts
- XP thresholds per level (exponential curve)
- Level displayed on profile with progress bar to next level
- XP multipliers for streaks (e.g., 7-day streak = 1.5x, 30-day = 2x)
- XP breakdown visible: how much earned today, this week, all-time

### 1.2 Daily Quest System

- Auto-generated daily quests beyond regular habits (e.g., "Write 500 words", "Do 50 pushups", "Read for 30 min")
- Quest difficulty tiers: D-rank (easy), C-rank (medium), B-rank (hard), A-rank (challenging)
- Bonus XP for completing all daily quests
- Refresh at midnight; incomplete quests vanish
- Optional "emergency quest" — high-risk, high-reward surprise quests

### 1.3 Skill Trees

- Categories: Discipline, Intelligence, Strength, Vitality, Agility
- Each stat has a skill tree with unlockable perks
- Perks are cosmetic or functional (e.g., unlock new themes, extra quest slots, bonus XP)
- Invest stat points earned per level-up
- Visual tree layout showing locked/unlocked nodes

### 1.4 Inventory & Rewards Shop

- Currency earned from quests, streaks, achievements
- Shop items: themes, profile customizations, title badges
- Consumables: XP boost (2x for a day), streak shield (protect one missed day)
- Inventory screen to view owned items

---

## 2. Library

### 2.1 Book Tracking

- Add books with title, author, cover image
- Status: Want to Read, Reading, Completed
- Reading progress (page/% tracker)
- Notes per book (highlights, thoughts)
- Rating and review on completion
- Stats: books completed this month/year, pages read

### 2.2 Knowledge Base

- Save articles, quotes, learnings
- Organize by topic/category (tags)
- Quick-capture input for new entries
- Search and filter
- Link related entries together
- Source attribution (URL, book, podcast)

### 2.3 Resource Collection

- Curate links, videos, podcasts
- Tag-based organization
- Favorites / pinned items
- Preview cards with title + description
- Categories: Tech, Health, Finance, Personal, etc.

### 2.4 Workout Library

#### Exercise Database
- Exercises organized by muscle group (chest, back, shoulders, arms, legs, core)
- Each exercise has: name, target muscles, secondary muscles, instructions, difficulty
- Visual/image reference for proper form
- Filter by equipment (barbell, dumbbell, bodyweight, cable, machine)

#### Workout Plans
- Create structured routines (Push/Pull/Legs, Upper/Lower, Bro Split, Full Body)
- Assign exercises to days
- Set target sets/reps/rest time
- Active workout mode: follow plan step-by-step with timer
- Template library for common programs

#### Progress Tracking
- Log sets, reps, weight per exercise per session
- Track personal records (PRs) — auto-detect new PRs
- Strength progression graphs over time
- Volume tracking (total weight lifted per session/week)
- Body measurement log (optional): weight, measurements

---

## 3. Gamification — Solo Leveling RPG

### 3.1 Dungeons

- Weekly dungeon: a set of themed challenges to complete within 7 days
- Monthly raid boss: a large goal broken into sub-tasks, must clear before month ends
- Dungeon difficulty scales with hunter rank
- Dungeon rewards: bonus XP, rare currency, exclusive titles
- Failure penalty: lose streak bonus or small XP deduction
- Dungeon types:
  - Discipline Dungeon: maintain perfect habit streaks
  - Knowledge Dungeon: read X pages, save Y notes
  - Strength Dungeon: hit workout targets
  - Custom dungeons: user-defined challenge sets

### 3.2 Shadow Army

- Every completed goal becomes a "shadow" soldier
- Shadows have types based on what was achieved (e.g., a fitness goal = Shadow Knight, reading goal = Shadow Mage)
- Shadow army size displayed on profile
- Army provides passive bonuses:
  - More shadows = slight XP boost
  - Shadow types boost related stats
- Visual army roster showing all shadows with names/icons
- Rare shadows from exceptional achievements (S-rank goals, long streaks)

### 3.3 Rank-Up Gates

- To advance rank (E > D > C > B > A > S), must pass a rank-up gate
- Gate requirements:
  - Minimum level reached
  - Maintain habit streak for X consecutive days
  - Complete a set of rank-specific challenges
  - Clear a rank-up dungeon (boss fight)
- Gate becomes available when requirements are met
- Rank displayed prominently on profile with visual flair per rank
- Each rank unlocks new features/customization
- Rank-down possible if streaks break severely (optional, configurable)

### 3.4 Boss Fights

- Major goals treated as boss fights
- Boss has HP bar — each sub-task/milestone chips away HP
- Boss difficulty: B-rank, A-rank, S-rank based on goal scope
- Defeating a boss: massive XP, shadow soldier, achievement unlock
- Time limit (goal deadline) adds urgency
- Failed boss fight (missed deadline): reduced rewards, boss escapes (can retry)

### 3.5 Titles & Achievements

- Earned through milestones: "Shadow Monarch" (100 shadows), "Iron Will" (365-day streak), "Bookworm" (50 books)
- Displayed on profile as badges
- Title equipped as active display name suffix
- Achievement tiers: Bronze, Silver, Gold, Platinum
- Hidden achievements for discovery

---

## 4. Technical Notes

- All data stored in localStorage (current architecture)
- No backend required — fully client-side
- Modular JS structure (one file per feature)
- Mobile-first design with bottom tab navigation
- Solo Leveling aesthetic: dark theme, neon blue accents, Orbitron/Rajdhani fonts
- Future consideration: export/import data as JSON backup

---

## 5. Priority Order

1. **Phase 1**: XP & Leveling system, rank-up gates, daily quests
2. **Phase 2**: Dungeons, boss fights, shadow army
3. **Phase 3**: Library (books, knowledge base, resources)
4. **Phase 4**: Workout library (exercises, plans, progress)
5. **Phase 5**: Skill trees, inventory, shop
