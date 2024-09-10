import { Bot } from "mineflayer";
export declare function openAuthLogin(bot: Bot): Promise<void>;
export declare function findOpenPort(): Promise<number>;
export declare function fetchViaProxyJar(): Promise<string | void>;
export declare function verifyLocation(location?: string): Promise<string>;
