import { appendFileSync, createWriteStream, existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { Bot } from "mineflayer";
import { BASE_VIAPROXY_URL } from "./constants";

export async function openAuthLogin(bot: Bot) {
  const listener = (packet: any) => {
    const channel = packet.channel;
    if (channel !== "oam:join") return;

    bot._client.write("login_plugin_response", {
      messageId: packet.messageId,
      data: Buffer.from([1]),
    });
    bot._client.removeListener("login_plugin_request", listener);
  };
  bot._client.removeAllListeners("login_plugin_request"); // remove default handler.
  bot._client.on("login_plugin_request", listener);
}

/**
 * Tries to find an open port to use for the prismarine-viewer server.
 */
export async function findOpenPort(): Promise<number> {
  const net = require("net");
  const server = net.createServer();
  return new Promise((resolve, reject) => {
    server.listen(0, () => {
      const port = server.address().port;
      server.close(() => {
        resolve(port);
      });
    });
  });
}

/**
 * @returns {Promise<string>} the path to the downloaded ViaProxy jar
 */
export async function fetchViaProxyJar(): Promise<string | void> {

  const resp = await fetch(`${BASE_VIAPROXY_URL}/releases/latest`);

  // follow the redirect to get the latest release
  // hardcode-y, but it'll work.

  const version = resp.url.split("/").pop()!.substring(1);

  const filename = "ViaProxy-" + version + ".jar";

  const url = `${BASE_VIAPROXY_URL}/releases/download/v${version}/${filename}`;

  const resp2 = await fetch(url);

  if (!resp2.ok) {
    console.error(`Failed to download ViaProxy jar: ${resp2.statusText}`);
    return;
  }

  const fileStream = createWriteStream(filename);

  const stream = new WritableStream({
    write(chunk) {
      fileStream.write(chunk
      );
    }
  });

  if (!resp2.body) throw new Error("No body in response");
  await resp2.body.pipeTo(stream);

  return join(__dirname, filename);
}


export async function verifyLocation(location?: string): Promise<string> {
  if (!location || !existsSync(location)) {
    const jar = await fetchViaProxyJar();
    if (!jar) throw new Error("Failed to fetch ViaProxy jar.");
    return jar;
  }

  // TODO check if jar is valid.
  return location;
}