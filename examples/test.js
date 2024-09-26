const {createBot, AuthType} = require('../');


(async () => {
    const bot = await createBot({
        host: process.argv[2],
        port: parseInt(process.argv[3]),
        username: process.argv[4] ?? "viaproxytest",
        // bedrock: true,
        auth: "offline",
        localAuth: AuthType.OPENAUTHMOD,
        profilesFolder: "./profiles",
    })
    
    bot.on("spawn", () => {
        console.log("Bot spawned");
        bot.chat("Hello world!");
    });

    bot.on('chat', (username, message) => {
        console.log(`[${username}] ${message}`);
    })

    bot.on('end', (reason) => console.log(reason))
    bot.on('kicked', (reason) => console.log(reason))
})();
