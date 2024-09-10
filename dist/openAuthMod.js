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
const debug = require("debug")("mineflayer-viaproxy");
function openAuthLogin(bot) {
    return __awaiter(this, void 0, void 0, function* () {
        const listener = (packet) => {
            const channel = packet.channel;
            if (channel !== "oam:join")
                return;
            debug("Received open auth login request, sending accepting response.");
            bot._client.write("login_plugin_response", {
                messageId: packet.messageId,
                data: Buffer.from([1])
            });
            bot._client.removeListener("login_plugin_request", listener);
        };
        bot._client.removeAllListeners("login_plugin_request");
        bot._client.on("login_plugin_request", listener);
    });
}
//# sourceMappingURL=openAuthMod.js.map