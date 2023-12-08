const data = {
	/**
	 * 终端输出日志
	 */
	TerminalOutputLog: false,
	/**
	 * 日志记录要保留的天数
	 */
	LogDaysToKeep: 30,
	/**
	 * 项目运行端口
	 */
	port: 8000,
	/**
	 * 是否清空控制台，注意：部分错误信息会被清空！！这很重要请慎用
	 */
	clear: true,
	/**
	 * 是否处于生产模式
	 */
	isProduction: false,
	/**
	 * 全局接口的QPS
	 */
	MAX_QPS: 30,
};

export = data;
