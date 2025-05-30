export enum AuthType {
    NONE = "NONE",
    OPENAUTHMOD = "OPENAUTHMOD",
    ACCOUNT = "ACCOUNT",
}

export interface ViaProxyOpts {
    forceViaProxy?: boolean;
    javaPath?: string;
    localPort?: number;
    localAuth?: AuthType,
    viaProxyLocation?: string;
    viaProxyWorkingDir?: string;
    autoUpdate?: boolean;
    backendProxyUrl?: string;
    viaProxyStdoutCb?: (data: any) => void
    viaProxyStderrCb?: (data: any) => void

}


