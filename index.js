const Discord = require("discord.js");
const { GatewayIntentBits, Collection, REST, Routes } = require("discord.js");
require("dotenv").config();
const path = require("path");
const fs = require("fs");
const db = require("./database/database");
const UserModel = require("./models/user");
const config = require("./config.json")
require("dotenv").config();
const fs = require("node:fs");
const {UploadCommands} = require("./commandUploader")

db.then(() => {
  console.log("Connencted to MongoDB.");
});

const client = new Discord.Client({
  intents: Object.keys(GatewayIntentBits).map((a) => {
    return GatewayIntentBits[a];
  }),
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  // Set a new item in the Collection with the key as the command name and the value as the exported module
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}

client.on("ready", () => {
  UploadCommands()
  console.log(`Gotowy, zalogowano jako ${client.user.username}`);

  client.user.setPresence({
    activities: [
      {
        name: config.bot_status,
      },
    ],
    status: config.bot_status_type,
  });
  UpdateCounters();
  const updateCounters = setInterval(UpdateCounters, config.counter_config.people_counter_interval_ms);

  GetRandom();
  const RandomInterval = setInterval(GetRandom, config.delays_ms.random_account);

  GetTop();
  const TopInterval = setInterval(GetTop, config.delays_ms.top_users);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

client.on("guildMemberAdd", async (member) => {
  console.log(member.user.username, "Has joined the server!");
  const instacordGuild = client.guilds.cache.get(config.main_guild_id);
  const signedOutRole = instacordGuild.roles.cache.get(config.logged_out_role_id);
  const userRole = instacordGuild.roles.cache.get(config.user_role_id);
  const userInDataBase = await UserModel.findOne({ DiscordID: member.user.id });
  if (!userInDataBase) {
    await member.roles.add(signedOutRole);
  } else {
    await member.roles.add(userRole);
  }

  const welcomeChannel = instacordGuild.channels.cache.get(
    config.welcome_config.welcome_channel_id
  );
  const welcomeEmbed = new Discord.EmbedBuilder()
    .setColor(config.welcome_config.welcome_embed.color)
    .setImage(
      `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}`
    )
    .setTitle(config.welcome_config.welcome_embed.title)
    .setDescription(config.welcome_config.welcome_embed.description)
    .addFields(config.welcome_config.welcome_embed.fields);
  await welcomeChannel.send({
    content: `${config.welcome_config.welcome_pre} <@${member.user.id}> ${config.welcome_config.welcome_suff}`,
    embeds: [welcomeEmbed],
  });
});

client.on("guildMemberRemove", async (member) => {
  console.log(member.user.username, "Has left the server.");
  const instacordGuild = client.guilds.cache.get(config.main_guild_id);

  const welcomeChannel = instacordGuild.channels.cache.get(
    config.welcome_config.welcome_channel_id
  );
  const welcomeEmbed = new Discord.EmbedBuilder()
    .setColor(config.welcome_config.leave_embed.color)
    .setImage(
      `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}`
    )
    .setTitle(config.welcome_config.leave_embed.title)
    .setDescription(config.welcome_config.leave_embed.description);
  await welcomeChannel.send({
    content: `${config.welcome_config.leave_embed.leave_pre} <@${member.user.id}> ${config.welcome_config.leave_embed.leave_suff}`,
    embeds: [welcomeEmbed],
  });
});

client.on("messageCreate", async (msg) => {
  const forumChannel = msg.channel.parent;
  const instacordGuild = client.guilds.cache.get(config.main_guild_id);

  const similar = instacordGuild.channels.cache.get(forumChannel.id);

  if (
    similar &&
    similar.parentId ==  config.accounts_cathegory_id &&
    msg.attachments.size > 0
  ) {
    msg.react("❤️");

    const noweChannel = instacordGuild.channels.cache.get(
      config.new_posts_channel_id
    );

    await noweChannel.send(
      `<@${msg.author.id}> ${config.messages_config.posted_a_new_post} <#${msg.channel.id}>`
    );
  }
});

async function UpdateCounters() {
  const guild = client.guilds.cache.get(config.main_guild_id);
  const allPeopleChannel = guild.channels.cache.get(config.counter_config.all_people_channel_id);

  await allPeopleChannel.setName(`${config.counter_config.all_people_name_prefix}${guild.memberCount}`);
}

async function GetRandom() {
  const guild = client.guilds.cache.get(config.main_guild_id);
  var threads = [];
  guild.channels.cache.forEach((channel) => {
    if (
      channel.parentId == config.accounts_cathegory_id &&
      channel.type == Discord.ChannelType.GuildForum
    ) {
      channel.threads.cache.forEach((thread) => {
        threads.push(thread.id);
      });
    }
  });
  const randomIndex = Math.floor(Math.random() * (threads.length - 1));
  const randomThreatId = threads[randomIndex];

  const randomChanellToPost = guild.channels.cache.get(config.random_posts_channel);

  randomChanellToPost.send(
    `## ${config.messages_config.random_post_prefix} <#${randomThreatId}> ${config.messages_config.random_post_suffix}`
  );
}

async function GetTop() {
  const users = await UserModel.find();

  var all = [];
  users.forEach((user) => {
    all.push({
      discordID: user.DiscordID,
      ProfileName: user.ProfileName,
      ProfileLink: user.ProfileLink,
      followers: user.Followers.length,
    });
  });

  const sorted = all.sort((a, b) => a.followers - b.followers);
  var podium = [
    sorted[sorted.length - 1],
    sorted[sorted.length - 2],
    sorted[sorted.length - 3],
  ];
  const guild = client.guilds.cache.get(config.main_guild_id);
  const TopChannel = guild.channels.cache.get(config.top_users_channel_id);

  var sendString = config.messages_config.podium_title;
  var index = 0;
  podium.forEach(async (place) => {
    index++;
    sendString += `**${index}. ${place.ProfileName}** -> <#${place.ProfileLink}>, **${config.messages_config.followers} ${place.followers}** \n`;
  });

  TopChannel.send(sendString);
}

client.login(process.env.TOKEN);
