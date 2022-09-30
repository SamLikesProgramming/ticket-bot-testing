const {
    SlashCommandBuilder
} = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Response time from me'),
    async execute(interaction, client) {
        // await interaction.deferReply({
        //     ephemeral: true
        // })

        
        const db = await client.ticketDB.set(`${interaction.guild.id}-${interaction.user.id}`, {
            discordID: "",
            messageID: "",
            ticketID: "",
            channelID: "",
            openTime: "",
            claimedBy: ""
          })

        console.log(db)

        // await interaction.followUp({
        //     content: `Pong! \`${Math.round(client.ws.ping)}ms\``,
        //     ephemeral: true
        // })
    },
};