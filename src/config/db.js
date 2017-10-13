import mongoose from 'mongoose';
import path from 'path';
import config from '../config/config';
import walk from '../utils/walk';

export default () => {
  // Bootstrap db connection
  mongoose.connect(config.db);
  // const dbCon = mongoose.connect(config.db);

  // Bootstrap models
  const modelsPath = path.join(__dirname, '../app/models');
  walk(modelsPath);
};
