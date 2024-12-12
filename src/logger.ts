import { bold, gray, greenBright, isColorSupported, redBright } from 'colorette';
import { Console } from 'node:console';
import { inspect, type InspectOptions } from 'node:util';

class Logger {
	protected preprocess(values: readonly unknown[]) {
		const inspectOptions: InspectOptions = { colors: isColorSupported, depth: 0 };
		return values
			.map((value) => (typeof value === 'string' ? value : inspect(value, inspectOptions)))
			.join(' ');
	}

	info(...values: readonly unknown[]) {
		const Time = new Date().toLocaleTimeString();

		new Console(process.stdout).info(gray(Time), bold(greenBright('[router]')), this.preprocess(values));
	}

	error(...values: readonly unknown[]) {
		const Time = new Date().toLocaleTimeString();

		new Console(process.stdout).info(gray(Time), bold(redBright('[router]')), this.preprocess(values));
	}
}

const ConsoleLogger = new Logger();

export { ConsoleLogger as Logger };
