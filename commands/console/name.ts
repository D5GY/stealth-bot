import Command, { CommandExecutionData } from '../../Command';
import Client from '../../util/Client';

export default class NameCommand extends Command {
	constructor(client: Client) {
		super(client, {
			aliases: ['n'],
			description: 'Chnage your consoles display name',
			name: 'name',
			usage: '<...name>',
			cooldown: 5,
			dmAllowed: true,
			enabled: true,
			permissions: 0,
			channels: ['693225634675032155', '693225595680587887']
		});
	}

	async run({ msg, regularArgs }: CommandExecutionData) {
		const [data] = await this.client.database.query(
			'SELECT name FROM guestmode WHERE discord = ?',
			msg.author.id
		);

		if (!data) return msg.channel.send('You must have a linked CPUKey before using this command.');
		const name = regularArgs.join(' ');

		if (!name) return msg.channel.send(`Your current console name is ${data.name}.`);

		if (name.length > 18) return msg.channel.send('Your console name must be under 18 characters.');

		const [existing] = await this.client.database.query(
			'SELECT * FROM guestmode WHERE name = ?',
			name
		);
		if (existing) return msg.channel.send('That username is already in use.');

		await this.client.database.query(
			'UPDATE guestmode SET name = ? WHERE discord = ?',
			name, msg.author.id
		);

		return msg.channel.send('Your console name has been updated.');
	}
}