import Client from './util/Client';
import config from './config';
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
client.once('ready', () => {
	console.log(`${client.user!.tag} is online`);
});