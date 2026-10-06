const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');

if (!global.warnDatabase) global.warnDatabase = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Berikan peringatan (warn) resmi kepada member')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(opt =>
            opt.setName('target')
                .setDescription('Member yang ingin di-warn')
                .setRequired(true))
        .addStringOption(opt =>
            opt.setName('alasan')
                .setDescription('Alasan pemberian warning')
                .setRequired(true)),

    async execute(interaction) {
        const target = interaction.options.getMember('target');
        const reason = interaction.options.getString('alasan');

        if (!target) {
            return interaction.reply({ content: '? Member tidak ditemukan di server ini.', flags: MessageFlags.Ephemeral });
        }

        if (target.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.reply({ content: '? Kamu tidak bisa memberi warning ke member dengan role setara/lebih tinggi!', flags: MessageFlags.Ephemeral });
        }

        const warnId = Math.random().toString(36).substring(2, 8).toUpperCase();
        const userWarns = global.warnDatabase.get(target.id) || [];
        
        const newWarn = {
            id: warnId,
            reason: reason,
            moderator: interaction.user.tag,
            date: new Date().toLocaleDateString('id-ID')
        };

        userWarns.push(newWarn);
        global.warnDatabase.set(target.id, userWarns);

        const dmEmbed = new EmbedBuilder()
            .setTitle('?? Peringatan Resmi Diterima')
            .setDescription(`Kamu menerima peringatan di **${interaction.guild.name}**.`)
            .addFields(
                { name: '?? Warn ID', value: `\`${warnId}\``, inline: true },
                { name: '?? Moderator', value: interaction.user.tag, inline: true },
                { name: '?? Alasan', value: reason, inline: false }
            )
            .setColor(0xFEE75C)
            .setTimestamp();

        try { await target.send({ embeds: [dmEmbed] }); } catch (err) {}

        const publicEmbed = new EmbedBuilder()
            .setTitle('??? Member Berhasil Di-warn')
            .setDescription(`**${target.user.tag}** telah diberi peringatan.`)
            .addFields(
                { name: 'Target', value: `<@${target.id}>`, inline: true },
                { name: 'Warn ID', value: `\`${warnId}\``, inline: true },
                { name: 'Total Warning User', value: `**${userWarns.length}** kali`, inline: true },
                { name: 'Alasan', value: reason, inline: false }
            )
            .setColor(0xFEE75C)
            .setTimestamp();

        return interaction.reply({ embeds: [publicEmbed] });
    }
};
