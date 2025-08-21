import fs from 'node:fs';
import path from 'node:path';
import { meta, type MetaSchematic } from './schema';

interface Options {
	path: string;
	metas: Array<string>;
}

export class Meta {
	private readonly path: string | undefined = undefined;

	public readonly meta: MetaSchematic | undefined = undefined;

	constructor(options: Options) {
		const base = options.path.replace(new RegExp(path.extname(options.path) + '$'), '');

		for (const [_idx, ext] of options.metas.entries()) {
			const fp = `${base}.${ext}`;
			if (fs.existsSync(fp)) this.path = fp;
		}

		if (this.path) this.meta = meta.parse(JSON.parse(fs.readFileSync(this.path, { encoding: 'utf8' })));
	}

	public exists(): boolean {
		if (!this.meta) return false;
		return true;
	}

	public has(key: keyof MetaSchematic): boolean | undefined {
		if (!this.meta) return undefined;
		if (!this.meta[key]) return false;
		return true;
	}

	public get<T>(key: keyof MetaSchematic): T | undefined {
		if (!this.meta) return undefined;
		if (!this.meta[key]) return undefined;
		return this.meta[key] as T;
	}
}
