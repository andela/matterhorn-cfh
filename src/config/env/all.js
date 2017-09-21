import path from 'path';
import dotEnv from 'dotenv';

const rootPath = path.normalize(`${__dirname}/../..`);
dotEnv.config();

const { PORT, MONGOHQ_URL } = process.env;

export default {
  root: rootPath,
  port: PORT || 3000,
  db: MONGOHQ_URL
};
