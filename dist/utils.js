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
exports.openAuthLogin = openAuthLogin;
exports.findOpenPort = findOpenPort;
exports.fetchViaProxyJar = fetchViaProxyJar;
exports.verifyLocation = verifyLocation;
const fs_1 = require("fs");
const path_1 = require("path");
const constants_1 = require("./constants");
function openAuthLogin(bot) {
    return __awaiter(this, void 0, void 0, function* () {
        const listener = (packet) => {
            const channel = packet.channel;
            if (channel !== "oam:join")
                return;
            bot._client.write("login_plugin_response", {
                messageId: packet.messageId,
                data: Buffer.from([1]),
            });
            bot._client.removeListener("login_plugin_request", listener);
        };
        bot._client.removeAllListeners("login_plugin_request");
        bot._client.on("login_plugin_request", listener);
    });
}
function findOpenPort() {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
function fetchViaProxyJar() {
    return __awaiter(this, void 0, void 0, function* () {
        const resp = yield fetch(`${constants_1.BASE_VIAPROXY_URL}/releases/latest`);
        const version = resp.url.split("/").pop().substring(1);
        const filename = "ViaProxy-" + version + ".jar";
        const url = `${constants_1.BASE_VIAPROXY_URL}/releases/download/v${version}/${filename}`;
        const resp2 = yield fetch(url);
        if (!resp2.ok) {
            console.error(`Failed to download ViaProxy jar: ${resp2.statusText}`);
            return;
        }
        const fileStream = (0, fs_1.createWriteStream)(filename);
        const stream = new WritableStream({
            write(chunk) {
                fileStream.write(chunk);
            }
        });
        if (!resp2.body)
            throw new Error("No body in response");
        yield resp2.body.pipeTo(stream);
        return (0, path_1.join)(__dirname, filename);
    });
}
function verifyLocation(location) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!location || !(0, fs_1.existsSync)(location)) {
            const jar = yield fetchViaProxyJar();
            if (!jar)
                throw new Error("Failed to fetch ViaProxy jar.");
            return jar;
        }
        return location;
    });
}
//# sourceMappingURL=utils.js.map