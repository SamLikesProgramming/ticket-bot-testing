const {
    SlashCommandBuilder
} = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('claim')
        .setDescription('Run this command in a ticket channel to claim the ticket'),
    async execute(interaction, client) {
        const key = `${interaction.guild.id}-${interaction.user.id}`
        const executer = await client.guilds.cache.get(interaction.guildId).members.cache.get(interaction.user.id);

        const ChannelID = client.ticketDB.find(data => data.channelID === interaction.channel.id) 
        console.log(ChannelID)

        interaction.reply({
            content: 'Message'
        })
    },
};