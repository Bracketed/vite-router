import fs from 'node:fs';
import path from 'node:path';
import { Options } from '../types/Exports';

export async function readMeta(
	Opt: Options,
	FileName: string
): Promise<Record<string, string | number | boolean | undefined> | undefined> {
	const { ext } = path.parse(FileName);
	const MetaFileNames = Opt.meta;

	for (const TypeNum in MetaFileNames) {
		const MetaFileName = `${FileName.slice(undefined, -ext.length)}${MetaFileNames[TypeNum]}`;

		if (!fs.existsSync(MetaFileName)) continue;

		const RawMeta = fs.readFileSync(MetaFileName, { encoding: 'utf-8' });
		const Meta = JSON.parse(RawMeta);

		return Meta;
	}

	return undefined;
}
