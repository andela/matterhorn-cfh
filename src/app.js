/**
 * Module dependencies.
 */

import mongoose from 'mongoose';
import express from 'express';
import dotEnv from 'dotenv';

import config from './config/config';
import walk from './utils/walk';

dotEnv.config();

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Load configurations
// if test env, load example file

// Bootstrap db connection
mongoose.connect(config.db);

// Bootstrap models
const modelsPath = `${__dirname}/app/models`;
walk(modelsPath);

const app = express();

app.use((req, res, next) => {
  next();
});

// expose app
export default app;
