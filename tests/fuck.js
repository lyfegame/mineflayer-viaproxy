const { createBot } = require('../dist');

async function startBot() {
    const bot = await createBot({
        username: "Parag_Gamer_1",
        logErrors: true,
        version: "1.21.1",
        host: 'play.hypixel.net',//this is normally a different server but I'm just trying on hypixel so that ik it's not a server issue
        port: 25565,
        auth: "microsoft"
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