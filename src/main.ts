'use strict';

import server from './config/server';
import { serverConfig } from './config/config';
import { port, clear, isProduction } from './config/config.default';

server.listen(port, () => serverConfig({ port, isProduction, clear }));
