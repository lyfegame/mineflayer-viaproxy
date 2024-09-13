import { appendFileSync, createWriteStream, existsSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from "fs";
import { join } from "path";
import { Bot } from "mineflayer";
import { BASE_VIAPROXY_URL, BASE_GEYSER_URL, VIA_PROXY_CMD } from "./constants";
import { exec } from "child_process";

import jsyaml from "js-yaml";

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
  // ViaProxy-3.3.4-SNAPSHOT.jar
  // ViaProxy-3.3.3.jar
  const regex = /ViaProxy-\d+\.\d+\.\d+(-SNAPSHOT)?(\+java8)?\.jar/;

  // check directory for file names
  const files = readdirSync(cwd);
  for (const file of files) {
    if (regex.test(file)) return join(cwd, file);
  }
  return null;
}

function geyserAvailable(cwd: string): string | null {
  // don't match the +java8 part, as it's optional.
  const regex = /Geyser-\d+\.\d+\.\d+\.jar/;

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

async function getGeyserJarVersion(): Promise<{ version: string; filename: string }> {
  // https://download.geysermc.org/v2/projects/geyser/versions/latest/builds/latest/downloads/viaproxy
  // to: https://download.geysermc.org/v2/projects/geyser/versions/2.4.2/builds/672/downloads/viaproxy

  const resp = await fetch(`${BASE_GEYSER_URL}/versions/latest/builds/latest`);
  // follow the redirect to get the latest release
  // hardcode-y, but it'll work.

  const version = resp.url.split("versions/")[1].split("/")[0];
  const buildVer = resp.url.split("builds/")[1].split("/")[0];

  const filename = `Geyser-${version}-${buildVer}.jar`;

  return { version: `${version}-${buildVer}`, filename };
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

export async function fetchGeyserJar(pluginDir: string, verAndBuild: string, filename: string): Promise<string | void> {
  // https://download.geysermc.org/v2/projects/geyser/versions/latest/builds/latest/downloads/viaproxy

  const [version, build] = verAndBuild.split("-");
  const url = `${BASE_GEYSER_URL}/versions/${version}/builds/${build}/downloads/viaproxy`;

  const resp2 = await fetch(url);

  if (!resp2.ok) {
    console.error(`Failed to download Geyser jar: ${resp2.statusText}`);
    return;
  }

  // const path = join(__dirname, filename)
  const filepath = join(pluginDir, filename);
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

export async function verifyViaProxyLoc(cwd: string, autoUpdate = true, location?: string): Promise<string> {
  if (!location || !existsSync(location)) {
    const javaVer = await checkJavaVersion();

    if (!autoUpdate) {
      const viaProxy = viaProxyAvailable(cwd);
      if (viaProxy) {
        debug("Found ViaProxy jar in directory. Using that.");
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

export async function verifyGeyserLoc(pluginDir: string, autoUpdate = true, location?: string): Promise<string> {
  if (!location || !existsSync(location)) {
    if (!autoUpdate) {
      const geyser = geyserAvailable(pluginDir);
      if (geyser) {
        debug("Found Geyser jar in directory. Using that.");
        return geyser;
      }
    }

    const { version, filename } = await getGeyserJarVersion();

    if (autoUpdate) {
      const testLoc = join(pluginDir, filename);
      if (existsSync(testLoc)) {
        debug("Geyser jar already exists, skipping download.");
        return testLoc;
      } else {
        const available = geyserAvailable(pluginDir);
        if (available) {
          unlinkSync(available);
        }
      }
    }

    debug(`Downloading Geyser jar at ${pluginDir}`);
    const jar = await fetchGeyserJar(pluginDir, version, filename);
    if (!jar) throw new Error("Failed to fetch Geyser jar.");
    return jar;
  }

  return location;
}

// identify java version and check if it's 8 or higher.
export async function checkJavaVersion(): Promise<number> {
  // don't know why it's like this, but ti is.
  const { stderr: stdout, exitCode } = await exec("java -version");

  if (exitCode !== 0) {
    throw new Error("Failed to check Java version. Most likely, java is not installed.");
  }

  return await new Promise<number>((resolve, reject) => {
    if (stdout != null) {
      stdout.on("data", (data: string) => {
        const version = data.split(" ")[2].replace(/"/g, "");
        const major = parseInt(version.split(".")[0]);
        resolve(major);
      });
    }
  });

}

export async function openViaProxyGUI(fullpath: string, cwd: string) {
  console.log("opening ViaProxy. Simply close the window when you're done to allow the code to continue.");

  const test = exec(VIA_PROXY_CMD(fullpath, false), { cwd: cwd });

  await new Promise<void>((resolve, reject) => {
    test.on("close", (code) => {
      resolve();
    });

    test.on("error", (err) => {
      reject(err);
    });

    test.on("exit", (code) => {
      resolve();
    });
  });
}

export function loadProxySaves(cwd: string) {
  const loc = join(cwd, "saves.json");
  if (!existsSync(loc)) throw new Error("No saves found.");

  return JSON.parse(readFileSync(loc, "utf-8"));
}

export async function identifyAccount(username: string, bedrock: boolean, location: string, wantedCwd: string, depth = 0): Promise<number> {
  if (depth < 0) {
    throw new Error("Invaid depth received (below zero). This should never be manually specified.")
  }
  
  const saves = loadProxySaves(wantedCwd);
  const accountTypes = Object.keys(saves).filter((k) => k.startsWith("account"));
  const newestAccounts = accountTypes.map((k) => parseInt(k.split("V")[1])).sort((a, b) => a - b);
  const newestKey = newestAccounts[newestAccounts.length - 1];

  switch (newestKey) {
    case 3: {
      const accounts = saves[`accountsV${newestKey}`];

      if (accounts.length === 0) {
        throw new Error("No accounts found.");
      }

      if (bedrock) {
        const bdAccs = accounts.filter((a: any) => a.accountType.includes("Bedrock"));
        if (bdAccs.length === 0) {
          if (depth >= 1) {
            throw new Error("No bedrock accounts found (even after opening GUI).");
          }
          await openViaProxyGUI(location, wantedCwd);
          return await identifyAccount(username, bedrock, location, wantedCwd, depth + 1);
        }

        const matchName = bdAccs.find((a: any) => a.bedrockSession.mcChain.displayName === username);

        if (matchName == null) {
          if (depth >= 1) {
            throw new Error(
              `No Bedrock account saved with the account name ${username}.\nOptions: ${bdAccs
                .map((a: any) => a.bedrockSession.mcChain.displayName)
                .join(", ")}`
            );
          }

          await openViaProxyGUI(location, wantedCwd);
          return await identifyAccount(username, bedrock, location, wantedCwd, depth + 1);
        }

        const idx = accounts.indexOf(matchName);
        return idx;
      } else {
        const msAccs = accounts.filter((a: any) => a.accountType.includes("Microsoft"));
        if (msAccs.length === 0) {
          if (depth >= 1) {
            throw new Error("No Microsoft accounts found.");
          }
          await openViaProxyGUI(location, wantedCwd);
          return await identifyAccount(username, bedrock, location, wantedCwd, depth + 1);
        }

        const matchName = msAccs.find((a: any) => a.javaSession.mcProfile.name === username);

        if (matchName == null) {
          if (depth >= 1) {
            throw new Error(
              `No Microsoft account saved with the account name ${username}.\nOptions: ${msAccs
                .map((a: any) => a.javaSession.mcProfile.name)
                .join(", ")}`
            );
          }
          await openViaProxyGUI(location, wantedCwd);
          return await identifyAccount(username, bedrock, location, wantedCwd, depth + 1);
        }

        const idx = accounts.indexOf(matchName);
        return idx;
      }
    }
    default:
      throw new Error(`Unsupported account version: ${newestKey}.`);
  }
}

export function configureGeyserConfig(pluginDir: string, localPort: number) {
  const configPath = join(pluginDir, "Geyser/config.yml");

  if (!existsSync(configPath)) {
    throw new Error("Geyser config not found.");
  }

  const config = readFileSync(configPath, "utf-8");
  const parsed = jsyaml.load(config) as any;

  parsed["bedrock"]["port"] = localPort;

  // write back to file.
  const newConfig = jsyaml.dump(parsed);
  writeFileSync(configPath, newConfig);
}
