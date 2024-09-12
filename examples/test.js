const {createBot} = require('../');


(async () => {
    const bot = await createBot({
        username: process.argv[1] ?? "viaproxytest",
        host: process.argv[2],
        port: process.argv[3],
    })
    
    bot.on("spawn", () => {
        console.log("Bot spawned");
        bot.chat("Hello world!");
    });
})();
