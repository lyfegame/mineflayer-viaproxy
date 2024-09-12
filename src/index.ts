import { ChildProcessWithoutNullStreams } from "child_process";
import "prismarine-registry";

declare module "mineflayer" {
  interface Bot {
    viaProxy?: ChildProcessWithoutNullStreams;
  }
}

export { createBot } from "./func";
export { AuthType, ViaProxyOpts } from "./types";
export { openViaProxyGUI } from "./utils";
