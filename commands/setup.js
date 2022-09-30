const {
    SlashCommandBuilder
} = require('@discordjs/builders');
const {
    MessageButton,
    MessageEmbed,
    MessageActionRow,
    Message
} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup the ticket system')
        .addChannelOption(option =>
            option.setName('channel')
            .setDescription('The channel the ticket message will be sent to')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('title')
            .setDescription('This will be at the top of the ticket embed e.g. Support')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
            .setDescription('The message which will be on the ticket embed e.g. Click below for support!')
            .setRequired(true)),
    async execute(interaction, client) {

        const MessageOption = await interaction.options.getString('message')
        const TitleOption = await interaction.options.getString('title')
        const channel = await interaction.options.getChannel('channel')

        if (channel.type !== 'GUILD_TEXT') {
            interaction.reply({
                content: 'The channel must be a Text Channel and not a category or voice channel.',
                ephemeral: true
            })
            return
        }

        const button = new MessageButton()
            .setCustomId('ticket-button')
            .setLabel('Open a Ticket')
            .setStyle('PRIMARY')
            .setDisabled(false)
            .setEmoji('🎫')

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('ticket-button')
                .setLabel('Open a Ticket')
                .setStyle('PRIMARY')
                .setDisabled(false)
                .setEmoji('🎫')
            )

        const embed = new MessageEmbed()
            .setTitle(TitleOption)
            .setDescription(MessageOption)
            .setColor(client.config.EmbedColour)

        channel.send({
            embeds: [embed],
            components: [row]
        })
        interaction.reply({
            content: '<:yes:1023629025626832967> I have successfully sent the ticket opener to <#' + channel.id + '>!'
        })
    },
};