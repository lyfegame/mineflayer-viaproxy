export const BASE_VIAPROXY_URL = "https://ci.viaversion.com/view/Platforms/job/ViaProxy/lastStableBuild" //"https://github.com/ViaVersion/ViaProxy";
export const BASE_GEYSER_URL = "https://download.geysermc.org/v2/projects/geyser";
export const VIA_PROXY_CMD = (java_loc: string, loc: string, cli=true) => java_loc + " -jar " + loc + (cli ? " cli" : "");
