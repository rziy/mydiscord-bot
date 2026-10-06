const { Events, MessageFlags, ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`Error executing ${interaction.commandName}:`, error);
                const errorMsg = { content: '? Terjadi kesalahan saat menjalankan command ini!', flags: MessageFlags.Ephemeral };
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorMsg);
                } else {
                    await interaction.reply(errorMsg);
                }
            }
        }

        // Handle Help Select Menu
        if (interaction.isStringSelectMenu() && interaction.customId === 'help_category') {
            const val = interaction.values[0];
            const helpEmbed = new EmbedBuilder().setColor(0x5865F2);

            if (val === 'help_config') {
                helpEmbed.setTitle('?? Perintah Config').setDescription(
                    '`/addxp`, `/doublexp`, `/noxpchannel`, `/noxprole`, `/reactionrole`, `/removeautorole`, `/removetitle`, `/resetxp`, `/rewards`, `/setautorole`, `/setlevelup`, `/setreward`, `/settitle`, `/setwelcome`, `/setxp`, `/setxpbooster`, `/testleave`, `/testlevelup`, `/testwelcome`, `/titles`, `/togglewelcome`, `/xpconfig`, `/xpsettings`'
                );
            } else if (val === 'help_leveling') {
                helpEmbed.setTitle('?? Perintah Leveling').setDescription(
                    '`/lb` - Lihat leaderboard server\n`/rank` - Lihat rank & XP kamu\n`/voicelb` - Leaderboard voice activity'
                );
            } else if (val === 'help_moderation') {
                helpEmbed.setTitle('??? Perintah Moderation').setDescription(
                    '`/addbadword`, `/automod`, `/ban`, `/clearwarnings`, `/kick`, `/listbadwords`, `/lock`, `/purge`, `/removebadword`, `/setmodlog`, `/timeout`, `/unban`, `/unlock`, `/untimeout`, `/unwarn`, `/warn`, `/warnings`'
                );
            } else if (val === 'help_utility') {
                helpEmbed.setTitle('??? Perintah Utility').setDescription(
                    '`/avatar`, `/botinfo`, `/help`, `/invite`, `/ping`, `/serverinfo`, `/serverstats`, `/setup`, `/support`, `/ticket`, `/userinfo`, `/balance`, `/daily`, `/fun`'
                );
            }

            await interaction.update({ embeds: [helpEmbed] });
        }

        // Button Interactions (Reaction Role & Ticket)
        if (interaction.isButton()) {
            if (interaction.customId.startsWith('rr_')) {
                const roleId = interaction.customId.replace('rr_', '');
                const role = interaction.guild.roles.cache.get(roleId);
                if (!role) return interaction.reply({ content: '? Role tidak ditemukan.', flags: MessageFlags.Ephemeral });

                const member = interaction.member;
                if (member.roles.cache.has(roleId)) {
                    await member.roles.remove(roleId);
                    return interaction.reply({ content: `? Role **${role.name}** dilepas!`, flags: MessageFlags.Ephemeral });
                } else {
                    await member.roles.add(roleId);
                    return interaction.reply({ content: `? Role **${role.name}** diberikan!`, flags: MessageFlags.Ephemeral });
                }
            }

            if (interaction.customId === 'create_ticket') {
                const guild = interaction.guild;
                const user = interaction.user;
                const existingChannel = guild.channels.cache.find(c => c.name === `ticket-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`);
                
                if (existingChannel) {
                    return interaction.reply({ content: `? Kamu sudah memiliki tiket di ${existingChannel}!`, flags: MessageFlags.Ephemeral });
                }

                await interaction.deferReply({ flags: MessageFlags.Ephemeral });

                try {
                    const ticketChannel = await guild.channels.create({
                        name: `ticket-${user.username}`,
                        type: ChannelType.GuildText,
                        permissionOverwrites: [
                            { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
                            { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] },
                            { id: guild.members.me.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] },
                        ],
                    });

                    const embed = new EmbedBuilder()
                        .setTitle(`?? Tiket Bantuan - ${user.username}`)
                        .setDescription('Silakan jelaskan kendala kamu di sini. Staff kami akan segera merespons.')
                        .setColor(0x5865F2);

                    const closeButton = new ButtonBuilder().setCustomId('close_ticket').setLabel('?? Tutup Tiket').setStyle(ButtonStyle.Danger);
                    const row = new ActionRowBuilder().addComponents(closeButton);

                    await ticketChannel.send({ content: `${user}, tiket kamu telah dibuat!`, embeds: [embed], components: [row] });
                    return interaction.editReply({ content: `? Tiket dibuat di ${ticketChannel}!` });
                } catch (err) {
                    return interaction.editReply({ content: '? Gagal membuat tiket. Cek izin Manage Channels bot.' });
                }
            }

            if (interaction.customId === 'close_ticket') {
                await interaction.reply({ content: '?? Tiket akan dihapus dalam 5 detik...' });
                setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
            }
        }
    },
};
