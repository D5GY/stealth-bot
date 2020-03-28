import { User, MessageReaction } from 'discord.js';
import Client from '../util/Client';

export default async (reaction: Omit<MessageReaction, 'client'> & { client: Client }, user: User) => {
	if (reaction.message.id !== '693229892799561810' || reaction.emoji.id !== '683710364352774175') return;

	const member = await reaction.message.guild!.members.fetch(user);
	await member.roles.add('693224688905879572');
};