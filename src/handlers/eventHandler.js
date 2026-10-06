const fs = require("fs");
const path = require("path");

module.exports = (client) => {
  const loadEvents = (dir) => {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);

      if (fs.statSync(filePath).isDirectory()) {
        loadEvents(filePath);
        continue;
      }

      if (!file.endsWith(".js")) continue;

      const event = require(filePath);

      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }

      console.log(`[EVENT] ${event.name} (${file})`);
    }
  };

  loadEvents(path.join(__dirname, "../events"));
};
