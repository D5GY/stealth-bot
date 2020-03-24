import Command, { CommandExecutionData } from '../../Command';
import Client from '../../util/Client';

export default class NameCommand extends Command {
	constructor(client: Client) {
		super(client, {
			aliases: [],
			description: 'Chnage your consoles display name',
			name: 'name',
			usage: 'name [NAME]',
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

		if (!data) return msg.channel.send('You must have a linked CPUKey before using this command');

		const name = msg.content.split(' ').slice(1).join(' ');

		if (!name) return msg.channel.send(`Your current console name is ${data.name}`);

		if (name.length > 18) return msg.channel.send('Your console name must be under 18 characters');

		const [existing] = await this.client.database.query(
			'SELECT * FROM guestmode WHERE name = ?',
			name
		);
		if (existing) return msg.channel.send('This username is already in use.');

		await this.client.database.query(
			'UPDATE guestmode SET name = ? WHERE discord = ?',
			name, msg.author.id
		);

		return msg.channel.send('Your console name has been updated');
	}
}