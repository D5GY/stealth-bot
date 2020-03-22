import { Message, MessageEmbed } from 'discord.js';
import Client from '../util/Client';

// use the same format used here,
/*
export default async (parameter: Omit<ParameterClass, 'client'> & { client: Client })) => {
	const { client } = parameter;
	...
};
make sure the `Client` import is the one from '../util/Client';
// remove this comment as well once youve read it
*/
export default async (msg: Omit<Message, 'client'> & { client: Client }) => {

	const { client } = msg;
	if (msg.author.bot || !msg.content.startsWith(client.config.prefix)) return;

	const invites = msg.content!.match(/discord(?:app\.com\/invite|\.gg(?:\/invite)?)\/([\w-]{2,255})/gi);

	if (msg.guild && invites && invites.length) {
		if (msg.member!.hasPermission('MANAGE_MESSAGES')) return;
		await msg.delete();
		await msg.reply('No sending invites within this guild.');
		const channel = client.config.channels.get('logs')!;
		return channel.send(new MessageEmbed()
			.setAuthor('Phoenix Live Auto-Moderation [Message Deletion]', msg.guild.iconURL({ dynamic: true })!)
			.setColor(0xff0000)
			.setFooter('Action taken at')
			.setTimestamp()
			.addFields({
				name: 'Author',
				value: msg.author.tag,
				inline: true
			}, {
				name: 'Author ID',
				value: msg.author.id,
				inline: true
			}, {
				name: 'Channel',
				value: msg.channel,
				inline: true
			}, {
				name: 'Message content',
				value: msg.content
			})
		);
	}

	const [_commandName, ...args] = msg.content!.split(' ');

	if (!_commandName) return;

	const commandName = _commandName.toLowerCase().slice(1);

	const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases.includes(commandName));

	if (!command) return;

	if (!command.dmAllowed && msg.channel.type === 'dm') return;

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
		msg: msg,
		args: args.join(' ').toLowerCase().split(' ').slice(1), // remove first arg because its funky idk why
		regularArgs: args
	});
};