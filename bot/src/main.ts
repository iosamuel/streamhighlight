/*
 * @author: Samuel Burbano
 * @version: 1.0
 */
import Commands from "./lib/commands";

const tmi = require("tmi.js");
require("dotenv").config();

const client = new tmi.client({
  identity: {
    username: process.env.BOT_USERNAME,
    password: process.env.OAUTH_TOKEN
  },
  channels: process.env.CHANNELS_NAME?.split(",")
});

const cmd = new Commands(client);

client.on("message", (target: any, context: any, msg: string, self: any) => {
  if (self) return;

  cmd.resolve(target, context, msg);
});

client.on("connected", (addr: string, port: number) => {
  console.log(`* Connected to ${addr}:${port}`);
});

client.connect();
