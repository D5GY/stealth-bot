import Command, { CommandExecutionData } from '../../Command';
import Client from '../../util/Client';
import { MessageEmbed } from 'discord.js';
import Util from '../../util/Util';

export default class KickCommand extends Command {
	constructor(client: Client) {
		super(client, {
			aliases: ['👢'],
			description: 'Kicks a member.',
			name: 'kick',
			usage: '[user | users] [...reason]',
			cooldown: 5,
			// dmAllowed: true,
			enabled: true,
			permissions: 'KICK_MEMBERS'
		});
	}

	async run({ msg }: CommandExecutionData) {
		try {
			await msg.delete();
			const { members, reason, users } = await Util.reason(msg, { fetchMembers: true });

			if (!users.size) return msg.channel.send('Please mention a valid user or users to kick.');
			if (!reason) return msg.channel.send('Please provide a reason!');

			if (users.size !== members.size) return msg.channel.send('Some of the users you mentioned have already left or been kicked.');

			const notManageable = members.some(member => !Util.manageable(member, msg.member!));
			if (notManageable) return msg.channel.send(`${members.size > 1 ? 'One of those members' : 'That member'} isn't managable by you`);

			for (const member of members.values()) {
				try {
					await member.kick(`${msg.author.tag}: ${reason}`);
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
						name: `User${users.size > 1 ? 's' : ''} Kicked`,
						value: users.map(user => `${user.tag} : ${user.id}`)
					}, {
						name: 'Reason',
						value: reason
					})
				);
			}

			return msg.channel.send(`Kicked ${users.size > 1 ? `${users.size} users` : users.first()!.tag}.`);
		} catch (error) {
			if (error.name === 'Error') return msg.channel.send(error.message);
			throw error;
		}
	}
}