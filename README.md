# mineflayer-viaproxy

[![NPM version](https://img.shields.io/npm/v/mineflayer-viaproxy.svg)](http://npmjs.com/package/mineflayer-viaproxy)

A mineflayer plugin that allows you to connect to a server through a ViaVersion proxy.

Why? Because I'm tired of people asking for version updates.

## Installation

```bash
npm install mineflayer-viaproxy
```

## Usage

```js
const {createBot} = require('mineflayer-viaproxy')

// do everything else as normal, just import our createBot.

```
## API

<!-- export enum AuthType {
    NONE = "NONE",
    OPENAUTHMOD = "OPENAUTHMOD",
    ACCOUNT = "ACCOUNT",
}

export interface ViaProxyOpts {
    localPort?: number;
    localAuth?: AuthType,
    viaProxyLocation?: string;
} -->

### Types

#### `AuthType`

```ts
enum AuthType {
    NONE
    OPENAUTHMOD
    ACCOUNT
}
```
| Name | Value | Description |
|------|-------|-------------|
| NONE | "NONE" | No authentication |
| OPENAUTHMOD | "OPENAUTHMOD" | OpenAuthMod authentication |
| ACCOUNT | "ACCOUNT" | Account authentication (requires manual setup) |

#### `ViaProxyOpts`

```ts
export interface ViaProxyOpts {
    localPort?: number;
    localAuth?: AuthType,
    viaProxyLocation?: string;
    viaProxyWorkingDir?: string;
    autoUpdate?: boolean;
}
```

| Name | Type | Default | Description |
|------|------|---------|-------------|
| localPort | number | *auto determined* | The port to listen on for the local server. If none is specified, it will automatically locate an open port for you on your computer. |
| localAuth | <a href="#authtype">AuthType</a> | AuthType.NONE | The authentication type to use for the local server |
| viaProxyLocation | string | "" | The location of the ViaVersion proxy jar. If none specified, it will download automatically to the CWD. |
| viaProxyWorkingDir | string | "" | The working directory for the ViaVersion proxy. If none specified, it will use the CWD. |
| autoUpdate | boolean | true | Whether or not to automatically update the ViaVersion proxy. |


