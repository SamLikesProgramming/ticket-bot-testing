const fs = require('fs');
const {
  Client,
  Collection,
  Intents,
  Partials
} = require('discord.js');
const config = require('./config.json');
const {
  REST
} = require('@discordjs/rest');
const {
  Routes
} = require('discord-api-types/v9');
const {
  clientId
} = require('./config.json');
const t = require('./token.json');
const Enmap = require('enmap')

const myEnmap = new Enmap({
  name: 'settings',
  autoFetch: true,
  fetchAll: false
})

const slashcommands = [];
const slashcommandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of slashcommandFiles) {
  const command = require(`./commands/${file}`);
  slashcommands.push(command.data.toJSON());
}

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({
  version: '9'
}).setToken(t.token);

rest.put(Routes.applicationCommands(clientId), {
    body: slashcommands
  })
  .then(() => console.log('Successfully registered application (/) commands.'))
  .catch(console.error);

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.DIRECT_MESSAGES],
  partials: ['CHANNEL']
});

const Discord = require('discord.js');
client.discord = Discord;
client.config = config;
client.settings = myEnmap
client.ticketDB = new Enmap({
  name: 'ticket_db',
  autoFetch: true,
  fetchAll: false,
  ensureProps: true,
  dataDir: './database/'
})

client.commands = new Collection();

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
};

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  client.on(event.name, (...args) => event.execute(...args, client));
};

client.on('interactionCreate', async (interaction) => {
  client.settings.ensure(`${interaction.guild.id}`, {
    clientId: client.user.id,
    StatusText: "tickets",
    StatusType: "WATCHING",
    TicketCategory: "",
    SupportRoleID: "",
    OpeningMessage: "",
    PingSupportRole: "",
    TranscriptChannelID: "",
    TicketNumber: 0,
    EmbedColour: "BLUE"
  })

  client.ticketDB.ensure(`${interaction.guild.id}-${interaction.user.id}`, {
    discordID: "",
    messageID: "",
    ticketID: "",
    channelID: "",
    openTime: "",
    claimedBy: ""
  })

  if (!interaction.isCommand()) return;


  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client, config);
  } catch (error) {
    console.error(error);
    return interaction.reply({
      content: 'There was an error while executing this command!\n' + error,
      ephemeral: true
    });
  };
});

client.login(require('./token.json').token);