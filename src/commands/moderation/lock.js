const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Kunci channel agar member tidak bisa mengirim pesan')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addStringOption(option =>
            option.setName('durasi')
                .setDescription('Durasi kunci (contoh: 10m, 1h). Kosongkan jika permanen')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('alasan')
                .setDescription('Alasan mengunci channel')
                .setRequired(false)),

    async execute(interaction) {
        const durationStr = interaction.options.getString('durasi');
        const reason = interaction.options.getString('alasan') || 'Tidak ada alasan diberikan.';
        const channel = interaction.channel;

        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            SendMessages: false
        });

        let durationMs = 0;
        if (durationStr) {
            const match = durationStr.match(/^(\d+)(m|h|d)$/);
            if (match) {
                const num = parseInt(match[1]);
                const unit = match[2];
                if (unit === 'm') durationMs = num * 60 * 1000;
                if (unit === 'h') durationMs = num * 60 * 60 * 1000;
                if (unit === 'd') durationMs = num * 24 * 60 * 60 * 1000;
            }
        }

        const embed = new EmbedBuilder()
            .setTitle('?? Channel Dikunci')
            .setDescription(`Channel ini telah dikunci oleh Moderator.\n**Alasan:** ${reason}`)
            .setColor(0xED4245)
            .setTimestamp();

        if (durationMs > 0) {
            embed.setFooter({ text: `Otomatis terbuka kembali dalam ${durationStr}` });
        }

        await interaction.reply({ embeds: [embed] });

        if (durationMs > 0) {
            setTimeout(async () => {
                await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                    SendMessages: null
                });

                const unlockEmbed = new EmbedBuilder()
                    .setTitle('?? Channel Dibuka Kembali')
                    .setDescription('Waktu penguncian channel telah selesai.')
                    .setColor(0x57F287)
                    .setTimestamp();

                await channel.send({ embeds: [unlockEmbed] });
            }, durationMs);
        }
    }
};
