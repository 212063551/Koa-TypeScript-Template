'use strict';
import Koa from 'koa';
import path from 'path';
import cors from '@koa/cors';
import Router from 'koa-router';
import views from '@ladjs/koa-views';
import { FileRoutes } from '../config/router';
import {
	ErrorHandler,
	ResponseLogger,
	NonExistentRoute,
	limitQPS,
} from './config';

const server = new Koa();
const router: any = new Router();

FileRoutes(router);

server.use(cors());
server.use(limitQPS);
server.use(views(path.join(__dirname, '../views'), { extension: 'ejs' }));
server.use(ResponseLogger);
server.use(NonExistentRoute);
server.use(router.routes());
server.on('error', ErrorHandler);

export default server;
