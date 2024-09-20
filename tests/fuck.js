const { createBot } = require('../dist');

async function startBot() {
    const bot = await createBot({
        username: "Generel_Schwerz",
        logErrors: true,
        version: "1.21.1",
        host: 'ir2.exoticservers.co',//this is normally a different server but I'm just trying on hypixel so that ik it's not a server issue
        port: 3076,
        auth: "microsoft",
        javaPath: "/usr/lib/jvm/java-8-openjdk/jre/bin/java"
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