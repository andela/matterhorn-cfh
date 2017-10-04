import dotenv from 'dotenv';

dotenv.load();

export default {
  app: {
    name: 'Cards for Humanity'
  },
  facebook: {
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: 'https://matterhorn-cfh-test.herokuapp.com/auth/facebook/callback'
  },
  twitter: {
    clientID: process.env.CONSUMER_KEY,
    clientSecret: process.env.CONSUMER_SECRET,
    callbackURL: 'https://matterhorn-cfh-test.herokuapp.com/auth/twitter/callback'
  },
  github: {
    clientID: process.env.APP_ID,
    clientSecret: process.env.APP_SECRET,
    callbackURL: 'https://matterhorn-cfh-test.herokuapp.com/auth/github/callback'
  },
  google: {
    clientID: process.env.APP_ID,
    clientSecret: process.env.APP_SECRET,
    callbackURL: 'https://matterhorn-cfh-test.herokuapp.com/auth/google/callback'
  }
};
// export default { config };

