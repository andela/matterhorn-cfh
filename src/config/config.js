import _ from 'underscore';
import configAll from './env/all';
import configDevelopment from './env/development.json';
import configProduction from './env/production';
import configTest from './env/test.json';
// Load app configuration


const { NODE_ENV } = process.env;
let config = '';

switch (NODE_ENV) {
  case 'development':
    config = configDevelopment;
    break;
  case 'production':
    config = configProduction;
    break;
  case 'test':
    config = configTest;
    break;
  default:
    config = configDevelopment;
    break;
}
export default _.extend(
  configAll,
  config
);
