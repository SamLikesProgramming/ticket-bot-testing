const {
    SlashCommandBuilder,
    messageLink
} = require('@discordjs/builders');
const {
    writeFile,
    readFile
} = require('node:fs/promises');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Change the configurations')
        .addSubcommand(subcommand =>
            subcommand
            .setName('ticketcategory')
            .setDescription('Category where ticekts will be made')
            .addChannelOption(option => option.setName('category').setDescription('The category').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
            .setName('supportrole')
            .setDescription('The role which will be pinged and can see the ticket')
            .addRoleOption(option => option.setName('role').setDescription('The support role').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
            .setName('openingmessage')
            .setDescription('The message which will be the starting message of the ticket')
            .addStringOption(option => option.setName('message').setDescription('The opening message').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
            .setName('pingsupportrole')
            .setDescription('Whether or not you want the Support Role to be pinged')
            .addBooleanOption(option => option.setName('option').setDescription('Set "true" for the role to be pinged, set "false" for the role not to be pinged').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
            .setName('transcriptchannel')
            .setDescription('Channel where all ticket logs will be sent to')
            .addChannelOption(option => option.setName('channel').setDescription('The channel that it will be sent to').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
            .setName('view')
            .setDescription('View all of the settings')),
    async execute(interaction, client) {
        const subType = await interaction.options.getSubcommand()
        if (subType === 'ticketcategory') {
            const channel = await interaction.options.getChannel('category');

            if (channel.type !== 'GUILD_CATEGORY') {
                interaction.reply({
                    content: `<#${channel.id}> is not a category! Please provide a category for tickets to be opened in.`,
                    ephemeral: true
                })
                return
            }

            client.settings.set(`${interaction.guild.id}`, `${channel.id}`, 'TicketCategory')

            interaction.reply({
                content: `<:yes:1023629025626832967> I have successfully updated it so tickets will now open in **${channel.name}**!`
            })
        } else if (subType === 'supportrole') {
            const SupportRole = await interaction.options.getRole('role');

            client.settings.set(`${interaction.guild.id}`, `${SupportRole.id}`, 'SupportRoleID')

            interaction.reply({
                content: `<:yes:1023629025626832967> I have successfully updated the Support Role is now **${SupportRole.name}**!`
            })
        } else if (subType === 'openingmessage') {
            const Message = await interaction.options.getString('message');

            client.settings.set(`${interaction.guild.id}`, `${Message}`, 'OpeningMessage')

            interaction.reply({
                content: `<:yes:1023629025626832967> I have successfully updated the opening message to:\n\n**${Message}**`
            })
        } else if (subType === 'pingsupportrole') {
            const Option = await interaction.options.getBoolean('option');

            client.settings.set(`${interaction.guild.id}`, `${Option}`, 'PingSupportRole')

            interaction.reply({
                content: `<:yes:1023629025626832967> I have successfully updated the ping Support Role option to: \`${Option}\``
            })
        } else if (subType === 'view') {

            const channel = await interaction.guild.channels.cache.get(client.settings.get(`${interaction.guild.id}`, "TicketCategory"))

            const ViewEmbed = new client.discord.MessageEmbed()
                .setTitle("Settings")
                .addFields({
                    name: 'Support Role',
                    value: `<@&${client.settings.get(`${interaction.guild.id}`, 'SupportRoleID')}>\n\`${client.settings.get(`${interaction.guild.id}`, 'SupportRoleID')}\``,
                    inline: true
                }, {
                    name: 'Ping Support Role',
                    value: `\`${client.settings.get(`${interaction.guild.id}`, 'PingSupportRole')}\``,
                    inline: true
                }, {
                    name: 'Ticket Category',
                    value: `${channel.name}`,
                    inline: true
                }, {
                    name: 'Ticket Logs Channel',
                    value: `<#${client.settings.get(`${interaction.guild.id}`, "TranscriptChannelID")}>`,
                    inline: true
                }, {
                    name: 'Ticket Message',
                    value: `${client.settings.get(`${interaction.guild.id}`, 'OpeningMessage')}`,
                    inline: true
                }, {
                    name: 'Current Ticket Number',
                    value: `${client.settings.get(`${interaction.guild.id}`, 'TicketNumber')}`,
                    inline: true
                })
                .setColor(client.settings.get(`${interaction.guild.id}`, 'EmbedColour'))
                .setTimestamp()
                .setFooter("To edit a setting type /settings")

            interaction.reply({
                embeds: [ViewEmbed]
            })
        } else if (subType === 'transcriptchannel') {

            const Option = await interaction.options.getChannel('channel');

            client.settings.set(`${interaction.guild.id}`, `${Option.id}`, 'TranscriptChannelID')

            interaction.reply({
                content: `<:yes:1023629025626832967> I have successfully updated the transcript channel, all transcripts (ticket logs) will now be sent to ${Option}!`
            })
        }
    },
};