const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const rateLimit = require("express-rate-limit");

const app = express();
app.set("trust proxy", true);
const port = process.env.PORT;

const CHANNEL_ID = "1358469943510962343";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once("ready", () => {
  console.log(`🤖 Bot is online as ${client.user.tag}`);
});

const jumpscareLimiter = rateLimit({
  windowMs: 20 * 1000,
  max: 2,
  message: "⏳ Too many jumpscares! Please wait a bit.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.get("/jumpscare", jumpscareLimiter, async (req, res) => {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (channel.isTextBased()) {
      await channel.send("<@609378018510635010> ⚠️ Someone clicked the **JUMPSCARE** button!");
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
client.login(process.env.TOKEN);
