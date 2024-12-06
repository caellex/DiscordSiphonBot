const { Events, ActionRow } = require('discord.js')

module.exports = {
    name: Events.MessageCreate,
    once: false,
    execute(message){
        console.log(message.author.globalName ? `${message.author.globalName}:` : "[BOT] Mowgli:", message.content)
        }
    }
