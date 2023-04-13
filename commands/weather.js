
const Fuse = require('fuse.js')
const cities = JSON.parse(require('fs').readFileSync('./data/cities.json', 'utf8'));

const fetch = require('node-fetch');


const fuseOptions = {
  includeScore: true,
  keys: [
    {
      name: 'name'
    }
  ]
}

const fuse = new Fuse(Object.values(cities), fuseOptions);

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

const regex = {
  zipCode: /^\d{5}$/,
}

exports.weather = async (interaction) => {
  try {
    const location = (interaction.options.getString('location') ?? 'apartment').toLowerCase();

    let code = '';
    let name = '';
    let additionalMessage = '';

    console.log(location)

    if (!weatherLocations[location]) {
      if (regex.zipCode.test(location)) {
        console.log('Zip code detected')
        for (const censusPlace in cities) {
          if (cities[censusPlace].zipCodes.includes(location)) {
            console.log('Found zip')
            const coordinates = cities[censusPlace].coordinates;
            const locReq = await fetch(`https://api.weather.gov/points/${coordinates[0]},${coordinates[1]}`, {
              headers: {
                'User-Agent': 'Piero\'s Discord Bot (discordbot@piemadd.com)'
              }
            });
            const locJson = await locReq.json();

            code = `${locJson.properties.gridId}/${locJson.properties.gridX},${locJson.properties.gridY}`;
            name = cities[censusPlace].name;
            additionalMessage = `Results generated from a zip code search with input value \`${location}\``;
          }
        }
      } else {
        const results = fuse.search(location);

        if (results.length > 0) {
          const coordinates = results[0].item.coordinates;
          const locReq = await fetch(`https://api.weather.gov/points/${coordinates[0]},${coordinates[1]}`, {
            headers: {
              'User-Agent': 'Piero\'s Discord Bot (discordbot@piemadd.com)',
            }
          });
          const locJson = await locReq.json();

          code = `${locJson.properties.gridId}/${locJson.properties.gridX},${locJson.properties.gridY}`;
          name = results[0].item.name;
          additionalMessage = `Results generated from a fuzzy search with input value \`${location}\` and a score of \`${results[0].score}\``;
        } else {
          await interaction.reply('Location not found!');
          return;
        }
      }
    } else {
      code = weatherLocations[location].code;
      name = weatherLocations[location].name;
    }

    console.log(`Fetching weather for ${location} (${name})`);


    const req = await fetch(`https://api.weather.gov/gridpoints/${code}/forecast`, {
      headers: {
        'User-Agent': 'Piero\'s Discord Bot (discordbot@piemadd.com)'
      }
    });
    const json = await req.json();

    const site = code.split('/')[0];
    const x = code.split('/')[1].split(',')[0];
    const y = code.split('/')[1].split(',')[1];

    const currentPeriod = json.properties.periods[0];

    await interaction.reply({
      embeds: [{
        "author": {
          "name": "Data from the NWS",
          "icon_url": "https://i.imgur.com/Eosd9yI.png",
          "url": `https://forecast.weather.gov/MapClick.php?x=${x}&y=${y}&site=${site}&map_x=${x}&map_y=${y}`
        },
        "title": `Forecast for ${name}`,
        "description": `Time Generated: ${new Intl.DateTimeFormat([], {
          hour12: true,
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          timeZoneName: 'short'
        }).format(new Date(json.properties.generatedAt))}${additionalMessage.length > 0 ? `\n${additionalMessage}` : ''}`,
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
    await interaction.reply('Error fetching weather. API probably ate shit, try again in like 3 seconds idk');
  }
};