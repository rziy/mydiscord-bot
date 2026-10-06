const db = require("./db");

// =========================
// USERS
// =========================

db.prepare(
  `
CREATE TABLE IF NOT EXISTS users (
    userId TEXT PRIMARY KEY,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1
)
`,
).run();

// =========================
// ECONOMY & INVENTORY
// =========================

db.prepare(
  `
CREATE TABLE IF NOT EXISTS user_economy (
    user_id TEXT NOT NULL,
    guild_id TEXT NOT NULL,
    coins INTEGER DEFAULT 0,
    equipped_bg TEXT DEFAULT 'default',
    PRIMARY KEY (guild_id, user_id)
)
`,
).run();

db.prepare(
  `
CREATE TABLE IF NOT EXISTS user_inventory (
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    bg_id TEXT NOT NULL,
    PRIMARY KEY (guild_id, user_id, bg_id)
)
`,
).run();

// =========================
// WARNINGS
// =========================

db.prepare(
  `
CREATE TABLE IF NOT EXISTS warnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    moderator_id TEXT NOT NULL,
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`,
).run();

// =========================
// GUILD SETTINGS
// =========================

db.prepare(
  `
CREATE TABLE IF NOT EXISTS guild_settings (
    guild_id TEXT PRIMARY KEY,

    modlog_channel TEXT,

    welcome_channel TEXT,
    leave_channel TEXT,

    welcome_enabled INTEGER DEFAULT 0,

    prefix TEXT DEFAULT '!',

    autorole_id TEXT
)
`,
).run();

// =========================
// LEVEL SETTINGS
// =========================

db.prepare(
  `
CREATE TABLE IF NOT EXISTS guild_level_settings (
    guild_id TEXT PRIMARY KEY,

    enabled INTEGER DEFAULT 1,

    curve TEXT DEFAULT 'exponential',
    multiplier REAL DEFAULT 1.0,
    max_level INTEGER DEFAULT 100,

    xp_mode TEXT DEFAULT 'random',

    min_xp INTEGER DEFAULT 15,
    max_xp INTEGER DEFAULT 25,

    cooldown INTEGER DEFAULT 60,

    levelup_enabled INTEGER DEFAULT 1,
    levelup_channel TEXT,
    levelup_message TEXT,

    include_levelup_image INTEGER DEFAULT 1,

    stack_rewards INTEGER DEFAULT 1,
    stack_boosters INTEGER DEFAULT 1
)
`,
).run();

db.prepare(
  `
CREATE TABLE IF NOT EXISTS voice_sessions (
    guild_id TEXT,
    user_id TEXT,
    joined_at INTEGER,
    PRIMARY KEY(guild_id, user_id)
)
`,
).run();

// =========================
// USER LEVELS
// =========================

db.prepare(
  `
CREATE TABLE IF NOT EXISTS user_levels (
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,

    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 0,

    messages INTEGER DEFAULT 0,
    voice_seconds INTEGER DEFAULT 0,

    PRIMARY KEY(guild_id, user_id)
)
`,
).run();

db.prepare(
  `
CREATE TABLE IF NOT EXISTS no_xp_channels (
    guild_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,

    PRIMARY KEY (guild_id, channel_id)
)
`,
).run();

db.prepare(
  `
CREATE TABLE IF NOT EXISTS no_xp_roles (
    guild_id TEXT NOT NULL,
    role_id TEXT NOT NULL,

    PRIMARY KEY (guild_id, role_id)
)
`,
).run();

// =========================
// LEVEL REWARDS
// =========================

db.prepare(
  `
CREATE TABLE IF NOT EXISTS level_rewards (
    guild_id TEXT NOT NULL,
    level INTEGER NOT NULL,
    role_id TEXT NOT NULL,
    PRIMARY KEY (guild_id, level)
)
`,
).run();

db.prepare(
  `
CREATE TABLE IF NOT EXISTS title_rewards (
    guild_id TEXT NOT NULL,
    level INTEGER NOT NULL,
    title TEXT NOT NULL,

    PRIMARY KEY (guild_id, level)
)
`,
).run();

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS automod_settings (
    guild_id TEXT PRIMARY KEY,

    anti_links INTEGER DEFAULT 0,

    anti_spam INTEGER DEFAULT 0,
    spam_limit INTEGER DEFAULT 5,

    anti_mentions INTEGER DEFAULT 0,
    mention_limit INTEGER DEFAULT 5,

    anti_caps INTEGER DEFAULT 0,
    caps_percent INTEGER DEFAULT 70
)
  `,
).run();

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS badwords (
    guild_id TEXT NOT NULL,
    word TEXT NOT NULL,

    PRIMARY KEY(guild_id, word)
)
  `,
).run();

db.prepare(
  `
CREATE TABLE IF NOT EXISTS xp_booster_roles (
    guild_id TEXT NOT NULL,
    role_id TEXT NOT NULL,
    multiplier REAL NOT NULL,

    PRIMARY KEY (guild_id, role_id)
)
`,
).run();

db.prepare(
  `
CREATE TABLE IF NOT EXISTS xp_events (
    guild_id TEXT PRIMARY KEY,
    multiplier REAL DEFAULT 1
)
`,
).run();

// =========================
// SAFE MIGRATIONS
// =========================

try {
  db.prepare(
    `
    ALTER TABLE guild_settings
    ADD COLUMN autorole_id TEXT
  `,
  ).run();
} catch {}

try {
  db.prepare(
    `
    ALTER TABLE guild_settings
    ADD COLUMN leave_channel TEXT
  `,
  ).run();
} catch {}

try {
  db.prepare(
    `
    ALTER TABLE guild_level_settings
    ADD COLUMN voice_enabled INTEGER DEFAULT 1
  `,
  ).run();
} catch {}

try {
  db.prepare(
    `
    ALTER TABLE guild_level_settings
    ADD COLUMN voice_min_xp INTEGER DEFAULT 10
  `,
  ).run();
} catch {}

try {
  db.prepare(
    `
    ALTER TABLE guild_level_settings
    ADD COLUMN voice_max_xp INTEGER DEFAULT 20
  `,
  ).run();
} catch {}

try {
  db.prepare(
    `
    ALTER TABLE guild_level_settings
    ADD COLUMN voice_cooldown INTEGER DEFAULT 60
  `,
  ).run();
} catch {}

try {
  db.prepare(
    `
    ALTER TABLE guild_level_settings
    ADD COLUMN voice_min_members INTEGER DEFAULT 2
  `,
  ).run();
} catch {}

try {
  db.prepare(
    `
    ALTER TABLE guild_level_settings
    ADD COLUMN voice_anti_afk INTEGER DEFAULT 1
  `,
  ).run();
} catch {}

console.log("[DATABASE] SQLite connected with Economy & Inventory tables.");