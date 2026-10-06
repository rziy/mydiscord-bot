const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const db = require("../../database/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lb")
    .setDescription("Lihat leaderboard server"),

  async execute(interaction) {
    const users = db
      .prepare(
        `
        SELECT *
        FROM user_levels
        WHERE guild_id = ?
        ORDER BY level DESC, xp DESC
        LIMIT 10
      `,
      )
      .all(interaction.guild.id);

    if (!users.length) {
      return interaction.reply({
        content: "❌ Belum ada data leaderboard.",
      });
    }

    let description = "";

    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      let medal = `#${i + 1}`;

      if (i === 0) medal = "🥇";
      else if (i === 1) medal = "🥈";
      else if (i === 2) medal = "🥉";

      let member;

      try {
        member = await interaction.guild.members.fetch(user.user_id);
      } catch {
        member = null;
      }

      description += `${medal} **${member?.user.username ?? "Unknown User"}**
Level: ${user.level} • XP: ${user.xp}

`;
    }

    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle("🏆 Server Leaderboard")
      .setDescription(description)
      .setFooter({
        text: interaction.guild.name,
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
    });
  },
  async prefixExecute(message) {
    const fakeInteraction = {
      guild: message.guild,

      async reply(data) {
        return message.reply(data);
      },
    };

    return this.execute(fakeInteraction);
  },
};
