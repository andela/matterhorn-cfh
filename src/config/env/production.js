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
<<<<<<< HEAD
    callbackURL: 'hhttps://matterhorn-cfh-test.herokuapp.com/auth/twitter/callback'
=======
    callbackURL: 'https://matterhorn-cfh-test.herokuapp.com/auth/twitter/callback'
>>>>>>> 0037fd08130100104e00f84c48361abb241f6371
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

