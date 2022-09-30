module.exports = {
  name: 'ready',
  async execute(client) {
    console.log(`${client.user.tag} is now online.`)
    client.user.setPresence({
      activities: [{
        name: `${client.config.StatusText}`,
        type: `${client.config.StatusType}`
      }]
    });
  }
};