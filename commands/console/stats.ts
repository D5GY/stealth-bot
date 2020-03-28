import Command, { CommandExecutionData } from '../../Command';
import Client from '../../util/Client';
import { MessageEmbed } from 'discord.js';
import { RawConsoleData } from '../../util/DatabaseStructures';

export default class StatsCommand extends Command {
	constructor(client: Client) {
		super(client, {
			aliases: ['serverstast', 's'],
			description: 'Get real time infomation on the server',
			name: 'stats',
			usage: '',
			cooldown: 5,
			dmAllowed: true,
			enabled: true,
			permissions: 0,
			channels: ['693225634675032155', '693225595680587887']
		});
	}

	async run({ msg }: CommandExecutionData) {
		const allClients = await this.client.database.query(
			'SELECT * FROM guestmode'
		) as unknown as RawConsoleData[];
		const [{ freemode }] = await this.client.database.query(
			'SELECT freemode FROM settings'
		);
		const now = Date.now();
		const onlineClients = allClients.filter(client => (now - new Date(client.lastonline).getTime()) < 60_000);

		return msg.channel.send(new MessageEmbed()
			.setColor(0x214896)
			.setAuthor('phoenixlive.online', this.client.guilds.cache.first()!.iconURL({ dynamic: true }) as string)
			.setURL('https://phoenixlive.online')
			.addFields({
				inline: true,
				name: 'All Consoles',
				value: allClients.length
			}, {
				inline: true,
				name: 'Total Lifetime Consoles',
				value: 'N/A in Freemode'
			}, {
				inline: true,
				name: 'Total Online',
				value: onlineClients.length
			}, {
				inline: true,
				name: 'Freemode?',
				value: freemode ? 'Yes' : 'No'
			}, {
				inline: true,
				name: 'Stealth Version',
				value: '1.6.0'
			}, {
				inline: true,
				name: 'Bot version',
				value: '2.0.0-dev'
			})
		);
	}
}