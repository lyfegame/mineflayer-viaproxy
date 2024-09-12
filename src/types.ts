export enum AuthType {
    NONE = "NONE",
    OPENAUTHMOD = "OPENAUTHMOD",
    ACCOUNT = "ACCOUNT",
}

export interface ViaProxyOpts {
    bedrock?: boolean;
    localPort?: number;
    localAuth?: AuthType,
    viaProxyLocation?: string;
    viaProxyWorkingDir?: string;
    autoUpdate?: boolean;
}