const express = require("express");
const rateLimit = require("express-rate-limit");
const WebSocket = require('ws');
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
app.set("trust proxy", 1);
const port = process.env.PORT || 10000;
const CHANNEL_ID = "1358469943510962343";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});
client.once("ready", () => {
  console.log(`🤖 Bot is online as ${client.user.tag}`);
});


const wss = new WebSocket.Server({ noServer: true });
const AUTH_TOKEN = "9183617-project-aegis";
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('A new WebSocket client connected!');
  clients.add(ws);
  ws.send(JSON.stringify({ message: 'Connected to WebSocket server!' }));

  ws.on('message', (message) => {
    console.log('Received:', message);
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected!');
    clients.delete(ws);
  });

  ws.on("error", (err) => {
    console.error("⚠️ WebSocket client error:", err.message);
    clients.delete(ws);
    ws.terminate(); 
  });
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

    for (const ws of clients) {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({ type: "jumpscare", timestamp: Date.now() }));
        } catch (err) {
          console.error("Error sending to client:", err.message);
          ws.terminate();
          clients.delete(ws);
        }
      }
    }

    res.send("Jumpscare triggered!");
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Error triggering jumpscare.");
  }
});

app.server = app.listen(port, () => {
  console.log(`🖥️ Local API running at http://localhost:${port}/jumpscare`);
  console.log(`🔧 WebSocket server running on ws://localhost:${port}/api/ws?token=${AUTH_TOKEN}`);
});

app.server.on('upgrade', (request, socket, head) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const path = url.pathname;

  const token = url.searchParams.get("token");
  console.log(`there a trying connection, ${token}, AP: ${token === AUTH_TOKEN}`)
  if (path === '/api/ws' && token === AUTH_TOKEN) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});
client.login(process.env.TOKEN);
