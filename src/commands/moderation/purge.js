const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Hapus pesan massal di channel dengan filter pintar')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(opt =>
            opt.setName('jumlah')
                .setDescription('Jumlah pesan yang diperiksa (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
        .addStringOption(opt =>
            opt.setName('filter')
                .setDescription('Pilih tipe pesan yang ingin dihapus')
                .setRequired(false)
                .addChoices(
                    { name: '?? Pesan Bot Saja', value: 'bot' },
                    { name: '?? Pesan Berisi Link Saja', value: 'link' },
                    { name: '??? Pesan Berisi Gambar/Attachment', value: 'attachment' }
                ))
        .addUserOption(opt =>
            opt.setName('user')
                .setDescription('Hanya hapus pesan dari user ini')
                .setRequired(false)),

    async execute(interaction) {
        const amount = interaction.options.getInteger('jumlah');
        const filter = interaction.options.getString('filter');
        const targetUser = interaction.options.getUser('user');

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const fetched = await interaction.channel.messages.fetch({ limit: amount });
            
            let filteredMessages = fetched;
            if (filter === 'bot') {
                filteredMessages = fetched.filter(m => m.author.bot);
            } else if (filter === 'link') {
                filteredMessages = fetched.filter(m => /(https?:\/\/[^\s]+)/g.test(m.content));
            } else if (filter === 'attachment') {
                filteredMessages = fetched.filter(m => m.attachments.size > 0);
            }

            if (targetUser) {
                filteredMessages = filteredMessages.filter(m => m.author.id === targetUser.id);
            }

            if (filteredMessages.size === 0) {
                return interaction.editReply({ content: '? Tidak ada pesan yang cocok dengan filter kamu.' });
            }

            const deleted = await interaction.channel.bulkDelete(filteredMessages, true);
            return interaction.editReply({ content: `? Berhasil menghapus **${deleted.size}** pesan.` });
        } catch (err) {
            console.error(err);
            return interaction.editReply({ content: '? Gagal menghapus pesan (Pesan yang berumur > 14 hari tidak dapat dihapus massal).' });
        }
    }
};
