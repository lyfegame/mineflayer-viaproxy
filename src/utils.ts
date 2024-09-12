import { appendFileSync, createWriteStream, existsSync, readdirSync, unlinkSync } from "fs";
import { join } from "path";
import { Bot } from "mineflayer";
import { BASE_VIAPROXY_URL } from "./constants";
import { exec } from "child_process";

const debug = require("debug")("mineflayer-viaproxy");

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

function viaProxyAvailable(cwd: string): string | null {
  // don't match the +java8 part, as it's optional.
  const regex = /ViaProxy-\d+\.\d+\.\d+\.jar/;

  // check directory for file names
  const files = readdirSync(cwd);
  for (const file of files) {
    if (regex.test(file)) return join(cwd, file);
  }
  return null;
}

async function getViaProxyJarVersion(use8 = false): Promise<{ version: string; filename: string }> {
  const resp = await fetch(`${BASE_VIAPROXY_URL}/releases/latest`);

  // follow the redirect to get the latest release
  // hardcode-y, but it'll work.

  const version = resp.url.split("/").pop()!.substring(1);

  const filename = "ViaProxy-" + version + (use8 ? "+java8" : "") + ".jar";
  return { version, filename };
}

/**
 * @returns {Promise<string>} the path to the downloaded ViaProxy jar
 */
export async function fetchViaProxyJar(path: string, version: string, filename: string): Promise<string | void> {
  const url = `${BASE_VIAPROXY_URL}/releases/download/v${version}/${filename}`;

  const resp2 = await fetch(url);

  if (!resp2.ok) {
    console.error(`Failed to download ViaProxy jar: ${resp2.statusText}`);
    return;
  }

  // const path = join(__dirname, filename)
  const filepath = join(path, filename);
  const fileStream = createWriteStream(filepath);

  const stream = new WritableStream({
    write(chunk) {
      fileStream.write(chunk);
    },
  });

  if (!resp2.body) throw new Error("No body in response");
  await resp2.body.pipeTo(stream);

  return filepath;
}

export async function verifyLocation(cwd: string, autoUpdate = true, location?: string): Promise<string> {
  if (!location || !existsSync(location)) {
    const javaVer = await checkJavaVersion();

    if (!autoUpdate) {
      const viaProxy = viaProxyAvailable(cwd);
      if (viaProxy) {
        debug("Found ViaProxy jar in directory. Using that.")
        return viaProxy;
      }
    }

    const { version, filename } = await getViaProxyJarVersion(javaVer < 17);

    if (autoUpdate) {
      const testLoc = join(cwd, filename);
      if (existsSync(testLoc)) {
        debug("ViaProxy jar already exists, skipping download.");
        return testLoc;
      } else {
        const available = viaProxyAvailable(cwd);
        if (available) {
          unlinkSync(available);
        }
      }
    }

    const jar = await fetchViaProxyJar(cwd, version, filename);
    if (!jar) throw new Error("Failed to fetch ViaProxy jar.");
    return jar;
  }

  // TODO check if jar is valid.
  return location;
}

// identify java version and check if it's 8 or higher.
export async function checkJavaVersion(): Promise<number> {
  // don't know why it's like this, but ti is.
  const { stderr: stdout } = await exec("java -version");

  return new Promise<number>((resolve, reject) => {
    if (stdout != null) {
      stdout.on("data", (data: string) => {
        const version = data.split(" ")[2].replace(/"/g, "");
        const major = parseInt(version.split(".")[0]);
        resolve(major);
      });
    }
  });
}
