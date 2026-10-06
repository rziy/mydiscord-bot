const { Events, EmbedBuilder } = require("discord.js");

const db = require("../../database/db");

const spamTracker = new Map();

async function sendTempWarning(channel, description, ms = 2000) {
  const embed = new EmbedBuilder()
    .setColor("#ff5555")
    .setAuthor({
      name: "SaintHost AutoMod",
      iconURL: channel.guild.iconURL(),
    })
    .setDescription(`⚠️ ${description}`)
    .setTimestamp();

  const msg = await channel.send({
    embeds: [embed],
  });

  setTimeout(() => {
    msg.delete().catch(() => {});
  }, ms);
}

module.exports = {
  name: Events.MessageCreate,

  async execute(message) {
    if (!message.guild) return;
    if (message.author.bot) return;

    const settings = db
      .prepare(
        `
        SELECT *
        FROM automod_settings
        WHERE guild_id = ?
      `,
      )
      .get(message.guild.id);

    if (!settings) return;

    // =====================
    // ANTI LINKS
    // =====================

    if (settings.anti_links) {
      const content = message.content.toLowerCase();

      const hasLink =
        content.includes("http://") ||
        content.includes("https://") ||
        content.includes("discord.gg/") ||
        content.includes("discord.com/invite/");

      if (hasLink) {
        await message.delete().catch(() => {});

        await sendTempWarning(
          message.channel,
          `${message.author}\nLinks are not allowed.`,
        );

        return;
      }
    }

    // =====================
    // ANTI MENTION SPAM
    // =====================

    if (settings.anti_mentions) {
      const mentionCount =
        message.mentions.users.size + message.mentions.roles.size;

      if (mentionCount >= settings.mention_limit) {
        await message.delete().catch(() => {});

        await sendTempWarning(
          message.channel,
          `${message.author}\nToo many mentions.`,
        );

        return;
      }
    }

    // =====================
    // ANTI CAPS
    // =====================

    if (settings.anti_caps) {
      const letters = message.content.replace(/[^a-z]/gi, "");

      if (letters.length >= 10) {
        const uppercase = letters
          .split("")
          .filter((c) => c === c.toUpperCase()).length;

        const percent = (uppercase / letters.length) * 100;

        if (percent >= settings.caps_percent) {
          await message.delete().catch(() => {});

          await sendTempWarning(
            message.channel,
            `${message.author}\nExcessive caps detected.`,
          );

          return;
        }
      }
    }

    // =====================
    // ANTI SPAM
    // =====================

    if (settings.anti_spam) {
      const key = `${message.guild.id}:${message.author.id}`;

      const now = Date.now();

      if (!spamTracker.has(key)) {
        spamTracker.set(key, []);
      }

      const timestamps = spamTracker.get(key);

      timestamps.push(now);

      const recent = timestamps.filter((t) => now - t < 5000);

      spamTracker.set(key, recent);

      if (recent.length >= settings.spam_limit) {
        await message.delete().catch(() => {});

        spamTracker.delete(key);

        await sendTempWarning(
          message.channel,
          `${message.author}\nJangan spam la kau bodo!`,
        );

        return;
      }
    }

    // =====================
    // BAD WORDS
    // =====================

    const badwords = db
      .prepare(
        `
        SELECT word
        FROM badwords
        WHERE guild_id = ?
      `,
      )
      .all(message.guild.id);

    if (badwords.length) {
      const content = message.content.toLowerCase();

      for (const row of badwords) {
        if (content.includes(row.word.toLowerCase())) {
          await message.delete().catch(() => {});

          await sendTempWarning(
            message.channel,
            `${message.author}\nKetikannya dijaga yah sayang ❤️`,
          );

          return;
        }
      }
    }
  },
};
