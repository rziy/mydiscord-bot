require("dotenv").config();

const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

const commands = [];

const commandsPath = path.join(__dirname, "src", "commands");
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);

  const commandFiles = fs
    .readdirSync(folderPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    try {
      const command = require(path.join(folderPath, file));

      if (!command.data?.toJSON) {
        console.log(`[BROKEN] ${folder}/${file}`);
        continue;
      }

      console.log(`[COMMAND] ${command.data.name} (${folder}/${file})`);

      commands.push(command.data.toJSON());
    } catch (err) {
      console.error(`[LOAD ERROR] ${folder}/${file}`);
      console.error(err);
    }
  }
}

console.log(`\nTotal Commands: ${commands.length}\n`);

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("Checking Discord API...");

    const me = await rest.get(Routes.user());

    console.log(`Logged in as ${me.username} (${me.id})`);

    console.log("\nDeploying guild commands...");

    const result = await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID,
      ),
      {
        body: commands,
      },
    );

    console.log(
      `✅ Successfully deployed ${result.length} commands to guild ${process.env.GUILD_ID}`,
    );
  } catch (error) {
    console.error("\n===== DEPLOY ERROR =====");
    console.error(error);

    if (error.rawError) {
      console.error("\n===== RAW ERROR =====");
      console.error(error.rawError);
    }

    if (error.requestBody) {
      console.error("\n===== REQUEST BODY =====");
      console.dir(error.requestBody, {
        depth: null,
      });
    }
  }
})();
