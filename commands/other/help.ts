import Command, { CommandExecutionData } from '../../Command';
import Client from '../../util/Client';
import { MessageEmbed, Permissions, PermissionResolvable } from 'discord.js';

export default class HelpCommand extends Command {
	constructor(client: Client) {
		super(client, {
			aliases: ['h'],
			description: 'Display list of commands',
			name: 'help',
			usage: '<command name>',
			cooldown: 5,
			dmAllowed: true,
			enabled: true,
			permissions: 0,
			channels: ['693225634675032155', '693225595680587887']
		});
	}

	async run({ msg, args }: CommandExecutionData) {
		const commands = this.client.commands.filter(command => {
			if (msg.channel.type === 'dm') return !command.permissions;
			if (typeof command.permissions === 'function') return false;
			return msg.member!.hasPermission(command.permissions);
		});
		if (args[0]) {
			const command = commands.get(args[0]) || commands.find(cmd => cmd.aliases.includes(args[0]));
			if(!command) return msg.channel.send('That command couldn\'t be found');
			return msg.channel.send(new MessageEmbed()
				.setColor(0x214896)
				.setAuthor('phoenixlive.online', this.client.guilds.cache.first()!.iconURL({ dynamic: true }) as string)
				.setURL('https://phoenixlive.online')
				.setDescription([
					`Phoenix Live Help - ${command.name}`,
					`Description: ${command.description}`,
					`Aliases: ${command.aliases.length ? command.aliases.map(alias => `\`${alias}\``).join(', ') : 'No aliases'}`,
					`Usage: ${this.client.config.prefix}${command.name} ${command.usage}`,
					`Permissions: ${command.permissions ?
						new Permissions(command.permissions as PermissionResolvable).toArray()
							.map(permission => permission.toLowerCase().split('_')
								.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
							).join(', ') :
						'No permissions'
					}`,
					`Cooldown: ${command.cooldown} seconds`
				])
				.setFooter(`Command ran by: ${msg.author.tag}`, msg.author.displayAvatarURL({ dynamic: true }))
				.setTimestamp()
			);
		}

		return msg.channel.send(new MessageEmbed()
			.setColor(0x214896)
			.setAuthor('phoenixlive.online', this.client.guilds.cache.first()!.iconURL({ dynamic: true }) as string)
			.setURL('https://phoenixlive.online')
			.setDescription([
				'[] = Required <> = Optional',
				...commands.map(command => `${this.client.config.prefix}${command.name} ${command.usage} - ${command.description}`)
			])
			.setFooter(`Command ran by: ${msg.author.tag}`, msg.author.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
		);
		/*
		return msg.channel.send(new MessageEmbed()
			.setColor(0x214896)
			.setAuthor('phoenixlive.online', this.client.guilds.cache.first()!.iconURL({dynamic:true}) as string)
			.setURL('https://phoenixlive.online')
			.setDescription('Phoenix Live Help\n\n>link - Link your CPUKey\n>info - Display your console info\n>freemode - Check freemode status\n>name - Change your console display name')
			.setFooter(`Command ran by: ${msg.author.tag}`, msg.author.displayAvatarURL({dynamic:true}))
			.setTimestamp()
		);*/
	}
}