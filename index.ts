import {Interaction, Message, MessageReaction, ReactionManager} from "discord.js";
import {REST} from "@discordjs/rest";
import {Routes} from "discord-api-types/v9";
import {SlashCommandBuilder} from "@discordjs/builders";

const fs = require('fs');
const { Client, Collection, Intents, PartialUser, PartialMessageReaction, User } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');

const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
	partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

async function manageCommand(interaction: Interaction){
	if (!interaction.isCommand()) return;
	switch (interaction.commandName) {
		case "avatar":
			const tempMessage = await interaction.channel.send("avatar:");
			const bot = tempMessage.author;
			tempMessage.delete();

			return interaction.reply(bot.displayAvatarURL({dynamic: true}));

		case "editable-message":
			//editable message creation
			const editableMessage = await interaction.channel.send("uwu");

			//interaction management
			const reply = await interaction.reply("Created");
			await interaction.deleteReply();
			return reply;
	}
}

async function manageReply(message: Message){
	if(message.type != "REPLY") return;

	client.channels.fetch(message.reference.channelId).then( channel => {
		channel.messages.fetch(message.reference.messageId).then( originalMessage => {
			originalMessage.edit(message.content)
			message.delete()
		})
	})
}

//#region Events hooking

client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', manageCommand);
client.on('messageCreate', manageReply);


client.login(token);
