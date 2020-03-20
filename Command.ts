import Client from './util/Client';
import { PermissionResolvable, User, TextChannel, DMChannel, GuildMember, Message } from 'discord.js';

export default class Command {
	private client!: Client;

	public aliases: string[];
	public cooldown: number;
	public enabled: boolean;
	public name: string;
	public description: string;
	public usage: string;
	public permissions: PermissionResolvable | PermissionsFunction;
	public dmAllowed: boolean;

	constructor(client: Client, config: CommandConfig) {
		Object.defineProperty(this, 'client', { value: client });

		this.aliases = config.aliases;
		this.cooldown = config.cooldown ? config.cooldown * 1000 : 0;
		this.enabled = config.enabled || false;
		this.name = config.name;
		this.description = config.description;
		this.usage = config.usage;
		this.permissions = config.permissions || 0;
		this.dmAllowed = config.dmAllowed || false;
	}

	run(data: CommandExecutionData) {
		return data.msg.channel.send('hi');
	}
}

export interface CommandExecutionData {
	msg: Omit<Message, 'client'> & { client: Client };
	args: string[];
	regularArgs: string[];
}

export interface CommandConfig {
	aliases: string[];
	cooldown?: number;
	dmAllowed?: true;
	enabled?: true;
	name: string;
	description: string;
	usage: string;
	permissions: PermissionResolvable | PermissionsFunction;
}

type PermissionsFunction = ((member: Omit<GuildMember, 'client'> & { client: Client }, channel: TextChannel) => boolean | Promise<boolean>) | ((user: Omit<User, 'client'> & { client: Client }, channel: DMChannel) => boolean | Promise<boolean>)