/// <reference types="react" />

declare module 'virtual:vite-plugin-router' {
	interface VitePagesPluginProps {
		/**
		 * If we should use a different loading component instead of a <div>Loading...</div>
		 *
		 * @default undefined
		 */
		loadingPage?: React.ReactNode;
	}

	export const AppRoutes: React.FC<VitePagesPluginProps>;
}

declare module 'virtual:vite-plugin-router.jsx' {
	interface VitePagesPluginProps {
		/**
		 * If we should use a different loading component instead of a <div>Loading...</div>
		 *
		 * @default undefined
		 */
		loadingPage?: React.ReactNode;
	}

	export const AppRoutes: React.FC<VitePagesPluginProps>;
}

declare module 'virtual:vite-plugin-router.tsx' {
	interface VitePagesPluginProps {
		/**
		 * If we should use a different loading component instead of a <div>Loading...</div>
		 *
		 * @default undefined
		 */
		loadingPage?: React.ReactNode;
	}

	export const AppRoutes: React.FC<VitePagesPluginProps>;
}
