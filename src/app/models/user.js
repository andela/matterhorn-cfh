import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Helper from './helper';

const { Schema } = mongoose;

/* eslint-disable no-underscore-dangle */
/**
 * User Schema
 */
const UserSchema = new Schema({
  name: String,
  email: String,
  username: String,
  provider: String,
  avatar: String,
  location: String,
  premium: Number, // null or 0 for non-donors, 1 for everyone else (for now)
  donations: [],
  hashed_password: String,
  facebook: String,
  twitter: {},
  github: {},
  google: {},
  friends: [],
  last_login: Date
});

/**
 * Virtuals
 */
UserSchema.virtual('password').set(Helper.validatePass).get(Helper.returnPass);

/**
 * Validations
 */

// the below 4 validations only apply if you are signing up traditionally
UserSchema.path('name').validate(Helper.validateName, 'Name cannot be blank');

UserSchema
  .path('email').validate(Helper.validateEmail, 'Email cannot be blank');

UserSchema
  .path('username').validate(
    Helper.validateUsername,
    'Username cannot be blank'
  );

UserSchema
  .path('hashed_password')
  .validate(Helper.validateHash, 'Password cannot be blank');


/**
 * Pre-save hook
 */
UserSchema.pre('save', Helper.preSaveHook);


/**
 * Methods
 */
UserSchema.methods = {
  /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */

  authenticate(plainText) {
    if (!plainText || !this.hashed_password) {
      return false;
    }
    return bcrypt.compareSync(plainText, this.hashed_password);
  },

  /**
     * Encrypt password
     *
     * @param {String} password
     * @return {String}
     * @api public
     */

  encryptPassword(password) {
    if (!password) return '';
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
  }
};

mongoose.model('User', UserSchema);

const User = mongoose.model('User', UserSchema);

export default User;
