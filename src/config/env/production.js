import dotenv from 'dotenv';

dotenv.load();

export default {
  app: {
    name: 'Cards for Humanity'
  },
  facebook: {
    clientID: 'FACEBOOK_APP_ID',
    clientSecret: 'FACEBOOK_APP_SECRET',
    callbackURL: 'https://matterhorn-cfh-test.herokuapp.com/auth/facebook/callback'
  },
  twitter: {
    clientID: 'CONSUMER_KEY',
    clientSecret: 'CONSUMER_SECRET',
    callbackURL: 'hhttps://matterhorn-cfh-test.herokuapp.com/auth/twitter/callback'
  },
  github: {
    clientID: 'APP_ID',
    clientSecret: 'APP_SECRET',
    callbackURL: 'https://matterhorn-cfh-test.herokuapp.com/auth/github/callback'
  },
  google: {
    clientID: 'APP_ID',
    clientSecret: 'APP_SECRET',
    callbackURL: 'https://matterhorn-cfh-test.herokuapp.com/auth/google/callback'
  }
};
// export default { config };

