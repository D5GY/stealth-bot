import Command, { CommandExecutionData } from '../../Command';
import Client from '../../util/Client';

export default class BaseCommand extends Command {
	constructor(client: Client) {
		super(client, {
			aliases: [],
			description: 'This is a test command',
			name: 'base',
			usage: 'base [...args]',
			cooldown: 5, // 5 seconds
			dmAllowed: true,
			enabled: true,
			permissions: 0
			// permissions: (user) => user.isCool()
		});
	}

	run({ msg, regularArgs, args }: CommandExecutionData) {
		console.log(args, regularArgs);
		if (!args.length) return msg.channel.send('No args provided');
		return msg.channel.send(`Your first argument is ${args[0]}, normalized ${regularArgs[0]}`);
	}
}