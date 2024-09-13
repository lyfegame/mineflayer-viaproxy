import { Bot, BotOptions, createBot as orgCreateBot } from "mineflayer";
import { ping } from "minecraft-protocol";
import { ping as bdPing } from "bedrock-protocol";
import { supportedVersions } from "minecraft-data";
import { spawn } from "child_process";
import { AuthType, ViaProxyOpts } from "./types";
import { openAuthLogin } from "./openAuthMod";
import {
  configureGeyserConfig,
  fetchViaProxyJar,
  findOpenPort,
  identifyAccount,
  loadProxySaves,
  openViaProxyGUI,
  verifyGeyserLoc,
  verifyViaProxyLoc,
} from "./utils";
import path from "path";
import { existsSync, mkdir, mkdirSync } from "fs";

import "prismarine-registry";
import { VIA_PROXY_CMD } from "./constants";

const debug = require("debug")("mineflayer-viaproxy");

export async function createBot(options: BotOptions & ViaProxyOpts, oCreateBot = orgCreateBot) {
  let ver: string;

  const bedrock = options.bedrock ?? false;

  if (bedrock) {
    if (options.host == null || options.port == null) throw new Error("Host and port must be provided for bedrock edition.");
    const test = await bdPing({
      host: options.host, // external host
      port: options.port, // external port
    });
    ver = `Bedrock ${test.version}`;
  } else {
    const test = await ping({
      host: options.host, // external host
      port: options.port, // external port
    });

    if (test.version instanceof String) {
      ver = test.version as string;
    } else {
      ver = (test.version as { name: string }).name;
    }
  }

  let bot!: Bot;

  if (bedrock || !supportedVersions.pc.includes(ver)) {
    const cleanupProxy = () => {
      if (bot != null && bot.viaProxy != null && !bot.viaProxy.killed) {
        bot.viaProxy.kill();
        delete bot.viaProxy; // this shouldn't be necessary, but why not.
      }
    };

    const wantedCwd = options.viaProxyWorkingDir ?? path.join(process.cwd(), "viaproxy");

    if (!existsSync(wantedCwd)) {
      await mkdirSync(wantedCwd, { recursive: true });
    }
    const location = await verifyViaProxyLoc(wantedCwd, options.autoUpdate, options.viaProxyLocation);

    const rHost = options.host ?? "localhost";
    const rPort = options.port ?? 25565;
    const port = options.localPort ?? (await findOpenPort());
    const auth = options.localAuth ?? AuthType.NONE; // TODO maybe OPENAUTHMOD if we support by default?

    // perform ViaProxy setup.
    let cmd = VIA_PROXY_CMD(location);
    cmd = cmd + " --target-address " + `${rHost}:${rPort}`;
    cmd = cmd + " --target-version " + `"${ver}"` // comment to auto detect version
    cmd = cmd + " --bind-address " + `localhost:${port}`;
    cmd = cmd + " --auth-method " + auth;

    const newOpts = { ...options };
    // here is where we know we need to initialize ViaProxy.
    newOpts.host = "localhost";
    newOpts.port = port;
    newOpts.version = supportedVersions.pc[supportedVersions.pc.length - 1]; // latest version

    if (auth !== AuthType.ACCOUNT) newOpts.auth = "offline";
    else {
      newOpts.auth = "offline";
      const idx = await identifyAccount(options.username, bedrock, location, wantedCwd);
      cmd = cmd + " --minecraft-account-index" + ` ${idx}`;
    }

    debug(`Launching ViaProxy with cmd: ${cmd}`);

    const viaProxy = spawn(cmd, { shell: true, cwd: wantedCwd });

    // added for robustness, just to be sure.
    process.on("beforeExit", cleanupProxy);

    await new Promise<void>((resolve, reject) => {
      const stdOutListener = (data: string) => {
        if (data.includes("started successfully")) {
          debug("ViaProxy started successfully");

          viaProxy!.stdout.removeListener("data", stdOutListener);
          viaProxy!.stderr.removeListener("data", stdErrListener);
          setTimeout(() => {
            debug("Creating bot after ViaProxy started.");
            bot = oCreateBot(newOpts);
            bot.on("end", cleanupProxy);
            openAuthLogin(bot).then(resolve);
          }, 1000);
        }

        if (data.includes("main/WARN")) {
          const d = data.toString().split("[main/WARN]")[1].trim();
          debug(d);
        }
      };
      const stdErrListener = (data: any) => {
        viaProxy!.stdout.removeListener("data", stdOutListener);
        viaProxy!.stderr.removeListener("data", stdErrListener);
        cleanupProxy();
        reject(new Error("ViaProxy failed to start"));
      };

      viaProxy!.stdout.on("data", stdOutListener);
      viaProxy!.stderr.on("data", stdErrListener);
    });

    bot.viaProxy = viaProxy;
  } else {
    // perform current bot setup.
    bot = oCreateBot(options);
  }

  return bot;
}
