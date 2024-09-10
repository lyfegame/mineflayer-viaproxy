import { Bot, BotOptions } from "mineflayer";
import { ViaProxyOpts } from "./types";
export declare function createBot(options: BotOptions & ViaProxyOpts): Promise<Bot>;
