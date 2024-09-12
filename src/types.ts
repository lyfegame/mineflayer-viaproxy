export enum AuthType {
    NONE = "NONE",
    OPENAUTHMOD = "OPENAUTHMOD",
    ACCOUNT = "ACCOUNT",
}

export interface ViaProxyOpts {
    localPort?: number;
    localAuth?: AuthType,
    viaProxyLocation?: string;
    viaProxyWorkingDir?: string;
    autoUpdate?: boolean;
}