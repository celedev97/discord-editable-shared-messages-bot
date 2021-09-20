import {Interaction, Message, Client, Intents, Channel, TextBasedChannels, CommandInteraction} from "discord.js";
const { clientId, guildId, token, } = require('./config.json');

const {paramsName, commandsName} = require("./deploy-commands");

const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
	partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

async function manageCommand(interaction: Interaction){
	if (!interaction.isCommand()) return;
	switch (interaction.commandName) {
		case commandsName.avatar:
			return interaction.reply(client.user.displayAvatarURL({dynamic: true}));

		case commandsName.createMessage:
			return await interaction.reply("uwu");
		case commandsName.createList:
			return await interaction.reply(interaction.options.getString('name')+":");

		case commandsName.listRemove:
			console.log("remove")
			return new Promise<void>(() => {return})

		case commandsName.listInsert:
			return new Promise<void>(() => {return})

		case commandsName.listEdit:
			return new Promise<void>(() => {return})

	}
}

async function manageReply(replyMessage: Message){
	if(replyMessage.type !== "REPLY") return;

	client.channels.fetch(replyMessage.reference.channelId).then( channel => {
		(channel as TextBasedChannels).messages.fetch(replyMessage.reference.messageId).then( originalMessage => {
			//checking if the stuff it's a list
			if(originalMessage.interaction.type != "APPLICATION_COMMAND" || originalMessage.interaction.commandName != "editable-list"){
				//this is not a list
				originalMessage.edit(replyMessage.content);
			}else{
				//removing list numbers
				const searchRegExp = /^`\d*` -/gm;
				const listContent = originalMessage.content.replace(searchRegExp, '');

				//adding the new element
				const lines = listContent.split("\n");
				lines.push(replyMessage.content);

				//putting numbers back
				const digitCount = lines.length.toString().length
				for (let i = 1; i < lines.length; i++) {
					lines[i] = '`'+ zerofill(i, digitCount)+'` -'+lines[i]
				}

				originalMessage.edit(lines.join("\n"));
			}
			replyMessage.delete()
		})
	})
}

//#region Events hooking


function zerofill(number, length) {
	const zeros = length - number.toString().length;
	if(zeros<1) return number;
	return "0".repeat(zeros) + number;
}

client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', manageCommand);
client.on('messageCreate', manageReply);


client.login(token);
