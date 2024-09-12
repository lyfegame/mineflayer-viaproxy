const {createBot} = require('../');


(async () => {
    const bot = await createBot({
        username: process.argv[2] ?? "viaproxytest",
        host: process.argv[3],
        port: process.argv[4],
    })
    
    bot.on("spawn", () => {
        console.log("Bot spawned");
        bot.chat("Hello world!");
    });
})();
