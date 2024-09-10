import type {Bot} from "mineflayer";

const debug = require("debug")("mineflayer-viaproxy");

export async function openAuthLogin(bot: Bot) {
    const listener = (packet: any) => {
      const channel = packet.channel;
      if (channel !== "oam:join") return;
    
      debug("Received open auth login request, sending accepting response.")
      bot._client.write("login_plugin_response", {
        messageId: packet.messageId,
        data:  Buffer.from([1])
      });
      bot._client.removeListener("login_plugin_request", listener);
    };
    bot._client.removeAllListeners("login_plugin_request"); // remove default handler.
    bot._client.on("login_plugin_request", listener);
  }
  