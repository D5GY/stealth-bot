import { Message as DJSMessage, Collection, Snowflake, User, GuildMember, SnowflakeUtil } from 'discord.js';
import Client from './Client';

type Message = Omit<DJSMessage, 'client'> & { client: Client }
const FLAGS_REGEX = /--([a-z]+)=("[^"]*"|[0-9a-z]*)/gi;

const SPAM_BUFFER = new Map<Snowflake, Snowflake[]>();

export default class Util {
	static extractFlags(string: string): {
		flags: FlagData;
		string: string;
	} {
		const flags = [...string.matchAll(FLAGS_REGEX)]
			.map(arr => arr.slice(1));
		const flagsObj: { [key: string]: string } = {};
		for (const [name, value] of flags) {
			flagsObj[name] = value.startsWith('"') ? value.slice(1, value.length - 1) : value;
		}
		return {
			flags: flagsObj,
			string: string.replace(FLAGS_REGEX, '').replace(/\s\s+/g, ' ')
		};
	}

	static async reason(message: Message, options?: { fetchMembers?: false; withFlags?: false }): Promise<ReasonData>;
	static async reason(message: Message, options: { fetchMembers?: false; withFlags: true }): Promise<ReasonData & { flags: FlagData }>;
	static async reason(message: Message, options: { fetchMembers: true; withFlags?: false }): Promise<ReasonData & { members: Collection<Snowflake, GuildMember> }>;
	static async reason(message: Message, options: { fetchMembers: true; withFlags: true }): Promise<ReasonData & { flags: FlagData; members: Collection<Snowflake, GuildMember> }>;
	static async reason(message: Message, { fetchMembers = false, withFlags = false } = {}) {
		const { client } = message;
		const users = new Collection<Snowflake, User>();
		const [, ...content] = message.content.split(' ');
		for (const word of [...content]) {
			const [id] = word.match(/\d{17,19}/) || [];
			if (!id) break;
			content.shift();
			let user: User;
			try {
				user = await client.users.fetch(id) as User;
			} catch {
				throw new Error(`An ID or user mention was provided, but the user couldn't be resolved, are you sure its valid? (${id})`);
			}
			users.set(user.id, user);
		}

		const data: {
			flags?: FlagData;
			members?: Collection<Snowflake, GuildMember>;
			reason: string;
			users: Collection<Snowflake, User>;
		} = { reason: content.join(' '), users };

		if (fetchMembers) {
			const members = data.members = new Collection<Snowflake, GuildMember>();
			for (const user of users.values()) {
				try {
					const member = await message.guild!.members.fetch(user) as GuildMember;
					members.set(member.id, member);
				} catch { } // eslint-disable-line no-empty
			}
		}

		if (withFlags) {
			const { flags, string: newReason } = Util.extractFlags(data.reason);
			data.reason = newReason;
			data.flags = flags;
		}

		return data;
	}

	static manageable(member: GuildMember, by: GuildMember) {
		if (member.id === member.guild.ownerID) return false;
		if (by.id === member.guild.ownerID) return true;
		const position = member.roles.highest.comparePositionTo(by.roles.highest);
		return position < 0;
	}

	static async spamCheck(msg: Message): Promise<void> {
		return Promise.resolve();
		/*
		const messages = SPAM_BUFFER.get(msg.author.id);
		console.log(messages);
		if (!messages) {
			SPAM_BUFFER.set(msg.author.id, [msg.id]);
		} else {
			const lastTimestamp = SnowflakeUtil.deconstruct(messages[messages.length - 1]).timestamp;
			if (!(lastTimestamp > Date.now() - 1500)) {
				return void SPAM_BUFFER.delete(msg.author.id);
			}
			messages.push(msg.id);
			if (messages.length === 3) {
				await msg.delete();
				await msg.reply('Stop spamming');
				return;
			} else if (messages.length === 7) {
				await msg.member!.roles.add('693235516216442953');
				SPAM_BUFFER.delete(msg.author.id);
				return new Promise((resolve, reject) => {
					setTimeout(() => {
						if (msg.member) {
							msg.member!.roles.remove('693235516216442953')
								.then(() => resolve())
								.catch(reject);
						}
						else resolve();
					}, 60_000 * 10);
				});
			}
		}*/
	}
}

/*
if(spamcheck[msg.author.id].lastTS > Date.now()-1500){
        spamcheck[msg.author.id].buffer++
        if(spamcheck[msg.author.id].buffer == 3) msg.reply('Stop spamming').then(msg=>msg.delete(1250));
        if(spamcheck[msg.author.id].buffer == 7){
            bot.commands.get('mute').run({
                guild: msg.guild,
                content: `$mute <@${msg.author.id}> 10m Spamming`,
                channel: msg.channel,
                author: bot.user,
                member: msg.guild.me,
                reply(text){msg.channel.send(text)}
            },
            [`<@${msg.author.id}>`, '10m', 'spamming'],
            {
                Member: [msg.member]
            })
        }
    }else spamcheck[msg.author.id].buffer = 0;
    spamcheck[msg.author.id].lastTS = msg.createdTimestamp;
    spamcheck[msg.author.id].lastContent = msg.content;
}

*/

export interface ReasonData {
	reason: string;
	users: Collection<Snowflake, User>;
}

export interface FlagData {
	[key: string]: string | undefined;
}