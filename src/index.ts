import {
	Interaction,
	Message,
	Client,
	Intents,
	Channel,
	TextBasedChannels,
	CommandInteraction,
	MessageReaction, PartialMessageReaction, CollectorFilter, Collection, BaseGuildTextChannel, TextChannel
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

async function getList(interaction: CommandInteraction): Promise<Message | undefined> {
	const select = interaction.options.getBoolean(paramsName.selectList, false);
	let list: Message | undefined = undefined;

	if (select !== true) {
		const channel = await interaction.channel.fetch() as TextBasedChannels;
		const messages = await channel.messages.fetch()
		list = messages.filter(msg =>
			msg.author == client.user && msg.interaction?.commandName == commandsName.createList
		).first()
	}

	if (list == undefined){
		await interaction.editReply("Reply to the list you want to edit writing `.`")
		await listSelection(interaction).then(async collected => {
			const response = (collected as Collection<string, Message>).first()
			const channel = await client.channels.fetch(response.reference.channelId) as TextBasedChannels;
			list = await channel.messages.fetch(response.reference.messageId);
			await response.delete()
		})
	}


	return list
}

function listSelection(interaction: CommandInteraction) {
	return interaction.channel.awaitMessages({ filter: replyToListFilterGenerator(interaction), max: 1, time: 25000, errors: ['time'] })
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
			const listToRemove: Message | undefined = await getList(interaction);

			if(listToRemove != undefined){
				const lines = helpers.messageToArray(listToRemove.content);
				lines.splice(interaction.options.getInteger(paramsName.listNumber), 1);

				await listToRemove.edit(helpers.arrayToMessage(lines))
				await interaction.deleteReply()
			}
			break;

		case commandsName.listInsert:
			const listToInsert: Message | undefined = await getList(interaction);

			if(listToInsert != undefined){
				const lines = helpers.messageToArray(listToInsert.content);
				lines.splice(interaction.options.getInteger(paramsName.listNumber), 0,
					interaction.options.getString(paramsName.listContent));

				await listToInsert.edit(helpers.arrayToMessage(lines))
				await interaction.deleteReply()
			}
			break;

		case commandsName.listEdit:
			const listToEdit: Message | undefined = await getList(interaction);

			if(listToEdit != undefined){
				const lines = helpers.messageToArray(listToEdit.content);
				lines[interaction.options.getInteger(paramsName.listNumber)] = interaction.options.getString(paramsName.listContent);

				await listToEdit.edit(helpers.arrayToMessage(lines))
				await interaction.deleteReply()
			}
			break;

		case commandsName.listAdd:
			const listToAdd: Message | undefined = await getList(interaction);

			if(listToAdd != undefined) {
				const lines = helpers.messageToArray(listToAdd.content);
				lines.push(interaction.options.getString(paramsName.listContent));

				await listToAdd.edit(helpers.arrayToMessage(lines))
				await interaction.deleteReply()
			}
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

	if(replyMessage.mentions.has(client.user)){
		await manageTag(replyMessage, originalMessage)
	}else if(originalMessage.author.id == client.user.id){
	 	await manageReplyToCommand(replyMessage, originalMessage)
	}
}


async function manageTag(replyMessage: Message, originalMessage: Message) {
	let channels = await (replyMessage.channel as BaseGuildTextChannel).guild.channels.fetch();
	let pinsChannel = (channels.filter( channel => channel.name.includes("pins")).first() as TextChannel);

	//creating the pin
	let pin = await pinsChannel.send(
		{
			content: originalMessage.url + "\nFrom:<@"+originalMessage.author.id+">\n" + originalMessage.content,
			files: originalMessage.attachments.map( attachment => attachment.url)
		}
	);
	originalMessage = await originalMessage.fetch(true)
	originalMessage.reactions.cache.each(async reaction => {
		await pin.react(reaction.emoji)
	})
	

	//linking the pin for 5 seconds
	let botReply = await replyMessage.reply(pin.url)
	setTimeout(async function(){ 
		await botReply.delete();
		await replyMessage.delete();
	 }, 5000); //time in milliseconds
}

async function manageReplyToCommand(replyMessage: Message, originalMessage: Message) {
	
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
