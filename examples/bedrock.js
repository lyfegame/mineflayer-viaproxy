const {createBot, AuthType } = require('mineflayer-viaproxy');


(async () => {

    const bot = await createBot({
        host: process.argv[2],
        port: parseInt(process.argv[3]),

        // this will fail usually. The username needs to be an exact match to the account added in ViaProxy.
        username: process.argv[4] ?? "viaproxytest", 

        bedrock: true, // needs to be manually set right now.
        autoUpdate: false,
        localAuth: AuthType.ACCOUNT, // most bedrock accounts require an xbox account.
        viaProxyStdoutCb: (data) => console.log(data.toString()),
        viaProxyStderrCb: (data) => console.error(data.toString())
    })

  
    bot.on("spawn", () => {
        console.log("Bot spawned");
        bot.chat("Hello world!");
    });

    bot.on('chat', (username, message) => {
        console.log(`[${username}] ${message}`);
    });

    // debug events
    bot.on("kicked", console.log.bind(null, 'bot.on("kicked")'));
    bot.on("end", console.log.bind(null, 'bot.on("end")'));
    bot.on("error", console.log.bind(null, 'bot.on("error")'));
    bot._client.on("error", console.log.bind(null, 'bot._client.on("error")'));
    bot._client.on("end", console.log.bind(null, 'bot._client.on("end")'));
})();


