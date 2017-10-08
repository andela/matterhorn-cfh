/* eslint-disable no-underscore-dangle */
const authTypes = ['github', 'twitter', 'facebook', 'google'];

const validatePresenceOf = value => value && value.length;

const validatePass = function validatePass(password) {
  this._password = password;
  this.hashed_password = this.encryptPassword(password);
};

const returnPass = function returnPass() {
  return this._password;
};

const validateName = function validateName(name) {
  if (authTypes.indexOf(this.provider) !== -1) return true;
  return name.length;
};

const validateEmail = function validateEmail(email) {
  // if you are authenticating by any of the oauth strategies, don't validate
  if (authTypes.indexOf(this.provider) !== -1) return true;
  return email.length;
};

const validateUsername = function validateUsername(username) {
  // if you are authenticating by any of the oauth strategies, don't validate
  if (authTypes.indexOf(this.provider) !== -1) return true;
  return username.length;
};

const validateHash = function validateHash(hashedPassword) {
  // if you are authenticating by any of the oauth strategies, don't validate
  if (authTypes.indexOf(this.provider) !== -1) return true;
  return hashedPassword.length;
};

const preSaveHook = function preSaveHook(next) {
  if (!this.isNew) return next();

  if (
    !validatePresenceOf(this.password)
    && authTypes.indexOf(this.provider) === -1) {
    next(new Error('Invalid password'));
  } else {
    next();
  }
};

export default {
  validatePass,
  returnPass,
  validateName,
  validateEmail,
  validateUsername,
  validateHash,
  preSaveHook
};
