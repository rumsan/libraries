let app = {
	name: 'Rumsan App',
	settings: { data: null },
};

module.exports = {
	setSettings: (data: any) => {
		app.settings = data;
	},
	getSettings: () => app.settings,
};
