const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const db = require("../../database/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addxp")
    .setDescription("Tambah XP member")
    .addUserOption((option) =>
      option.setName("user").setDescription("Target user").setRequired(true),
    )
    .addIntegerOption((option) =>
      option.setName("amount").setDescription("Jumlah XP").setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");

    const data = db
      .prepare(
        `
        SELECT *
        FROM user_levels
        WHERE guild_id = ?
        AND user_id = ?
      `,
      )
      .get(interaction.guild.id, user.id);

    if (!data) {
      db.prepare(
        `
        INSERT INTO user_levels
        (guild_id, user_id, xp, level)
        VALUES (?, ?, ?, ?)
      `,
      ).run(interaction.guild.id, user.id, amount, 1);
    } else {
      db.prepare(
        `
        UPDATE user_levels
        SET xp = xp + ?
        WHERE guild_id = ?
        AND user_id = ?
      `,
      ).run(amount, interaction.guild.id, user.id);
    }

    await interaction.reply({
      content: `✅ Menambahkan **${amount} XP** ke ${user}.`,
    });
  },
};
