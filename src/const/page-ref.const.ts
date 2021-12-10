export interface PageRefModel {
	name: string;
	link: string;
}

export class PageRefConst {
	static readonly EMPTY: PageRefModel = {
		name: '',
		link: '/'
	};

	static readonly LOGIN: PageRefModel = {
		name: 'login',
		link: '/login'
	};

	static readonly GRAPHIC_KEY_AUTH: PageRefModel = {
		name: 'auth/graphic-key-auth',
		link: '/auth/graphic-key-auth'
	};
}
