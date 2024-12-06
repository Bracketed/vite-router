import fs from 'node:fs';
import promised from 'node:fs/promises';
import path from 'node:path';
import { Options } from '../types/Exports';

export async function readMeta(
	Opt: Options,
	FileName: string
): Promise<Record<string, string | number | boolean | undefined> | undefined> {
	const { ext } = path.parse(FileName);
	const MetaFileNames = Opt.meta;

	for (const Type in MetaFileNames) {
		const MetaFileName = `${FileName.slice(undefined, -ext.length)}${Type}`;

		if (!fs.statSync(MetaFileName)) continue;

		const RawMeta = await promised.readFile(MetaFileName, { encoding: 'utf-8' });
		const Meta = JSON.parse(RawMeta);

		return Meta;
	}

	return undefined;
}
