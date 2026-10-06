const db = require("../database/db");

function getUserTitle(guildId, level) {
  const title = db
    .prepare(
      `
      SELECT *
      FROM title_rewards
      WHERE guild_id = ?
      AND level <= ?
      ORDER BY level DESC
      LIMIT 1
    `,
    )
    .get(guildId, level);

  return title?.title ?? "New Member";
}

module.exports = {
  getUserTitle,
};
