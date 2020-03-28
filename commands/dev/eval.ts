import { MessageOptions } from 'child_process';
import * as util from 'util';
import Client from '../../util/Client';
import Command, { CommandExecutionData } from '../../Command';
import fetch from 'node-fetch';

export default class EvalCommand extends Command {
	constructor(client: Client) {
		super(client, {
			aliases: ['ev', 'e'],
			description: 'Evaluates an expression.',
			dmAllowed: true,
			usage: '<code>',
			name: 'eval',
			permissions: (user) => user.client.config.devIDs.includes(user.id),
			enabled: true
		});
	}

	async run({ args, msg, regularArgs }: CommandExecutionData) {
		if (args[0] === '--reload') process.exit();
		// this will return anyway as the process is exited

		let result;

		try {
			const code = regularArgs.join(' ');
			result = await eval(code);
			if (Array.isArray(result) && result.every(element => element && typeof element.then === 'function')) {
				result = await Promise.all(result);
			}

			if (typeof result !== 'string') result = util.inspect(result);

			if (result.length > 1250) {
				const { key } = await fetch('https://hasteb.in/documents', {
					body: result,
					method: 'POST'
				}).then(result => result.json());
				result = `https://hasteb.in/${key}`;
			} else result = { code: 'js', content: result };

		} catch (error) {
			result = { code: 'js', content: error.stack };
		}

		// this is a place where the `as ...` isn't actually needed, just a nit
		return msg.channel.send(result as string | MessageOptions);
	}
}