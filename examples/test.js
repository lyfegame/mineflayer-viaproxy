const {createBot} = require('../');


(async () => {
    const bot = await createBot({
        host: process.argv[2],
        port: parseInt(process.argv[3]),
        username: process.argv[4] ?? "viaproxytest",
        // viaProxyStderrCb: (data) => console.log(data.toString()),
        // viaProxyStdoutCb: (data) => console.log(data.toString()),
    })
    
    bot.on("spawn", async () => {
        console.log("Bot spawned");
        await bot.waitForTicks(20);
        bot.chat("hi");
    });

    bot.on('chat', (username, message) => {
        console.log(`[${username}] ${message}`);
    })

    // debug events
    bot.on("kicked", console.log.bind(null, 'bot.on("kicked")'));
    bot.on("end", console.log.bind(null, 'bot.on("end")'));
    bot.on("error", console.log.bind(null, 'bot.on("error")'));
    bot._client.on("error", console.log.bind(null, 'bot._client.on("error")'));
    bot._client.on("end", console.log.bind(null, 'bot._client.on("end")'));
})();
