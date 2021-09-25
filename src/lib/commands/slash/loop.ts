import { SlashCommandBuilder } from "@discordjs/builders";
import { SlashCommand, SlashCommandExecute } from "types/Discord.types";
import { CronJob } from "cron";
import moment from "moment";
import eventCommand from "./events";
import { Timezone } from "google-calendar-node-api/dist/types/Timezone.types";

let job: CronJob;

const loopExecute: SlashCommandExecute = async (_, interaction) => {
	const subcommand = interaction.options.getSubcommand() as "start" | "stop";
	let isJobRunning = job?.running;

	switch (subcommand) {
		case "start": {
			if (isJobRunning) job.stop();

			const time = interaction.options.getString("time");
			const isValid = moment(time, ["HH:mm"], true).isValid();
			const timezone: Timezone = "Europe/Madrid";

			if (isValid) {
				const [h, m] = time.split(":");
				const cronString = `${m} ${h} * * *`;

				console.log(`New job starting at ${time}`);
				console.log(`Current time is ${moment()}`);

				job = new CronJob(
					cronString,
					async () => {
						await interaction.followUp({
							content: "⏰ Daily events incoming!!",
						});
						await eventCommand.execute(_, interaction);
					},
					null,
					true,
					timezone
				);

				await interaction.followUp({
					content: `⏰ The bot will notify daily at ${time}`,
				});
			} else {
				await interaction.followUp({
					content: `Invalid Time (${time})`,
				});
			}

			break;
		}
		case "stop": {
			if (isJobRunning) {
				job.stop();

				await interaction.followUp({
					content: "⏰ Loop Stopped!",
				});
			} else {
				await interaction.followUp({
					content: "No loop scheduled!",
				});
			}
			break;
		}
		default:
			break;
	}
};

const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("loop")
		.setDescription("Sends that day calendar events to every channel"),
	execute: loopExecute,
};

// Subcommands.
command.data
	.addSubcommand((subcommand) =>
		subcommand
			.setName("start")
			.setDescription("Starts the daily remainder")
			.addStringOption((option) =>
				option.setName("time").setDescription("Format HH:MM").setRequired(true)
			)
	)
	.addSubcommand((subcommand) =>
		subcommand.setName("stop").setDescription("Stops the daily remainder")
	);

export default command;
