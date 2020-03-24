import Command, { CommandExecutionData } from '../../Command';
import Client from '../../util/Client';
import ms from '@naval-base/ms';
import { MessageEmbed } from 'discord.js';

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
			permissions: 0
		});
	}

	async run({ msg }: CommandExecutionData) {
		const [data] = await this.client.database.query(
			'SELECT * FROM guestmode WHERE discord = ?',
			msg.author.id
		);
		if(!data) return msg.channel.send('You must link your CPUKey and discord before using this command');

		//const dateNow = new Date();
		const time = data.expire;
		const unbanTime = data.kvtime;
		const lastOnline = data.lastonline;
		const timeRemaining = time < Date.now() ? 'Expired' : ms(new Date(time).getTime() - Date.now(), true);


		return msg.channel.send(new MessageEmbed()
			.setColor(0x214896)
			.setAuthor('phoenixlive.online', this.client.guilds.cache.first()!.iconURL({dynamic: true}) as string)
			.setURL('https://phoenixlive.online')
			.addFields({
				inline: false,
				name: 'Username',
				value: data.name
			}, {
				inline: true,
				name: 'Time Remaining',
				value: time < 500 ? 'Lifetime': timeRemaining
			}, {
				inline: true,
				name: 'Time Unbanned',
				value: `${ms(Date.now() - new Date(unbanTime).getTime(), true)}`
			}, {
				inline: true,
				name: 'Last Online',
				value: `${ms(Date.now() - new Date(lastOnline).getTime(), true)}`
			})
			.setFooter(`Command ran by: ${msg.author.tag}`, msg.author.displayAvatarURL({dynamic: true}))
			.setTimestamp()
		);
	}
}