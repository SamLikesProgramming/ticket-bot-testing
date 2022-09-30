let hastebin = require('hastebin');
const {
  Permissions,
  MessageButton,
  MessageEmbed,
  MessageActionRow,
} = require('discord.js')
const discordTranscripts = require('discord-html-transcripts');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isButton()) return;
    const key = `${interaction.guild.id}-${interaction.user.id}`
    if (interaction.customId == "ticket-button") {
      if (client.ticketDB.get(key, 'discordID') === interaction.user.id) {
        interaction.reply({
          content: `It looks like you already have a active ticket open in <#${client.ticketDB.get(key, 'channelID')}>`,
          ephemeral: true
        })
        return
      }

      const ticketChannel = await interaction.guild.channels.create(`ticket-${client.settings.get('TicketNumber')}`, {
        type: 'GUILD_TEXT',
        permissionOverwrites: [{
          id: interaction.guild.id,
          deny: [Permissions.FLAGS.VIEW_CHANNEL],
        }, {
          id: interaction.user.id,
          allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.EMBED_LINKS, Permissions.FLAGS.ATTACH_FILES, Permissions.FLAGS.READ_MESSAGE_HISTORY],
        }, ],
      })

      const row = new MessageActionRow()
        .addComponents(
          new MessageButton()
          .setCustomId('ticket-close')
          .setLabel('Close')
          .setStyle('DANGER')
          .setDisabled(false),
          new MessageButton()
          .setCustomId('ticket-claim')
          .setLabel('Claim')
          .setStyle('SUCCESS')
          .setDisabled(false)
        )

      await interaction.reply({
        content: `Success! I have created a ticket for you in <#${ticketChannel.id}>!`,
        ephemeral: true
      })

      const ticketEmbed = new MessageEmbed()
        .setTitle("New Ticket")
        .setDescription(`<@${interaction.user.id}> has opened a ticket! The Support Team will be with you shortly.`)
        .setColor("GREEN")
        .setFooter(client.user.username, client.user.displayAvatarURL())
        .setTimestamp()

      if (client.settings.get(`${interaction.guild.id}`, 'PingSupportRole') === 'true') {
        const Supportrole = await client.settings.get(`${interaction.guild.id}`, 'SupportRoleID')
        ticketChannel.send({
          content: `<@&${Supportrole}><@${interaction.user.id}>`
        }).then((msg) => msg.delete())
      } else {
        return
      }

      const msgID = await ticketChannel.send({
        embeds: [ticketEmbed],
        components: [row]
      })

      const db = client.ticketDB.set(key, {
        discordID: `${interaction.user.id}`,
        messageID: `${msgID.id}`,
        ticketID: `${client.settings.get('TicketNumber')}`,
        channelID: `${ticketChannel.id}`,
        openTime: `123456`,
        claimedBy: `Not claimed`
      })

      console.log(db)

    } else if (interaction.customId == "ticket-close") {
      if (client.ticketDB.get(key, 'channelID') !== interaction.channel.id) {
        interaction.reply({
          content: `ERROR:\nI couldn't recall any of this ticket information in the database!`,
          ephemeral: true
        })
        return
      }
      let ClaimedBy = ''
      console.log(client.ticketDB.get(key))
      const TicketOpenTime = await parseInt(interaction.channel.createdTimestamp / 1000, 10)
      if (client.ticketDB.get(key, 'claimedBy') === 'Not claimed') {
        ClaimedBy = 'Not claimed'
      } else {
        ClaimedBy = `<@${client.ticketDB.get(key, 'claimedBy')}>`
      }

      const ticketTranscript = new MessageEmbed()
        .setTitle("Ticket Transcript")
        .setColor(client.settings.get('EmbedColour'))
        .addFields({
          name: 'Ticket ID',
          value: `${client.ticketDB.get(key, 'ticketID')}`,
          inline: true
        }, {
          name: 'Opened By',
          value: `<@${client.ticketDB.get(key, 'discordID')}>`,
          inline: true
        }, {
          name: 'Closed By',
          value: `<@${interaction.user.id}>`,
          inline: true
        }, {
          name: 'Open Time',
          value: `<t:${TicketOpenTime}:F>`,
          inline: true
        }, {
          name: 'Claimed By',
          value: `${ClaimedBy}`,
          inline: true
        })

      interaction.reply({
        content: '*Successfully deleted ticket!*'
      })

      console.log(client.settings.get(`${interaction.guild.id}`, 'TranscriptChannelID'))

      interaction.channel.delete()

      const db = await client.ticketDB.set(key, {
        discordID: "",
        messageID: "",
        ticketID: "",
        channelID: "",
        openTime: "",
        claimedBy: ""
      })

      const channel = interaction.channel
      const attachment = await discordTranscripts.createTranscript(channel);
      const TranscriptLogs = await interaction.guild.channels.cache.get(client.settings.get(interaction.guild.id, 'TranscriptChannelID'))

      TranscriptLogs.send({
        embeds: [ticketTranscript],
        files: [attachment]
      })
    } else if (interaction.customId == "ticket-claim") {
      const executer = await client.guilds.cache.get(interaction.guildId).members.cache.get(interaction.user.id);
      if (client.settings.get('SupportRoleID') !== '') {
        if (executer.roles.cache.has(client.settings.get('SupportRoleID')) || executer.permissions.has(client.discord.Permissions.FLAGS.ADMINISTRATOR)) {
          if (client.ticketDB.get(key, 'channelID') !== interaction.channel.id) {
            interaction.reply({
              content: `ERROR:\nI couldn't recall any of this ticket information in the database!`,
              ephemeral: true
            })
            return
          }

          const channel = await interaction.guild.channels.cache.get(client.ticketDB.get(key, 'channelID'))
          const message = await channel.messages.fetch(client.ticketDB.get(key, 'messageID'))

          const updatedEmbed = new MessageEmbed()
            .setTitle("New Ticket")
            .setDescription(`<@${interaction.user.id}> has opened a ticket! The Support Team will be with you shortly.`)
            .setColor("GREEN")
            .setFooter(client.user.username, client.user.displayAvatarURL())
            .setTimestamp()

          const updatedComp = new MessageActionRow()
            .addComponents(
              new MessageButton()
              .setCustomId('ticket-close')
              .setLabel('Close')
              .setStyle('DANGER')
              .setDisabled(false),
              new MessageButton()
              .setCustomId('ticket-claim')
              .setLabel('Claim')
              .setStyle('SUCCESS')
              .setDisabled(true)
            )

          message.edit({
            embeds: [updatedEmbed],
            components: [updatedComp]
          })

          const db = await client.ticketDB.set(key, {
            discordID: `${client.ticketDB.get(key, 'discordID')}`,
            messageID: `${client.ticketDB.get(key, 'messageID')}`,
            ticketID: `${client.ticketDB.get(key, 'ticketID')}`,
            channelID: `${client.ticketDB.get(key, 'channelID')}`,
            openTime: `${client.ticketDB.get(key, 'openTime')}`,
            claimedBy: `${interaction.user.id}`
          })

          client.settings.inc('TicketNumber')

          interaction.reply({
            content: `<@${interaction.user.id}> has claimed this ticket!`
          })
        } else {
          // user doesn't have permissions (detects which permissions they don't have)
          if (!executer.roles.cache.has(client.settings.get('SupportRoleID'))) {
            const errorEmbed = new client.discord.MessageEmbed()
              .setTitle("Missing Permissions!")
              .setColor("RED")
              .setDescription(`You are missing the <@&${client.settings.get('SupportRoleID')}> role!`)
              .setFooter("DFL Utilities", client.user.avatarURL())
            interaction.reply({
              embeds: [errorEmbed],
              ephemeral: true
            })
          } else {
            const errorEmbed = new client.discord.MessageEmbed()
              .setTitle("Missing Permissions!")
              .setColor("RED")
              .setDescription(`You are missing the \`ADMINISTRATOR\` permission!`)
              .setFooter("DFL Utilities", client.user.avatarURL())
            interaction.reply({
              embeds: [errorEmbed],
              ephemeral: true
            })
          }
          return
        }
      } else {
        // doesn't have 
        if (executer.permissions.has(client.discord.Permissions.FLAGS.ADMINISTRATOR)) {
          if (client.ticketDB.get(key, 'channelID') !== interaction.channel.id) {
            interaction.reply({
              content: `ERROR:\nI couldn't recall any of this ticket information in the database!`,
              ephemeral: true
            })
            return
          }

          const channel = await interaction.guild.channels.cache.get(client.ticketDB.get(key, 'channelID'))
          const message = await channel.messages.fetch(client.ticketDB.get(key, 'messageID'))

          const updatedEmbed = new MessageEmbed()
            .setTitle("New Ticket")
            .setDescription(`<@${interaction.user.id}> has opened a ticket! The Support Team will be with you shortly.`)
            .setColor("GREEN")
            .setFooter(client.user.username, client.user.displayAvatarURL())
            .setTimestamp()

          const updatedComp = new MessageActionRow()
            .addComponents(
              new MessageButton()
              .setCustomId('ticket-close')
              .setLabel('Close')
              .setStyle('DANGER')
              .setDisabled(false),
              new MessageButton()
              .setCustomId('ticket-claim')
              .setLabel('Claim')
              .setStyle('SUCCESS')
              .setDisabled(true)
            )

          message.edit({
            embeds: [updatedEmbed],
            components: [updatedComp]
          })

          const db = await client.ticketDB.set(key, {
            discordID: `${client.ticketDB.get(key, 'discordID')}`,
            messageID: `${client.ticketDB.get(key, 'messageID')}`,
            ticketID: `${client.ticketDB.get(key, 'ticketID')}`,
            channelID: `${client.ticketDB.get(key, 'channelID')}`,
            openTime: `${client.ticketDB.get(key, 'openTime')}`,
            claimedBy: `${interaction.user.id}`
          })

          client.settings.inc('TicketNumber')

          interaction.reply({
            content: `<@${interaction.user.id}> has claimed this ticket!`
          })
        } else {
          const errorEmbed = new client.discord.MessageEmbed()
            .setTitle("Missing Permissions!")
            .setColor("RED")
            .setDescription(`You are missing the \`ADMINISTRATOR\` permission!`)
            .setFooter(client.user.username, client.user.avatarURL())
          interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
          })
          return
        }
      }
    };
  },
};