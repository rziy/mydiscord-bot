const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('announce')
        .setDescription('Kirim pesan pengumuman resmi ke channel tertentu')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(opt =>
            opt.setName('channel')
                .setDescription('Channel tujuan pengumuman')
                .setRequired(true))
        .addStringOption(opt =>
            opt.setName('judul')
                .setDescription('Judul pengumuman')
                .setRequired(true))
        .addStringOption(opt =>
            opt.setName('isi')
                .setDescription('Isi pesan pengumuman')
                .setRequired(true))
        .addStringOption(opt =>
            opt.setName('warna')
                .setDescription('Warna embed (hex code, contoh: #5865F2 atau MERAH, HIJAU, BIRU)')
                .setRequired(false)),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const title = interaction.options.getString('judul');
        const message = interaction.options.getString('isi');
        const colorInput = interaction.options.getString('warna') || '#5865F2';

        const embed = new EmbedBuilder()
            .setTitle(`?? ${title}`)
            .setDescription(message)
            .setColor(colorInput.startsWith('#') ? parseInt(colorInput.replace('#', ''), 16) : 0x5865F2)
            .setFooter({ text: `Dipublikasikan oleh ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        try {
            await channel.send({ embeds: [embed] });
            return interaction.reply({ content: `? Pengumuman berhasil dikirim ke ${channel}!`, flags: MessageFlags.Ephemeral });
        } catch (err) {
            console.error(err);
            return interaction.reply({ content: '? Gagal mengirim pengumuman. Pastikan bot memiliki izin di channel tersebut!', flags: MessageFlags.Ephemeral });
        }
    }
};
