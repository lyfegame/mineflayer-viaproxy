export declare enum AuthType {
    NONE = "NONE",
    OPENAUTHMOD = "OPENAUTHMOD",
    ACCOUNT = "ACCOUNT"
}
export interface ViaProxyOpts {
    localPort?: number;
    localAuth?: AuthType;
    viaProxyLocation?: string;
}
