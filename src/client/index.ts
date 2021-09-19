import { Client, Collection } from "discord.js";
import { readdirSync } from "fs";
import path from "path";
import { Command, SlashCommand, Event, Config } from "types/Discord.types";
import config from "config";
import slashCommands from "commands/slash";

class ExtendedClient extends Client {
	public commands: Collection<string, Command> = new Collection();
	public slashCommands: Collection<string, SlashCommand> = new Collection();
	public events: Collection<string, Event> = new Collection();
	public config: Config = config;
	public aliases: Collection<string, Command> = new Collection();

	public async init() {
		this.login(this.config.token);

		// Commands.
		const commandPath = path.join(__dirname, "..", "commands/normal");
		readdirSync(commandPath).forEach((file) => {
			const {
				command,
			}: { command: Command } = require(`${commandPath}/${file}`);

			this.commands.set(command.name, command);

			if (command?.aliases?.length !== 0) {
				command.aliases?.forEach((alias) => {
					this.aliases.set(alias, command);
				});
			}
		});

		// Slash Commands.
		slashCommands.forEach((command) => {
			this.slashCommands.set(command.data.name, command);
		});

		// Events.
		const eventPath = path.join(__dirname, "..", "events");
		readdirSync(eventPath).forEach(async (file) => {
			const { event }: { event: Event } = await import(`${eventPath}/${file}`);
			this.events.set(event.name, event);

			if (event.once) {
				this.once(event.name, event.execute.bind(null, this));
			} else {
				this.on(event.name, event.execute.bind(null, this));
			}
		});
	}
}

const client = new ExtendedClient({
	intents: [
		"GUILDS",
		"GUILD_MESSAGES",
		"GUILD_EMOJIS_AND_STICKERS",
		"GUILD_MESSAGE_REACTIONS",
	],
});
export { ExtendedClient };
export default client;
