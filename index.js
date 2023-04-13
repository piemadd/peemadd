const { Client, GatewayIntentBits } = require('discord.js');
//const { EmbedBuilder } = require('@discordjs/builders');

const { weather } = require('./commands/weather.js');

require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  //await client.user.setStatus('dnd');
  //await client.user.setActivity('testing', { type: 'playing' });

  client.user.setPresence({
    activity: { name: 'with balls', type: 'playing' },
    status: 'dnd',
  });
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  switch (interaction.commandName) {
    case 'ping':
      await interaction.reply('Pong!');
      break;
    case 'weather':
      weather(interaction);
      break;
    default:
      await interaction.reply('Unknown command!');
  }
});

client.login(process.env.TOKEN);