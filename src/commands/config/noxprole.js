const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

const db = require("../../database/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("noxprole")
    .setDescription("Manage No XP Roles")

    .addSubcommand((sub) =>
      sub
        .setName("add")
        .setDescription("Tambah role ke No XP Roles")
        .addRoleOption((option) =>
          option.setName("role").setDescription("Role").setRequired(true),
        ),
    )

    .addSubcommand((sub) =>
      sub
        .setName("remove")
        .setDescription("Hapus role dari No XP Roles")
        .addRoleOption((option) =>
          option.setName("role").setDescription("Role").setRequired(true),
        ),
    )

    .addSubcommand((sub) =>
      sub.setName("list").setDescription("Lihat semua No XP Roles"),
    )

    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    // ADD
    if (sub === "add") {
      const role = interaction.options.getRole("role");

      db.prepare(
        `
        INSERT OR IGNORE INTO no_xp_roles
        (guild_id, role_id)
        VALUES (?, ?)
      `,
      ).run(interaction.guild.id, role.id);

      return interaction.reply({
        content: `✅ ${role} ditambahkan ke No XP Roles.`,
      });
    }

    // REMOVE
    if (sub === "remove") {
      const role = interaction.options.getRole("role");

      db.prepare(
        `
        DELETE FROM no_xp_roles
        WHERE guild_id = ?
        AND role_id = ?
      `,
      ).run(interaction.guild.id, role.id);

      return interaction.reply({
        content: `✅ ${role} dihapus dari No XP Roles.`,
      });
    }

    // LIST
    if (sub === "list") {
      const roles = db
        .prepare(
          `
          SELECT *
          FROM no_xp_roles
          WHERE guild_id = ?
        `,
        )
        .all(interaction.guild.id);

      if (!roles.length) {
        return interaction.reply({
          content: "❌ Tidak ada No XP Roles.",
        });
      }

      const lines = roles.map((r) => `<@&${r.role_id}>`);

      const embed = new EmbedBuilder()
        .setTitle("🚫 No XP Roles")
        .setDescription(lines.join("\n"))
        .setColor("Red");

      return interaction.reply({
        embeds: [embed],
      });
    }
  },
};
