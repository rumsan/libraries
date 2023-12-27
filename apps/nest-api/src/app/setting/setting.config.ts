let app = {
	name: 'Rumsan App',
	settings: { data: null },
};

module.exports = {
	setSettings: (data: any) => {
		app.settings = data;
	},
	listSettings: () => app.settings,
	getSetting: (name: string) => {
		const { data } = app.settings;
		return data;
	},
};
