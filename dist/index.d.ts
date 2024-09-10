import { ChildProcessWithoutNullStreams } from "child_process";
declare module "mineflayer" {
    interface Bot {
        viaProxy?: ChildProcessWithoutNullStreams;
    }
}
export { createBot } from "./func";
