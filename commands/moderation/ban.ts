import Command, { CommandExecutionData } from '../../Command';
import Client from '../../util/Client';
import { MessageEmbed, BanOptions } from 'discord.js';
import Util from '../../util/Util';

export default class BanCommand extends Command {
	constructor(client: Client) {
		super(client, {
			aliases: ['🔨', '🍌'],
			description: 'Bans a member.',
			name: 'ban',
			usage: '[user | users] [...reason]',
			cooldown: 5,
			// dmAllowed: true,
			enabled: true,
			permissions: 'BAN_MEMBERS'
		});
	}

	async run({ msg }: CommandExecutionData) {
		try {
			await msg.delete();
			const { flags, members, reason, users } = await Util.reason(msg, { fetchMembers: true, withFlags: true });

			if (!users.size) return msg.channel.send('Please mention a valid user or users to ban.');
			if (!reason) return msg.channel.send('Please provide a reason!');

			const notManageable = members.some(member => !Util.manageable(member, msg.member!));
			if (notManageable) return msg.channel.send(`${members.size > 1 ? 'One of those members' : 'That member'} isn't managable by you`);

			const banOptions = {} as BanOptions;

			if (flags.days) {
				const days = parseInt(flags.days);
				if (isNaN(days) || days < 1 || days > 7 ) {
					return msg.channel.send('Flag \'days\' should be an integer bigger than 0 and lower than 8');
				}
				banOptions.days = days;
			}

			const flagKeys = Object.keys(flags);
			if (flagKeys.some(key => key !== 'days')) {
				return msg.channel.send(`Flag '${flagKeys.find(key => key !== 'days')} is invalid, valid flags are \`days\``);
			}

			banOptions.reason = `${msg.author.tag}: ${reason}`;

			for (const user of users.values()) {
				try {
					await msg.guild!.members.ban(user, banOptions);
				} catch { } // eslint-disable-line no-empty
			}

			const logChannel = this.client.config.channels.get('punishment-logs');
			if (logChannel) {
				await logChannel.send(new MessageEmbed()
					.setColor(0xff0000)
					.setAuthor('Phoenix Moderation Command', this.client.guilds.cache.first()!.iconURL({ dynamic: true }) as string)
					.addFields({
						name: 'Moderator',
						value: `${msg.author.tag} : ${msg.author.id}`
					}, {
						name: `User${users.size > 1 ? 's' : ''} Banned`,
						value: users.map(user => `${user.tag} : ${user.id}`)
					}, {
						name: 'Reason',
						value: reason
					})
				);
			}

			return msg.channel.send(`Banned ${users.size > 1 ? `${users.size} users` : users.first()!.tag}.`);
		} catch (error) {
			if (error.name === 'Error') return msg.channel.send(error.message);
			throw error;
		}
	}
}