import Router from 'koa-router';

const router = new Router({ prefix: '/' });

router.get('', async (ctx) => {
	await ctx.render('index', { Introduction: 'koa + ts + server' });
});

export default router;
