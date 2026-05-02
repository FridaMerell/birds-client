export interface User {
	"id"?: string;
	email?: string;
	roles?: any;
	username?: string;
	password?: string;
	Sightings?: string[];
	isVerified?: boolean;
	Cards?: any;
	accessTokens?: any;
	sightings?: string[];
	cards?: any;
	readonly userIdentifier?: string;
	readonly verified?: boolean;
}
