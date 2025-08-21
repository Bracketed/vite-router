/// <reference types="react" />

import type { VitePagesPluginProps } from './types/Props.types';

declare module 'virtual:vite-plugin-router' {
	export const AppRoutes: React.FC<VitePagesPluginProps>;
}
