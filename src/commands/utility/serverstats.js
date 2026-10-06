const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverstats')
        .setDescription('Menampilkan statistik lengkap dan detail server saat ini'),

    async execute(interaction) {
        const { guild } = interaction;
        await guild.members.fetch();

        const totalMembers = guild.memberCount;
        const humans = guild.members.cache.filter(m => !m.user.bot).size;
        const bots = guild.members.cache.filter(m => m.user.bot).size;
        const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
        const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
        const categories = guild.channels.cache.filter(c => c.type === 4).size;
        const rolesCount = guild.roles.cache.size - 1;

        const embed = new EmbedBuilder()
            .setTitle(`?? Statistik Server - ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 512 }))
            .setColor(0x5865F2)
            .addFields(
                { name: '?? Pemilik Server', value: `<@${guild.ownerId}>`, inline: true },
                { name: '?? Dibuat Pada', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '?? Boost Level', value: `Level ${guild.premiumTier} (${guild.premiumSubscriptionCount || 0} Boosts)`, inline: true },
                { name: '?? Anggota', value: `• Total: **${totalMembers}**\n• Manusia: **${humans}**\n• Bot: **${bots}**`, inline: true },
                { name: '?? Channel', value: `• Teks: **${textChannels}**\n• Voice: **${voiceChannels}**\n• Kategori: **${categories}**`, inline: true },
                { name: '??? Lainnya', value: `• Total Role: **${rolesCount}**\n• Server ID: \`${guild.id}\``, inline: true }
            )
            .setFooter({ text: `Permintaan oleh ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
