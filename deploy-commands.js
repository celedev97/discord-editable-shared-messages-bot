const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');

//#region register commands
const commands = [

	new SlashCommandBuilder()
		.setName('avatar')
		.setDescription('Get the bot avatar'),

	new SlashCommandBuilder()
		.setName('editable-message')
		.setDescription('Create a shared editable message that can be edited by multiple users')

].map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
	try {
		await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log('Successfully registered application commands.');
	} catch (error) {
		console.error(error);
	}
})();
//#endregion
