const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');

if (!global.warnDatabase) global.warnDatabase = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('Lihat daftar warning milik member')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(opt =>
            opt.setName('target')
                .setDescription('Member yang ingin dicek warningnya')
                .setRequired(true)),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const userWarns = global.warnDatabase.get(target.id) || [];

        if (userWarns.length === 0) {
            return interaction.reply({ content: `? **${target.tag}** bersih dan tidak memiliki catatan warning.`, flags: MessageFlags.Ephemeral });
        }

        const embed = new EmbedBuilder()
            .setTitle(`?? Histori Warning - ${target.tag}`)
            .setColor(0xED4245)
            .setFooter({ text: `Total Warning: ${userWarns.length}` })
            .setTimestamp();

        userWarns.forEach((w, index) => {
            embed.addFields({
                name: `#${index + 1} | ID: ${w.id}`,
                value: `• **Alasan:** ${w.reason}\n• **Moderator:** ${w.moderator}\n• **Tanggal:** ${w.date}`
            });
        });

        return interaction.reply({ embeds: [embed] });
    }
};
