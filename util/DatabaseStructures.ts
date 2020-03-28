export interface RawConsoleData {
	id: number;
	name: string;
	email: string;
	cpukey: string;
	HEX: string;
	salt: string;
	expire: Date;
	enabled: number;
	ip: string;
	banned: number;
	kvhash: string;
	kvtime: Date;
	lastonline: Date;
	kvbanned: number;
	verify: string;
	gamertag: string;
	discord: string;
}