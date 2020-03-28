import Command, { CommandExecutionData } from '../../Command';
import Client from '../../util/Client';
import ms from '@naval-base/ms';
import { MessageEmbed } from 'discord.js';
import { RawConsoleData } from '../../util/DatabaseStructures';
import Util from '../../util/Util';

export default class InfoCommand extends Command {
	constructor(client: Client) {
		super(client, {
			aliases: ['i'],
			description: 'Display your console infomation',
			name: 'info',
			usage: '',
			cooldown: 5,
			dmAllowed: true,
			enabled: true,
			permissions: 0,
			channels: ['693225634675032155', '693225595680587887']
		});
	}

	async run({ msg, args }: CommandExecutionData) {
		let data;
		if (msg.member && msg.member!.hasPermission('ADMINISTRATOR') && args[0]) {
			const query = args[0].toUpperCase();
			const [_data] = await this.client.database.query(
				'SELECT * FROM guestmode WHERE discord = ? OR cpukey = ? LIMIT 1',
				query, query
			) as unknown as [RawConsoleData];
			if (!_data) return msg.channel.send('That CPUKey or ID does\'t exist in the database.');
			data = _data;
		} else if (args[0]) {
			return msg.channel.send(msg.member ? 'You can only check other peoples info in the PhoenixLive guild.s' : 'You aren\'t permitted to check other peoples info.');
		} else {
			const [_data] = await this.client.database.query(
				'SELECT * FROM guestmode WHERE discord = ? LIMIT 1',
				msg.author.id
			) as unknown as [RawConsoleData];
			if(!_data) return msg.channel.send('You must link your CPUKey and discord before using this command.');
			data = _data;
		}

		const dateNow = new Date();
		const lastOnline = new Date(data.lastonline);

		return msg.channel.send(new MessageEmbed()
			.setColor(0x214896)
			.setAuthor('phoenixlive.online', this.client.guilds.cache.first()!.iconURL({ dynamic: true }) as string)
			.setURL('https://phoenixlive.online')
			.addFields({
				name: 'Username',
				value: data.name
			}, {
				inline: true,
				name: 'Time Remaining',
				value: 'Freemode' // time > 500 ? 'Lifetime' : timeRemaining
			}, {
				inline: true,
				name: 'Last Online',
				value: (dateNow.getTime() - lastOnline.getTime()) < 60_000 ?
					'Online Now' :
					`${ms(dateNow.getTime() - new Date(lastOnline).getTime(), true)} ago`
			}, {
				inline: true,
				name: 'KV Banned',
				value: data.kvbanned === 1 ? 'Banned' : 'Unbanned'
			}, {
				inline: false,
				name: 'Time Unbanned',
				value: Util.elapsed(data.kvtime.getTime(), dateNow.getTime()) //ms(dateNow.getTime() - new Date(data.kvtime).getTime(), true)
			})
			.setFooter(`Command ran by: ${msg.author.tag}`, msg.author.displayAvatarURL({dynamic: true}))
			.setTimestamp()
		);
	}
}