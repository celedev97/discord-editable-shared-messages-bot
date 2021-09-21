import {
	Interaction,
	Message,
	Client,
	Intents,
	Channel,
	TextBasedChannels,
	CommandInteraction,
	MessageReaction, PartialMessageReaction, CollectorFilter, Collection
} from "discord.js";
const { clientId, guildId, token, } = require('./config.json');

import {paramsName, commandsName} from "./deploy-commands"
import helpers from "./helpers"

const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
	partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

function replyToListFilterGenerator(interaction: Interaction) : CollectorFilter<[Message]>{
	return async response => {
		if (response.content != ".") return false;
		if (response.author.id !== interaction.user.id) return false;
		if (response.reference == null) return false;

		const channel = await client.channels.fetch(response.reference.channelId) as TextBasedChannels;
		const originalMessage = await channel.messages.fetch(response.reference.messageId);

		if (originalMessage.author.id !== client.user.id) return false;

		return originalMessage.interaction?.commandName == commandsName.createList;
	}
}


function listSelection(interaction: CommandInteraction) {
	return interaction.channel.awaitMessages({ filter: replyToListFilterGenerator(interaction), max: 1, time: 10000, errors: ['time'] })
		.catch( reason => {
			interaction.editReply('No list selected, try again');
		})
}

async function manageCommand(interaction: Interaction): Promise<void>{
	if (!interaction.isCommand()) return;
	const output = interaction.deferReply();
	await output;

	switch (interaction.commandName) {
		case commandsName.avatar:
			await interaction.editReply(client.user.displayAvatarURL({dynamic: true}));
			break;

		case commandsName.createMessage:
			await interaction.editReply("uwu");
			break;

		case commandsName.createList:
			await interaction.editReply(interaction.options.getString('name')+":");
			break;

		case commandsName.listRemove:
			await interaction.editReply("Reply to the list you want to edit writing `.`")
			await listSelection(interaction).then( async collected => {
					const response = (collected as Collection<string, Message>).first()
					const channel = await client.channels.fetch(response.reference.channelId) as TextBasedChannels;
					const originalMessage = await channel.messages.fetch(response.reference.messageId);

					const lines = helpers.messageToArray(originalMessage.content);
					lines.splice(interaction.options.getInteger(paramsName.listNumber), 1);

					await originalMessage.edit(helpers.arrayToMessage(lines))
					await response.delete()
					await interaction.deleteReply()
				})
			break;

		case commandsName.listInsert:
			await interaction.editReply("Reply to the list you want to edit writing `.`")
			await listSelection(interaction).then( async collected => {
				const response = (collected as Collection<string, Message>).first()
				const channel = await client.channels.fetch(response.reference.channelId) as TextBasedChannels;
				const originalMessage = await channel.messages.fetch(response.reference.messageId);

				const lines = helpers.messageToArray(originalMessage.content);
				lines.splice(interaction.options.getInteger(paramsName.listNumber), 0,
					interaction.options.getString(paramsName.listContent));

				await originalMessage.edit(helpers.arrayToMessage(lines))
				await response.delete()
				await interaction.deleteReply()
			})
			break;

		case commandsName.listEdit:
			await interaction.editReply("Reply to the list you want to edit writing `.`")
			await listSelection(interaction).then( async collected => {
				const response = (collected as Collection<string, Message>).first()
				const channel = await client.channels.fetch(response.reference.channelId) as TextBasedChannels;
				const originalMessage = await channel.messages.fetch(response.reference.messageId);

				const lines = helpers.messageToArray(originalMessage.content);
				lines[interaction.options.getInteger(paramsName.listNumber)] = interaction.options.getString(paramsName.listContent);

				await originalMessage.edit(helpers.arrayToMessage(lines))
				await response.delete()
				await interaction.deleteReply()
			})
			break;

	}

	return output
}

async function manageReply(replyMessage: Message){
	//#region preparations
	if(replyMessage.type !== "REPLY" || replyMessage.author.id == client.user.id) return;

	//getting the original referred message
	const channel = await client.channels.fetch(replyMessage.reference.channelId) as TextBasedChannels;
	const originalMessage = await channel.messages.fetch(replyMessage.reference.messageId);

	if (originalMessage.author.id != client.user.id) return;
	//#endregion

	//checking the message type and reacting
	if(originalMessage.interaction?.commandName == commandsName.createMessage){
		await originalMessage.edit(replyMessage.content);
	}else if(originalMessage.interaction?.commandName == commandsName.createList){
		if(replyMessage.content == ".") return;

		//cleaning list
		const lines = helpers.messageToArray(originalMessage.content)

		//adding new item
		lines.push(replyMessage.content);

		const newMessageContent = helpers.arrayToMessage(lines)
		await originalMessage.edit(newMessageContent);
	}else{
		await replyMessage.reply("Cannot do anything since the referred message isn't an editable message or a list")
		return
	}
	await replyMessage.delete()
}


//#region Events hooking

client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', manageCommand);
client.on('messageCreate', manageReply);


client.login(token);
