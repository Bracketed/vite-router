export const isTypescript = (startDir: string) =>
	require('cosmiconfig')
		.cosmiconfigSync('tsconfig', {
			searchPlaces: ['tsconfig.json', 'tsconfig.base.json', 'tsconfig.app.json', 'tsconfig.*.json'],
			stopDir: require('node:path').parse(startDir).root,
		})
		.search(startDir);
