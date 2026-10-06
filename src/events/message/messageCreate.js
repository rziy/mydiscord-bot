const { Events } = require("discord.js");

const db = require("../../database/db");
const { addXP, checkLevelUp } = require("../../utils/xpManager");

const cooldowns = new Map();

module.exports = {
  name: Events.MessageCreate,

  async execute(message, client) {
    if (!message.guild) return;
    if (message.author.bot) return;

    // =====================
    // PREFIX SYSTEM
    // =====================

    const prefix = ".";

    if (message.content.startsWith(prefix)) {
      const args = message.content.slice(prefix.length).trim().split(/\s+/);

      const commandName = args.shift()?.toLowerCase();

      const command = client.commands.get(commandName);

      if (command) {
        if (!command.prefixExecute) {
          return message.reply("⚠️ Command ini belum mendukung prefix.");
        }

        try {
          await command.prefixExecute(message, args, client);
        } catch (err) {
          console.error(err);

          await message.reply("❌ Terjadi kesalahan saat menjalankan command.");
        }

        return;
      }
    }

    // =====================
    // XP SYSTEM
    // =====================

    let settings = db
      .prepare(
        `
        SELECT *
        FROM guild_level_settings
        WHERE guild_id = ?
      `,
      )
      .get(message.guild.id);

    if (!settings) {
      db.prepare(
        `
        INSERT INTO guild_level_settings (guild_id)
        VALUES (?)
      `,
      ).run(message.guild.id);

      settings = db
        .prepare(
          `
          SELECT *
          FROM guild_level_settings
          WHERE guild_id = ?
        `,
        )
        .get(message.guild.id);
    }

    const member = message.member;

    // No XP Channel
    const blockedChannel = db
      .prepare(
        `
        SELECT 1
        FROM no_xp_channels
        WHERE guild_id = ?
        AND channel_id = ?
      `,
      )
      .get(message.guild.id, message.channel.id);

    if (blockedChannel) return;

    // No XP Role
    const blockedRoles = db
      .prepare(
        `
        SELECT role_id
        FROM no_xp_roles
        WHERE guild_id = ?
      `,
      )
      .all(message.guild.id);

    if (blockedRoles.some((r) => member.roles.cache.has(r.role_id))) {
      return;
    }

    const key = `${message.guild.id}:${message.author.id}`;

    const now = Date.now();

    const cooldown = (settings.cooldown ?? 60) * 1000;

    if (cooldowns.has(key) && now - cooldowns.get(key) < cooldown) {
      return;
    }

    cooldowns.set(key, now);

    const minXP = settings.min_xp ?? 15;
    const maxXP = settings.max_xp ?? 25;

    let xp = Math.floor(Math.random() * (maxXP - minXP + 1)) + minXP;

    const boosters = db
      .prepare(
        `
        SELECT *
        FROM xp_booster_roles
        WHERE guild_id = ?
      `,
      )
      .all(message.guild.id);

    let highestMultiplier = 1;

    for (const booster of boosters) {
      if (member.roles.cache.has(booster.role_id)) {
        highestMultiplier = Math.max(highestMultiplier, booster.multiplier);
      }
    }

    xp = Math.floor(xp * highestMultiplier);

    const event = db
      .prepare(
        `
        SELECT *
        FROM xp_events
        WHERE guild_id = ?
      `,
      )
      .get(message.guild.id);

    if (event) {
      xp = Math.floor(xp * event.multiplier);
    }

    addXP(message.guild.id, message.author.id, xp);

    console.log(`[XP] ${message.author.tag} +${xp} XP`);

    const levelUp = checkLevelUp(message.guild.id, message.author.id);

    if (!levelUp) return;

    let rewardText = "";

    // Role Reward
    const reward = db
      .prepare(
        `
        SELECT *
        FROM level_rewards
        WHERE guild_id = ?
        AND level = ?
      `,
      )
      .get(message.guild.id, levelUp.newLevel);

    if (reward) {
      try {
        const role = await message.guild.roles.fetch(reward.role_id);

        if (role) {
          await member.roles.add(role);

          rewardText += `\n🏅 Role Reward: ${role}`;
        }
      } catch (err) {
        console.error(err);
      }
    }

    // Title Reward
    const titleReward = db
      .prepare(
        `
        SELECT *
        FROM title_rewards
        WHERE guild_id = ?
        AND level = ?
      `,
      )
      .get(message.guild.id, levelUp.newLevel);

    if (titleReward) {
      rewardText += `\n✨ Title Unlocked: ${titleReward.title}`;
    }

    await message.channel.send(
      `🎉 ${message.author} naik ke level **${levelUp.newLevel}**!${rewardText}`,
    );
  },
};
