import log4js from 'log4js';
import { TerminalOutputLog, LogDaysToKeep } from './config.default';

log4js.configure({
	appenders: {
		console: { type: 'console' },
		response: {
			type: 'file',
			filename: 'logs/response.log',
			daysToKeep: LogDaysToKeep,
			compress: true,
			layout: {
				type: 'pattern',
				pattern: '[%d] [%p] [%x{pid}] %m',
				tokens: {
					pid: () => process.pid,
				},
			},
			level: 'info',
		},
		error: {
			type: 'file',
			filename: 'logs/error.log',
			daysToKeep: LogDaysToKeep,
			compress: true,
			layout: {
				type: 'pattern',
				pattern: '[%d] [%p] [%x{pid}] %m',
				tokens: {
					pid: () => process.pid,
				},
			},
		},
	},
	categories: {
		response: {
			appenders: TerminalOutputLog ? ['console', 'response'] : ['response'],
			level: 'info',
		},
		error: {
			appenders: TerminalOutputLog ? ['console', 'error'] : ['error'],
			level: 'error',
		},
		default: { appenders: ['console'], level: 'all' },
	},
});
/**
 * 日志记录
 * @param level 日志级别 info all error
 * @param message 日志消息
 */
type LevelType = 'error' | 'response' | 'all';

const logMessage = (level: LevelType, message: any) => {
	const LogLevel = {
		error: () => log4js.getLogger(level).error(message),
		response: () => log4js.getLogger(level).info(message),
		all: () => log4js.getLogger(level).trace(message),
	};
	return LogLevel[level]();
};

export default logMessage;
