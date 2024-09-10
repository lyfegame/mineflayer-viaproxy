import { Bot, BotOptions, createBot as orgCreateBot } from "mineflayer";
import { ping } from "minecraft-protocol";
import { supportedVersions } from "minecraft-data";
import { spawn } from "child_process";
import { AuthType, ViaProxyOpts } from "./types";
import { openAuthLogin } from "./openAuthMod";
import { fetchViaProxyJar, findOpenPort, verifyLocation } from "./utils";

const debug = require("debug")("mineflayer-viaproxy");


const VIA_PROXY_CMD = (loc : string) => "java -jar " + loc + " cli";

async function createBot(options: BotOptions & ViaProxyOpts) {


  const test = await ping({
    host: options.host, // external host
    port: options.port, // external port
  });

  let ver: string;
  if (test.version instanceof String) {
    ver = test.version as string;
  } else {
    ver = (test.version as { name: string }).name;
  }

  let bot!: Bot;

  

  if (!supportedVersions.pc.includes(ver)) {

    const cleanupProxy = () => {
      if (bot != null && bot.viaProxy != null && !bot.viaProxy.killed) {
        bot.viaProxy.kill();
        delete bot.viaProxy // this shouldn't be necessary, but why not.
      }
    }

    const location = await verifyLocation(options.viaProxyLocation);
    const port = options.localPort ?? (await findOpenPort());
    const auth = options.localAuth ?? AuthType.NONE; // TODO maybe OPENAUTHMOD if we support by default?


    // perform ViaProxy setup.
    let cmd = VIA_PROXY_CMD(location);
    cmd = cmd + " --target-address " + `${options.host}:${options.port}`;
    cmd = cmd + " --target-version " + ver; // comment to auto detect version
    cmd = cmd + " --bind-address " + `localhost:${port}`;
    cmd = cmd + " --auth-method " + auth;

    const newOpts = { ...options };
    // here is where we know we need to initialize ViaProxy.
    newOpts.host = "localhost";
    newOpts.port = port;

    if (auth !== AuthType.ACCOUNT) newOpts.auth = "offline";
    else newOpts.auth = "microsoft";

    const viaProxy = spawn(cmd, { shell: true });

    process.on("beforeExit", cleanupProxy);

    await new Promise<void>((resolve, reject) => {
      const stdOutListener = (data: string) => {
        if (data.includes("started successfully")) {
          debug("ViaProxy started successfully")

          viaProxy!.stdout.removeListener("data", stdOutListener);
          viaProxy!.stderr.removeListener("data", stdErrListener);
          setTimeout(() => {
            debug("Creating bot after ViaProxy started.")
            bot = orgCreateBot(newOpts);
            bot.on("end", cleanupProxy);
            openAuthLogin(bot).then(resolve);
          }, 1000);
        }
      };
      const stdErrListener = (data: any) => {
        console.error(data.toString());
        viaProxy!.stdout.removeListener("data", stdOutListener);
        viaProxy!.stderr.removeListener("data", stdErrListener);
        cleanupProxy();
        reject();
      };

      viaProxy!.stdout.on("data", stdOutListener);
      viaProxy!.stderr.on("data", stdErrListener);
    });

    bot.viaProxy
  } else {
    // perform current bot setup.
    bot = orgCreateBot(options);
  }

  return bot;
}
