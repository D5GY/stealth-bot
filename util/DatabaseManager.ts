import Client from './Client';
import * as mysql from 'mysql';

export default class DatabaseManager {
	public connected: boolean;
	public connection: mysql.Connection
	public options: mysql.ConnectionConfig;
	constructor(client: Client, options: mysql.ConnectionConfig) {
		this.options = options;
		this.connection = mysql.createConnection(options);

		this.connected = false;
	}

	connect() {
		if (this.connected) return Promise.reject(new Error('Database is already connected.'));
		return new Promise<mysql.Connection>((resolve, reject) => {
			this.connection.connect(error => {
				if (error) return reject(error);
				this.connected = true;
				resolve(this.connection);
			});
		});
	}


	query(sql: string, ...args: unknown[]) {
		if (!this.connected) return Promise.reject(new Error('Database is not connected.'));
		return new Promise<{ [key: string]: string | number }[]>((resolve, reject) => {
			try {
				this.connection.query(sql, args, (error, results) => {
					if (error) return reject(error);
					resolve(results);
				});
			} catch (error) { reject(error); }
		});
	}
}