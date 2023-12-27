let app = {
	name: 'Rumsan App',
	settings: null,
};

module.exports = {
	setSettings: (data: any) => {
		app.settings = data;
	},
	listSettings: () => app.settings,
	getSetting: (name: string) => {
		if (!name) return null;
		name = name.toUpperCase().replace(' ', '-');
		const { settings } = app;
		if (!settings) return null;
		const found = settings.find((f: any) => f.name === name);
		if (!found) return null;
		return found.value.data;
	},
};
