const db = require("../database/db");

function requiredXP(level, multiplier = 1) {
  return Math.floor((100 + level * 100 + level * level * 50) * multiplier);
}

function getUser(guildId, userId) {
  let user = db
    .prepare(
      `
      SELECT *
      FROM user_levels
      WHERE guild_id = ?
      AND user_id = ?
    `,
    )
    .get(guildId, userId);

  if (!user) {
    db.prepare(
      `
      INSERT INTO user_levels (
        guild_id,
        user_id,
        xp,
        level,
        messages,
        voice_seconds
      )
      VALUES (?, ?, 0, 0, 0, 0)
    `,
    ).run(guildId, userId);

    user = {
      guild_id: guildId,
      user_id: userId,
      xp: 0,
      level: 0,
      messages: 0,
      voice_seconds: 0,
    };
  }

  return user;
}

function addXP(guildId, userId, amount) {
  const user = getUser(guildId, userId);

  const newXP = user.xp + amount;

  db.prepare(
    `
    UPDATE user_levels
    SET xp = ?,
        messages = messages + 1
    WHERE guild_id = ?
    AND user_id = ?
  `,
  ).run(newXP, guildId, userId);

  return {
    ...user,
    xp: newXP,
  };
}

function checkLevelUp(guildId, userId) {
  const settings = db
    .prepare(
      `
      SELECT *
      FROM guild_level_settings
      WHERE guild_id = ?
    `,
    )
    .get(guildId);

  const user = getUser(guildId, userId);

  const multiplier = settings?.multiplier ?? 1;

  let currentLevel = user.level;

  let nextLevelXP = requiredXP(currentLevel, multiplier);

  let leveledUp = false;

  while (user.xp >= nextLevelXP) {
    currentLevel++;

    nextLevelXP = requiredXP(currentLevel, multiplier);

    leveledUp = true;
  }

  if (!leveledUp) {
    return null;
  }

  db.prepare(
    `
    UPDATE user_levels
    SET level = ?
    WHERE guild_id = ?
    AND user_id = ?
  `,
  ).run(currentLevel, guildId, userId);

  return {
    oldLevel: user.level,
    newLevel: currentLevel,
  };
}

module.exports = {
  requiredXP,
  getUser,
  addXP,
  checkLevelUp,
};
