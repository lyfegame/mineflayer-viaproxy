const {createBot} = require('../');


(async () => {
    console.log(process.argv)
    const bot = await createBot({
        host: process.argv[2],
        port: parseInt(process.argv[3]),
        username: process.argv[4] ?? "viaproxytest",
        bedrock: true,
    })

    bot.on('login', ()=> console.log('logged in!'))
    
    bot.on("spawn", () => {
        console.log("Bot spawned");
        bot.chat("Hello world!");
    });

    bot.on("kicked", console.log.bind(null, 'bot.on("kicked")'));
    bot.on("end", console.log.bind(null, 'bot.on("end")'));
    bot.on("error", console.log.bind(null, 'bot.on("error")'));
    bot._client.on("error", console.log.bind(null, 'bot._client.on("error")'));
    bot._client.on("end", console.log.bind(null, 'bot._client.on("end")'));
})();
