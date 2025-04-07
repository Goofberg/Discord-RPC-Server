const express = require("express");
const http = require("http");
const { Client, GatewayIntentBits } = require("discord.js");
const rateLimit = require("express-rate-limit");
const WebSocket = require('ws');


const app = express();
app.set("trust proxy", true);
const port = process.env.PORT;

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const CHANNEL_ID = "1358469943510962343";
const AUTH_TOKEN = "super-secret-token";
const clients = new Set();


wss.on("connection", (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get("token");

  if (token !== AUTH_TOKEN) {
    ws.close(4001, "Unauthorized");
    return;
  }

  clients.add(ws);
  console.log("🔌 WebSocket client connected");

  ws.on("close", () => {
    clients.delete(ws);
    console.log("❌ WebSocket client disconnected");
  });

  ws.send(JSON.stringify({ message: "Connected to WebSocket server!" }));
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
        ws.send(JSON.stringify({ type: "jumpscare", timestamp: Date.now() }));
      }
    }

    res.send("Jumpscare triggered!");
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Error triggering jumpscare.");
  }
});


app.listen(port, () => {
  console.log(`🖥️ Local API running at http://localhost:${port}/jumpscare`);
  console.log(`🔧 WebSocket server running on ws://localhost:${port}/api/ws?token=${AUTH_TOKEN}`);
});
client.login(process.env.TOKEN);
