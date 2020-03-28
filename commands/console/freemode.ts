import Command, { CommandExecutionData } from '../../Command';
import Client from '../../util/Client';

export default class FreemodeCommand extends Command {
	constructor(client: Client) {
		super(client, {
			aliases: ['fm', 'f'],
			description: 'Check feemode.',
			name: 'freemode',
			usage: '',
			cooldown: 5,
			dmAllowed: true,
			enabled: true,
			permissions: 0,
			channels: ['693225634675032155', '693225595680587887']
		});
	}

	async run({ msg }: CommandExecutionData) {
		const [{ freemode }] = await this.client.database.query('SELECT freemode FROM settings');
		return msg.channel.send(`Phoenix Live is currently in ${freemode ? 'freemode' : 'paid mode'}.`);
	}
}