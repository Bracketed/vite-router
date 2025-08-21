import type { ReactNode } from 'react';

export interface Props {
	/**
	 * If we should use a different loading component instead of a <div>Loading...</div>
	 *
	 * @default undefined
	 */
	loadingPage?: ReactNode;
}
