import { SlashCommand } from "../../types/Discord.types";

export const command: SlashCommand = {
	name: "ping",
	description: "Replies with Pong!",
	aliases: ["p"],
	execute: async (client, interaction) => {
		await interaction.followUp({ content: `${client.ws.ping}ms!` });
	},
};