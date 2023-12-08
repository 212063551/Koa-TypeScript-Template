import dayjs from 'dayjs';
import chalk from 'chalk';
import logMessage from './log';
import { Context, Next } from 'koa';
import { TokenBucket, getIPAddress } from '../utils/utils';
import { MAX_QPS } from './config.default';

const creatTime = dayjs().format('YYYY/MM/DD HH:mm:ss');
const tokenBucket = new TokenBucket(MAX_QPS, MAX_QPS);

type serverConfigType = {
	/**
	 * 服务运行端口
	 */
	port: number;
	/**
	 * 当前是否为生产模式
	 */
	isProduction: boolean;
	/**
	 * 当前是否清空当前控制台,默认为false
	 */
	clear?: boolean;
};

/**
 * 服务器配置
 * @param port  服务运行端口
 * @param isProduction 是生产模式吗？
 * @param clear 是否清空控制台? 默认：false
 */
export const serverConfig = ({
	port,
	isProduction,
	clear,
}: serverConfigType) => {
	{
		clear ? process.stdout.write('\x1B[2J\x1B[H') : '';
	}
	console.error(`${chalk.blue('[INFO]')} ${creatTime} ${chalk.green(
		'服务启动中...'
	)}
${chalk.blue('[INFO]')} ${creatTime} ${chalk.green(
		isProduction
			? `监听运行端口: ${port}`
			: `项目运行于：http://localhost:${port}`
	)}`);
};

/**
 * 响应日志记录
 */
export const ResponseLogger = async (ctx: Context, next: Next) => {
	const { httpVersion } = ctx.req;
	const { method, url, host, headers } = ctx.request;
	const start = Date.now();
	await next();
	const { status } = ctx.response;
	const responseTime = Date.now() - start;
	const log = `${getIPAddress()} "${method} ${url}  HTTP/${httpVersion}" ${status} ${responseTime}ms ${host} ${
		headers['user-agent']
	}`;
	// 只有状态码为2** 的时候才记记录响应日志
	if (status >= 200 && status < 300) {
		logMessage('response', log);
	}
};

/**
 * 全局错误统一处理
 */
export const ErrorHandler = (
	/** 自定义错误信息 */
	err: {
		status: string;
		info: string;
		infocode: string;
	} | null,
	/** 必传参数 */
	ctx: Context,
	/** HTTP状态码 */
	code: number = 500
) => {
	interface ErrorMap {
		[code: number]: { status: number; msg: string };
	}
	const errorMap: ErrorMap = {
		/** 请求错误 */
		400: { status: 400, msg: 'REQUEST_ERROR' },
		/** 未经授权 */
		401: { status: 401, msg: 'UNAUTHORIZED' },
		/** 拒绝请求 */
		403: { status: 403, msg: 'REJECTS_REQUEST' },
		/** 未找到请求 */
		404: { status: 404, msg: 'REQUEST_NOT_FOUND' },
		/** 请求超时 */
		408: { status: 408, msg: 'REQUEST_TIMEOUT' },
		/** 请求次数过多 */
		429: { status: 429, msg: 'TOO_MANY_REQUEST' },
	};
	/** 服务器内部错误 */
	const defaultError: { status: number; msg: string } = {
		status: 500,
		msg: 'INTERNAL_SERVER_ERROR',
	};

	const { status, msg } = errorMap[code] || defaultError;
	const { httpVersion } = ctx.req;
	const { method, url, host } = ctx.request;

	if (err && Object.keys(err).length !== 0) {
		const log = `${getIPAddress()} "${method} ${url}  HTTP/${httpVersion}" ${status} ${host} ${
			err!.infocode
		} ${err!.info}`;
		ctx.status = status;
		ctx.body = err;
		logMessage('error', log);
	} else {
		ctx.status = status;
		ctx.body = { status, msg };
	}
};

/**
 * 请求不存在的路由的统一处理
 */
export const NonExistentRoute = async (ctx: Context, next: Next) => {
	await next();
	const { status } = ctx.response;
	if (ctx.status === 404) {
		ctx.app.emit(
			'error',
			{ infocode: status, info: `Cannot ${ctx.method} ${ctx.url}` },
			ctx,
			404
		);
	}
};

/**
 * 全局接口QPS限制
 */
export const limitQPS = async (ctx: Context, next: Next) => {
	tokenBucket.refill();
	if (tokenBucket.take()) {
		await next();
	} else {
		ctx.app.emit('error', null, ctx, 429);
	}
};
