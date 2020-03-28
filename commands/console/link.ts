import Command, { CommandExecutionData } from '../../Command';
import Client from '../../util/Client';

export default class LinkCommand extends Command {
	constructor(client: Client) {
		super(client, {
			aliases: ['l'],
			description: 'Link your discord account to your console CPUKey',
			name: 'link',
			usage: '[CPUKey]',
			cooldown: 5,
			dmAllowed: true,
			enabled: true,
			permissions: 0,
			channels: ['693225634675032155', '693225595680587887']
		});
	}

	async run({ msg, args }: CommandExecutionData) {
		await msg.delete();
		const [existing] = await this.client.database.query(
			'SELECT * FROM guestmode WHERE discord = ?',
			msg.author.id
		);

		if (existing) return msg.channel.send('You\'re already linked!');
		const cpu = (args[0] || '').toUpperCase();
		if (cpu.length !== 32) {
			return msg.channel.send(
				'Please check your CPUKey.'
			);
		}

		const [data] = await this.client.database.query(
			'SELECT discord FROM guestmode WHERE CPUKey = ?',
			cpu
		);

		if (!data) return msg.channel.send('You must have been on phoenix live to link your discord.');
		if (data.discord !== '0') {
			try {
				const user = await this.client.users.fetch(data.discord as string);
				console.log(`${msg.author.tag} (${msg.author.id}) Tried to link to ${cpu}, which doesn't belong to them, it belongs to ${user.tag} (${user.id})`);
			} catch (error) {
				if (error.message !== 'Cannot send messages to this user') {
					console.log(
						[
							`${msg.author.tag} (${msg.author.id}) Tried to link to ${cpu}, which doesn't belong to them`,
							`it belongs to ${data.discord}`
						].join('\n')
					);
				}
			}
			return msg.channel.send('That CPUKey has already been linked.');
		}

		await this.client.database.query(
			'UPDATE guestmode SET discord = ? WHERE CPUKey = ?',
			msg.author.id, cpu
		);

		const member = await this.client.guilds.cache.first()!.members.fetch(msg.author);

		await member.roles.add('693224907273666630');

		return msg.channel.send('You\'re now linked!');
	}
}