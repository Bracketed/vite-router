import { bold, gray, greenBright, isColorSupported, redBright } from 'colorette';
import { Console } from 'node:console';
import { inspect } from 'node:util';

class Logger {
	protected console = new Console(process.stdout);

	protected preprocess(values: readonly unknown[]) {
		return values
			.map((value) => (typeof value === 'string' ? value : inspect(value, { colors: isColorSupported })))
			.join(' ');
	}

	info(...values: readonly unknown[]) {
		console.info(gray(new Date().toLocaleTimeString()), bold(greenBright('[router]')), this.preprocess(values));
	}

	error(...values: readonly unknown[]) {
		console.info(gray(new Date().toLocaleTimeString()), bold(redBright('[router]')), this.preprocess(values));
	}
}

export { Logger };
