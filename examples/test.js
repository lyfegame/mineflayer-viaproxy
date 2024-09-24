const {createBot} = require('../');


(async () => {
    const bot = await createBot({
        host: process.argv[2],
        port: parseInt(process.argv[3]),
        username: process.argv[4] ?? "viaproxytest",
        bedrock: true
    })
    
    bot.on("spawn", () => {
        console.log("Bot spawned");
        bot.chat("Hello world!");
    });

    bot.on('end', (reason) => console.log(reason))
    bot.on('kicked', (reason) => console.log(reason))
})();
