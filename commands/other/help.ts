import Command, { CommandExecutionData } from '../../Command';
import Client from '../../util/Client';
import { MessageEmbed } from 'discord.js';

export default class HelpCommand extends Command {
	constructor(client: Client) {
		super(client, {
			aliases: ['h'],
			description: 'Display list of commands',
			name: 'help',
			usage: 'help (command name)',
			cooldown: 5,
			dmAllowed: true,
			enabled: true,
			permissions: 0
		});
	}

	async run({ msg }: CommandExecutionData) {
	/*	if (args[0]) {
			const command = this.client.commands.get(args[0]);
			if(!command) return msg.channel.send('I could not find that command');
			return msg.channel.send(new MessageEmbed()
				.setColor(0x214896)
				.setAuthor('phoenixlive.online', this.client.guilds.cache.first()!.iconURL({dynamic: true}) as string)
				.setURL('https://phoenixlive.online')
				.setDescription(`Phoenix Live Help - ${command.name}\nDescription: ${command.description}\nAliases: ${command.aliases}\nUsage: ${command.usage}\nPermissions: ${typeof command.permissions == 'function' ? 'ID or Role Locked' : command.permissions || 'No Permissions'}\nCooldown: ${command.cooldown}`)
				.setFooter(`Command ran by: ${msg.author.tag}`, msg.author.displayAvatarURL({dynamic: true}))
				.setTimestamp()
			);
		}
		const string = [];
		this.client.commands.forEach(cmd => {if (msg.member!.hasPermission(cmd.permissions)) string.push(`>${cmd.name} - ${cmd.description}`);});
		return msg.channel.send(new MessageEmbed()
			.setColor(0x214896)
			.setAuthor('phoenixlive.online', this.client.guilds.cache.first()!.iconURL({dynamic: true}) as string)
			.setURL('https://phoenixlive.online')
			.setDescription(string.join('\n'))
			.setFooter(`Command ran by: ${msg.author.tag}`, msg.author.displayAvatarURL({dynamic: true}))
			.setTimestamp()
		);
		*/

		return msg.channel.send(new MessageEmbed()
			.setColor(0x214896)
			.setAuthor('phoenixlive.online', this.client.guilds.cache.first()!.iconURL({dynamic:true}) as string)
			.setURL('https://phoenixlive.online')
			.setDescription('Phoenix Live Help\n\n>link - Link your CPUKey\n>info - Display your console info')
			.setFooter(`Command ran by: ${msg.author.tag}`, msg.author.displayAvatarURL({dynamic:true}))
			.setTimestamp()
		);
	}
}