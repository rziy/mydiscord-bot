const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const db = require("../../database/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("settitle")
    .setDescription("Set title reward untuk level tertentu")
    .addIntegerOption((option) =>
      option
        .setName("level")
        .setDescription("Level yang dibutuhkan")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("Title yang didapat")
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const level = interaction.options.getInteger("level");

    const title = interaction.options.getString("title");

    db.prepare(
      `
      INSERT OR REPLACE INTO title_rewards
      (guild_id, level, title)
      VALUES (?, ?, ?)
    `,
    ).run(interaction.guild.id, level, title);

    await interaction.reply({
      content: `✅ Title reward level **${level}** diset ke **${title}**.`,
    });
  },
};
