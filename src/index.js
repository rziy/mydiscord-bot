require("dotenv").config();
require("./database/init");

const express = require("express");

const { Client, Collection, GatewayIntentBits } = require("discord.js");

const loadCommands = require("./handlers/commandHandler");
const loadEvents = require("./handlers/eventHandler");
const loadComponents = require("./handlers/componentHandler");

// =====================
// EXPRESS DUMMY
// =====================

const app = express();

app.get("/", (req, res) => {
  res.send("SaintHost Online");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Web server ready.");
});

// =====================
// DISCORD BOT
// =====================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.commands = new Collection();

loadCommands(client);
loadEvents(client);
loadComponents(client);

client.login(process.env.TOKEN);

process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);
