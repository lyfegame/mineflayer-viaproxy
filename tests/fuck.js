const { createBot } = require('../dist');

async function startBot() {
    const bot = await createBot({
        username: "Generel_Schwerz",
        logErrors: true,
        version: "1.20.6",
        host: 'play.hypixel.net',//this is normally a different server but I'm just trying on hypixel so that ik it's not a server issue
        port: 25565,
        auth: "microsoft",
        javaPath: "/usr/bin/java"
    })
    console.log("Made bot");

    bot.on('login', async () => {
        console.log("Logged in!");
    })

    bot.on('spawn', async () => {
        console.log("Spawned!");
    })

    bot.on("end", console.log)
    bot.on("kicked", console.log)

}

startBot();