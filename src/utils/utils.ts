import os from 'os';
/**
 * 获取用户IP
 */
export const getIPAddress = () => {
	const interfaces = os.networkInterfaces();
	let ipAddress = '';
	for (const key in interfaces) {
		const iface = interfaces[key] as any;
		for (let i = 0; i < iface.length; i++) {
			if (iface[i].family === 'IPv4' && !iface[i].internal) {
				ipAddress = iface[i].address;
				break;
			}
		}
	}

	return ipAddress;
};

/**
 * 令牌桶
 */
export class TokenBucket {
	/**
	 * 令牌生成速率（每秒生成的令牌数）
	 */
	rate: number;
	/**
	 * 令牌桶的容量
	 */
	capacity: number;
	/**
	 * 当前令牌桶中的令牌数量
	 */
	tokens: number;
	/**
	 * 上次令牌生成时间
	 */
	lastRefillTime: number;

	constructor(rate: number, capacity: number) {
		this.rate = rate;
		this.capacity = capacity;
		this.tokens = capacity;
		this.lastRefillTime = Date.now();
	}
	/**
	 * 固定速度生成令牌
	 */
	refill() {
		const now = Date.now();
		const elapsedTime = (now - this.lastRefillTime) / 1000; // 计算距离上次生成令牌的时间间隔（秒）
		const newTokens = elapsedTime * this.rate; // 根据速率计算生成的新令牌数量
		if (this.tokens < this.capacity) {
			this.tokens = Math.min(this.tokens + newTokens, this.capacity);
		} // 更新令牌桶中的令牌数量
		this.lastRefillTime = now; // 更新上次令牌生成时间
	}
	/**
	 * 用于从令牌桶中获取一个令牌
	 */
	take() {
		if (this.tokens < 1) {
			return false; // 令牌桶中没有可用的令牌，拒绝请求
		}
		this.tokens--; // 消耗一个令牌
		return true; // 允许请求通过
	}
}
