import type { VitePagesPluginOptions } from './types';
import { isTypescript } from './utilities/isTypescript';

export class Builders {
	public readonly file = (
		routes: string[],
		redirects: string[],
		imports: string[],
		options: VitePagesPluginOptions
	): string => {
		const isTs = isTypescript(options.root);

		return `
// @ts-nocheck

${isTs ? "import type { VitePagesPluginProps } from '@bracketed/vite-plugin-router/types';" : ''}
${options.suspense ? `import React, { lazy, Suspense } from 'react';` : "import React, { lazy } from 'react';"}
import { BrowserRouter, Route, Routes } from 'react-router-dom';
${redirects.length > 0 ? "import { Redirect } from '@bracketed/vite-plugin-router';" : ''}

${imports.length ? imports.join('\n') : ''}

export function AppRoutes(props${isTs ? ': VitePagesPluginProps' : ''}) {
  return (
    <BrowserRouter>
      ${options.suspense === false ? '' : '<Suspense fallback={props.loadingPage || <div>Loading...</div>}>'}
        <Routes>
${routes.map((r) => '          ' + r).join('\n')}
${redirects.map((r) => '          ' + r).join('\n')}
        </Routes>
      ${options.suspense === false ? '' : '</Suspense>'} 
    </BrowserRouter>
  );
}
`;
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
		properties: Record<string, string | boolean | number | undefined> = {}
	): string => {
		const props = Object.entries(properties)
			.filter(([, value]) => value !== undefined)
			.map(([key, value]) => `${key}={${this.format(value)}}`)
			.join(' ');

		return `<${name}${props ? ` ${props}` : ''} />`;
	};
}
