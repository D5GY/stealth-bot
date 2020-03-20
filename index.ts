import Client from './util/Client';
import config from './config';
import { Message } from 'discord.js';
const client = new Client(config, {
	disableMentions: 'everyone',
	presence: {
		activity: {
			name: 'phoenixlive.online',
			type: 'WATCHING'
		}
	}
});
client.login();

client.on('ready', ()=>{
	console.log(`${client.user!.tag} is online`);
});

client.on('message', async msg => {
	// ! is non-null asseration, you may need to use this if it says x doesn't exist on y
	// only use it if it should be there tho k
	// in this case, a full message is always emitted so no partial
	if (msg.author!.bot || !msg.content!.startsWith(config.prefix)) return;

	const invites = msg.content!.match(/discord(?:app\.com\/invite|\.gg(?:\/invite)?)\/([\w-]{2,255})/gi);

	if (invites && invites.length) {
		if (msg.member!.hasPermission('MANAGE_MESSAGES')) return;
		await msg.delete();
		await msg.reply('No sending invites within this guild.');
		const channel = client.config.channels.get('logs')!;
		channel.send({
			embed: {
				color: 0xff0000,
				author: {
					name: 'Phoenix Live Auto-Moderation',
					iconURL: msg.guild!.iconURL({ dynamic: true })
				},
				fields: [{
					name: 'Author',
					value: msg.author!.tag,
					inline: true
				}, {
					name: 'Author ID',
					value: msg.author!.id,
					inline: true
				}, {
					name: 'Channel',
					value: msg.channel,
					inline: true
				}, {
					name: 'Message content',
					value: msg.content
				}],
				footer: { text: 'Auto-Moderation date: ' },
				timestamp: new Date()
			}
		});
	}

	const [_commandName, ...args] = msg.content!.split(' ');

	if (!_commandName) return;

	const commandName = _commandName.toLowerCase().slice(1);

	const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases.includes(commandName));

	if (!command) return;

	if (command.dmAllowed && msg.channel.type !== 'dm') return;

	let hasPermissions;
	if (command.dmAllowed && command.permissions && typeof command.permissions !== 'function') {
		console.warn('DM Only commands should have no permissions, or use a function');
		return;
	}

	if (typeof command.permissions === 'function') {
		// @ts-ignore cba to deal with that but it should work properly
		hasPermissions = await command.permissions(command.dmAllowed ? msg.author! : msg.member!, msg.channel);
	} else hasPermissions = msg.member!.hasPermission(command.permissions);

	if (!hasPermissions) return msg.channel.send('You\'re not authorized to use this command');
	await command.run({
		msg: msg as unknown as Omit<Message, 'client'> & { client: Client },
		args: args.join(' ').toLowerCase().split(' '),
		regularArgs: args
	});
});