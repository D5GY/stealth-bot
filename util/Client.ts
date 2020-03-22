import { Client as DJSClient, ClientOptions, WebhookClient, Snowflake, TextChannel, Collection } from 'discord.js';
import { Config } from '../config';
import DatabaseManager from './DatabaseManager';
import Command from '../Command';
import { promises as fs } from 'fs';

export default class Client extends DJSClient {
	private _channels: Config['channels']

	public commands = new Collection<string, Command>()
	public config: {
		channels: Map<string, TextChannel>;
		webhooks: Map<string, WebhookClient>;
		staffRoleIDs: Snowflake[];
		prefix: string;
		devIDs: Snowflake[];
	};
	public database: DatabaseManager;
	public token: string;

	constructor(config: Config, options: ClientOptions) {
		super(options);

		this._channels = config.channels;

		this.token = config.token;

		this.config = {
			channels: new Map(), // we'll sort out this later
			webhooks: new Map(),
			staffRoleIDs: config.roles.staff,
			prefix: config.prefix,
			devIDs: config.devs
		};

		this.database = new DatabaseManager(this, config.database);

		for (const data of config.webhooks) {
			this.config.webhooks.set(data.name, new WebhookClient(data.id, data.token, options));
		}
	}

	async login(token = this.token) {
		await this.database.connect();
		const commandsDir = `${__dirname}/../commands`;
		const folders = await fs.readdir(commandsDir);
		for (const folder of folders) {
			if (folder.includes('.')) continue;
			const files = await fs.readdir(`${commandsDir}/${folder}`);
			for (const file of files) {
				const command = new (require(`${commandsDir}/${folder}/${file}`)).default(this);
				if (command.enabled) this.commands.set(command.name, command);
			}
		}

		const eventsDir = `${__dirname}/../events`;

		const events = await fs.readdir(eventsDir);

		for (const event of events) {
			if (!event.endsWith('.js')) continue;
			// @ts-ignore not much we can do to fix that iirc
			this.on(event.split('.')[0], require(`${eventsDir}/${event}`).default); // eslint-disable-line
			delete require.cache[require.resolve(`${eventsDir}/${event}`)];
		}

		return new Promise<string>((resolve, reject) => {
			const handler = () => {
				try {
					for (const data of this._channels) {
						this.config.channels.set(data.name, this.channels.cache.get(data.id) as TextChannel);
					}
					resolve(token);
				} catch (error) {
					reject(error);
				}
			};
			this.once('ready', handler);
			super.login(token)
				.catch(error => {
					this.off('ready', handler);
					return reject(error);
				});
		});
	}
}