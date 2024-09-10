"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBot = createBot;
const mineflayer_1 = require("mineflayer");
const minecraft_protocol_1 = require("minecraft-protocol");
const minecraft_data_1 = require("minecraft-data");
const child_process_1 = require("child_process");
const types_1 = require("./types");
const openAuthMod_1 = require("./openAuthMod");
const utils_1 = require("./utils");
const debug = require("debug")("mineflayer-viaproxy");
const VIA_PROXY_CMD = (loc) => "java -jar " + loc + " cli";
function createBot(options) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const test = yield (0, minecraft_protocol_1.ping)({
            host: options.host,
            port: options.port,
        });
        let ver;
        if (test.version instanceof String) {
            ver = test.version;
        }
        else {
            ver = test.version.name;
        }
        let bot;
        if (!minecraft_data_1.supportedVersions.pc.includes(ver)) {
            const cleanupProxy = () => {
                if (bot != null && bot.viaProxy != null && !bot.viaProxy.killed) {
                    bot.viaProxy.kill();
                    delete bot.viaProxy;
                }
            };
            const location = yield (0, utils_1.verifyLocation)(options.viaProxyLocation);
            const port = (_a = options.localPort) !== null && _a !== void 0 ? _a : (yield (0, utils_1.findOpenPort)());
            const auth = (_b = options.localAuth) !== null && _b !== void 0 ? _b : types_1.AuthType.NONE;
            let cmd = VIA_PROXY_CMD(location);
            cmd = cmd + " --target-address " + `${options.host}:${options.port}`;
            cmd = cmd + " --target-version " + ver;
            cmd = cmd + " --bind-address " + `localhost:${port}`;
            cmd = cmd + " --auth-method " + auth;
            const newOpts = Object.assign({}, options);
            newOpts.host = "localhost";
            newOpts.port = port;
            if (auth !== types_1.AuthType.ACCOUNT)
                newOpts.auth = "offline";
            else
                newOpts.auth = "microsoft";
            const viaProxy = (0, child_process_1.spawn)(cmd, { shell: true });
            process.on("beforeExit", cleanupProxy);
            yield new Promise((resolve, reject) => {
                const stdOutListener = (data) => {
                    if (data.includes("started successfully")) {
                        debug("ViaProxy started successfully");
                        viaProxy.stdout.removeListener("data", stdOutListener);
                        viaProxy.stderr.removeListener("data", stdErrListener);
                        setTimeout(() => {
                            debug("Creating bot after ViaProxy started.");
                            bot = (0, mineflayer_1.createBot)(newOpts);
                            bot.on("end", cleanupProxy);
                            (0, openAuthMod_1.openAuthLogin)(bot).then(resolve);
                        }, 1000);
                    }
                };
                const stdErrListener = (data) => {
                    console.error(data.toString());
                    viaProxy.stdout.removeListener("data", stdOutListener);
                    viaProxy.stderr.removeListener("data", stdErrListener);
                    cleanupProxy();
                    reject();
                };
                viaProxy.stdout.on("data", stdOutListener);
                viaProxy.stderr.on("data", stdErrListener);
            });
            bot.viaProxy = viaProxy;
        }
        else {
            bot = (0, mineflayer_1.createBot)(options);
        }
        return bot;
    });
}
//# sourceMappingURL=func.js.map