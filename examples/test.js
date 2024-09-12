const {createBot} = require('../');


(async () => {
    const bot = await createBot({
        host: process.argv[3],
        port: parseInt(process.argv[2]),
        username: process.argv[4] ?? "viaproxytest",
    })
    
    bot.on("spawn", () => {
        console.log("Bot spawned");
        bot.chat("Hello world!");
    });
})();
