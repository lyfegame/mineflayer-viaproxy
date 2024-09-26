const {createBot, AuthType} = require('../');


(async () => {
    const bot = await createBot({
        host: process.argv[2],
        port: parseInt(process.argv[3]),
        username: process.argv[4] ?? "viaproxytest",
        viaProxyStderrCb: (data) => console.log(data.toString()),
        viaProxyStdoutCb: (data) => console.log(data.toString()),
    })
    
    bot.on("spawn", async () => {
        console.log("Bot spawned");
        await bot.waitForTicks(20);
        bot.chat("hi");
    });

    bot.on('chat', (username, message) => {
        console.log(`[${username}] ${message}`);
    })

    bot.on('end', (reason) => console.log(reason))
    bot.on('kicked', (reason) => console.log(reason))
})();
