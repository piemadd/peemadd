const { Client, GatewayIntentBits } = require('discord.js');
const { EmbedBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const weatherLocations = {
  'chicago': {
    code: 'LOT/76,73',
    name: 'Chicago, IL',
  },
  'chi': {
    code: 'LOT/76,73',
    name: 'Chicago, IL',
  },
  'apartment': {
    code: 'LOT/73,77',
    name: 'the Apartment',
  },
  'apt': {
    code: 'LOT/73,77',
    name: 'the Apartment',
  },
  'lockport': {
    code: 'LOT/62,59',
    name: 'Lockport, IL',
  },
  'ord': {
    code: 'LOT/66,77',
    name: 'Chicago O\'Hare International Airport',
  },
}

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
      const location = (interaction.options.getString('location') ?? 'apartment').toLowerCase();

      if (!weatherLocations[location]) {
        await interaction.reply(`Unknown location: ${location}`);
        return;
      }

      console.log(`Fetching weather for ${location} (${weatherLocations[location].name})`);

      try {
        const req = await fetch(`https://api.weather.gov/gridpoints/${weatherLocations[location].code}/forecast`, {
          headers: {
            'User-Agent': 'Piero\'s Discord Bot (discordbot@piemadd.com)'
          }
        });
        const json = await req.json();

        const site = weatherLocations[location].code.split('/')[0];
        const x = weatherLocations[location].code.split('/')[1].split(',')[0];
        const y = weatherLocations[location].code.split('/')[1].split(',')[1];

        const currentPeriod = json.properties.periods[0];

        await interaction.reply({
          embeds: [{
            "author": {
              "name": "Data from the NWS",
              "icon_url": "https://i.imgur.com/Eosd9yI.png",
              "url": `https://forecast.weather.gov/MapClick.php?x=${x}&y=${y}&site=${site}&map_x=${x}&map_y=${y}`
            },
            "title": `Forecast for ${weatherLocations[location].name}`,
            "description": `Time Generated: ${new Intl.DateTimeFormat([], {
              hour12: true,
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              timeZoneName: 'short'
            }).format(new Date(json.properties.generatedAt))}`,
            "fields": [
              {
                "name": currentPeriod.name,
                "value": `Short Forecast: **${currentPeriod.shortForecast}**\nTemperature: **${currentPeriod.temperature}°${currentPeriod.temperatureUnit}**\nPrecipitation Chance: **${currentPeriod.probabilityOfPrecipitation.value ?? 0}%**\nRelative Humidity: **${currentPeriod.relativeHumidity.value}%**\nWind Speed: **${currentPeriod.windSpeed} ${currentPeriod.windDirection}**\n\n${currentPeriod.detailedForecast}`
              }
            ],
            "thumbnail": {
              "url": currentPeriod.icon
            },
            "color": "503533"
          }]
        });
      } catch (e) {
        console.error(e);
        await interaction.reply('Error fetching weather!');
      }
      break;
    default:
      await interaction.reply('Unknown command!');
  }
});

client.login(process.env.TOKEN);

