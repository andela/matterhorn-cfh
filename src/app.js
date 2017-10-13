/**
 * Module dependencies.
 */

import express from 'express';
import dotEnv from 'dotenv';
import db from './config/db';

dotEnv.config();

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Load configurations
// if test env, load example file
db();

const app = express();

app.use((req, res, next) => {
  next();
});

// expose app
export default app;
