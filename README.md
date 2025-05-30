# mineflayer-viaproxy

[![NPM version](https://img.shields.io/npm/v/mineflayer-viaproxy.svg)](http://npmjs.com/package/mineflayer-viaproxy)


A mineflayer plugin that allows you to connect to a server through a ViaVersion proxy.

Why? Because I'm tired of people asking for version updates.

If you have issues, join [here](https://discord.gg/g3w4G88y) for support. 
Alternatively, [here](https://discord.gg/prismarinejs-413438066984747026) for general mineflayer support.


### TODOS
- [x] Support bedrock versions
- [x] Support adding accounts to ViaProxy gracefully.
- [x] Make fix for prismarine-registry more robust (see patches) 
- [ ] Add support for more ViaVersion options
- [ ] Add support for more ViaProxy options
- [x] Support Python

## Installation

```bash
npm install mineflayer-viaproxy
```

## Usage

```js
const {createBot} = require('mineflayer-viaproxy')

// only difference is that this must be awaited now.
const bot = await createBot({...})

// if you want to pass viaProxy options, it'd be like so:

const orgBotOpts = {...}
const viaProxyOpts = {...}

// same object. 
const bot = await createBot({...orgBotOpts, ...viaProxyOpts});

```

## API

### Types

#### `AuthType`

```ts
enum AuthType {
    NONE,
    OPENAUTHMOD,
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
interface ViaProxyOpts {
    javaPath?: string;
    bedrock?: boolean;
    localPort?: number;
    localAuth?: AuthType,
    viaProxyLocation?: string;
    viaProxyWorkingDir?: string;
    autoUpdate?: boolean;
    viaProxyStdoutCb?: (data: any) => void
    viaProxyStderrCb?: (data: any) => void

}
```

| Name | Type | Default | Description |
|------|------|---------|-------------|
| javaPath | string | "java" | The path to the java executable. |
| bedrock | boolean | false | Whether or not to use the bedrock version of ViaProxy. |
| localPort | number | *auto determined* | The port to listen on for the local server. If none is specified, it will automatically locate an open port for you on your computer. |
| localAuth | <a href="#authtype">AuthType</a> | AuthType.NONE | The authentication type to use for the local server |
| viaProxyLocation | string | "" | The location of the ViaVersion proxy jar. If none specified, it will download automatically to the CWD + `viaproxy`. |
| viaProxyWorkingDir | string | "" | The working directory for the ViaVersion proxy. If none specified, it will use the CWD + `viaproxy`. |
| autoUpdate | boolean | true | Whether or not to automatically update the ViaVersion proxy. |
| viaProxyStdoutCb | (data: any) => void | undefined | A callback for the stdout of the ViaVersion proxy. |
| viaProxyStderrCb | (data: any) => void | undefined | A callback for the stderr of the ViaVersion proxy. |

