import { cosmiconfigSync } from 'cosmiconfig';
import path from 'node:path';

export const isTypescript = (startDir: string) =>
	cosmiconfigSync('tsconfig', {
		searchPlaces: ['tsconfig.json', 'tsconfig.base.json', 'tsconfig.app.json', 'tsconfig.*.json'],
		stopDir: path.parse(startDir).root,
	}).search(startDir);
