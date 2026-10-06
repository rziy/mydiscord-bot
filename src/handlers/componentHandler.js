const fs = require("fs");
const path = require("path");

module.exports = (client) => {
  client.buttons = new Map();
  client.modals = new Map();
  client.selectMenus = new Map();

  const loadComponents = (folderPath, collection) => {
    if (!fs.existsSync(folderPath)) {
      return;
    }

    const files = fs
      .readdirSync(folderPath)
      .filter((file) => file.endsWith(".js"));

    for (const file of files) {
      const component = require(path.join(folderPath, file));

      if (!component?.customId) {
        console.log(`Skipped invalid component: ${file}`);
        continue;
      }

      collection.set(component.customId, component);
    }
  };

  loadComponents(path.join(__dirname, "../components/buttons"), client.buttons);

  loadComponents(path.join(__dirname, "../components/modals"), client.modals);

  loadComponents(
    path.join(__dirname, "../components/selectMenus"),
    client.selectMenus,
  );

  console.log(
    `Loaded ${client.buttons.size} buttons, ${client.modals.size} modals, ${client.selectMenus.size} select menus.`,
  );
};
