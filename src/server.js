/**
 * Module dependencies.
 */

import mongoose from 'mongoose';
import passport from 'passport';
import logger from 'mean-logger';
import io from 'socket.io';

import app from './app';
import expressConfig from './config/express';
import passportConfig from './config/passport';
import routesConfig from './config/routes';

const { PORT } = process.env;

passportConfig();
expressConfig();
routesConfig();

// Start the app by listening on <port>
const port = PORT || 3000;

const server = app.listen(port);
const ioObj = io.listen(server, { log: false });
// game logic handled here
require('./config/socket/socket')(ioObj);

process.stdout.write(`Express app started on port ${port} \n`);

// Initializing logger
logger.init(app, passport, mongoose);

// expose app
export default app;
