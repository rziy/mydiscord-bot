const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Menampilkan informasi lengkap mengenai seorang member')
        .addUserOption(opt =>
            opt.setName('target')
                .setDescription('Member yang ingin dilihat informasinya')
                .setRequired(false)),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('target') || interaction.user;
        const member = await interaction.guild.members.fetch(targetUser.id);

        const roles = member.roles.cache
            .filter(r => r.id !== interaction.guild.id)
            .map(r => r)
            .slice(0, 5)
            .join(', ') || 'Tidak Ada Role';

        const embed = new EmbedBuilder()
            .setTitle(`?? Informasi Pengguna - ${targetUser.username}`)
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 512 }))
            .setColor(member.displayHexColor || 0x5865F2)
            .addFields(
                { name: '??? Tag / Username', value: `\`${targetUser.tag}\``, inline: true },
                { name: '?? User ID', value: `\`${targetUser.id}\``, inline: true },
                { name: '?? Tipe Akun', value: targetUser.bot ? 'Bot' : 'Manusia', inline: true },
                { name: '?? Akun Dibuat', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '?? Masuk Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: '???? Role Teratas', value: `${member.roles.highest}`, inline: true },
                { name: '?? Daftar Role (Top 5)', value: roles, inline: false }
            )
            .setFooter({ text: `Permintaan oleh ${interaction.user.username}` })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
