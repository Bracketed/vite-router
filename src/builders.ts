import { Options } from './types/Exports';

export class Builders {
	public readonly file = async (
		router: string,
		routes: string[],
		redirects: string[],
		imports: string[],
		layoutImports: string[],
		useLazy: boolean,
		options: Options
	): Promise<string> => {
		return `
// @ts-nocheck
// eslint-disable 
// prettier-ignore

// Generated by Vite Router
// https://www.npmjs.com/package/@bracketed/vite-plugin-router
// https://github.com/bracketed/vite-router

import type { Props } from '@bracketed/vite-plugin-router/types';
import { ${useLazy ? 'lazy, Suspense' : 'Suspense'} } from 'react';
import { ${router}, Route, Routes } from 'react-router-dom';
${redirects.length !== 0 ? "import { Redirect } from '@bracketed/vite-plugin-router';" : ''}

${imports.join('\n').trim()}
${layoutImports.join('\n').trim()}

/**
 * Generated by Vite Router
 *
 * @link https://www.npmjs.com/package/@bracketed/vite-plugin-router
 * @link https://github.com/bracketed/vite-router
 */
export function AppRoutes(props: Props) {
  return (
    <${router}>
	${options.suspense ? '<Suspense fallback={props.loadingPage || <div>Loading...</div>}>' : ''}
        <Routes>
          ${routes.join('\n').trim()}
		  ${redirects.join('\n').trim()}
		  ${options[404] ? '<Route path="*" element={props.notFoundPage || <div>404</div>} />' : ''}
        </Routes>
      ${options.suspense ? '</Suspense>' : ''} 
    </${router}>
  );
}

`.trim()
	};

	private readonly format = (value: unknown) => {
		if (typeof value === 'string') {
			if (value.startsWith('"')) return value;
			if (value.startsWith('<')) return value;

			return `"${value}"`;
		}

		return value;
	};

	public readonly component = (
		name: string,
		properties: Record<string, string | boolean | number | undefined> = {},
		...child: string[]
	): string => {
		const props = Object.entries(properties)
			.filter(([, value]) => value !== undefined)
			.filter(([key]) => !key.startsWith('$'))
			.map(([key, value]) => `${key}={${this.format(value)}}`)
			.join(' ');

		return `

<${name}${props ? ` ${props}` : ''}>${child.join('\n')}</${name}>

`.trim();
	};

	public readonly lazyImport = (name: string, path: string): string =>
		`

const ${name} = lazy(() => import('${path}'));

`.trim();

	public readonly defaultImport = (name: string, path: string): string =>
		`

import ${name} from '${path}';

`.trim();
}
