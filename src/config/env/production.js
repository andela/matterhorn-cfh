import dotenv from 'dotenv';

dotenv.load();

export default {
  app: {
    name: 'Cards for Humanity'
  },
  facebook: {
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.facebookCallBackUrl || 'https://matterhorn-cfh-staging.herokuapp.com/auth/facebook/callback'
  },
  twitter: {
    clientID: process.env.CONSUMER_KEY,
    clientSecret: process.env.CONSUMER_SECRET,
    callbackURL: process.env.twitterCallBackUrl || 'https://matterhorn-cfh-staging.herokuapp.com/auth/twitter/callback'

  },
  github: {
    clientID: process.env.APP_ID,
    clientSecret: process.env.APP_SECRET,
    callbackURL: process.env.githubCallBackUrl || 'https://matterhorn-cfh-staging.herokuapp.com/auth/github/callback'
  },
  google: {
    clientID: process.env.APP_ID,
    clientSecret: process.env.APP_SECRET,
    callbackURL: process.env.googleCallBackUrl || 'https://matterhorn-cfh-staging.herokuapp.com/auth/google/callback'
  }
};

