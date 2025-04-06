const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
const port = 3000;

const BOT_TOKEN = "YOUR_BOT_TOKEN";
const CHANNEL_ID = "YOUR_CHANNEL_ID";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once("ready", () => {
  console.log(`🤖 Bot is online as ${client.user.tag}`);
});

app.get("/jumpscare", async (req, res) => {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (channel.isTextBased()) {
      await channel.send("⚠️ Someone clicked the **JUMPSCARE** button!");
    }

    res.send("Jumpscare triggered!");
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Error triggering jumpscare.");
  }
});

// Start Express server
app.listen(port, () => {
  console.log(`🖥️ Local API running at http://localhost:${port}/jumpscare`);
});

// Login the bot
client.login(BOT_TOKEN);
