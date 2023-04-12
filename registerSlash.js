const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');

require('dotenv').config();

const commands = [{
  name: 'ping',
  description: 'Replies with Pong!'
}];

commands.push(new SlashCommandBuilder()
  .setName('weather')
  .setDescription('Fetches the current weather for a given location')
  .addStringOption((option) => option.setName('location').setDescription('The location to fetch weather for (defaults to the apartment'))
  .toJSON()
);

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, '723616383924961281'),
      { body: commands },
    );

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, '1093749571009642539'),
      { body: commands }
    )

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();