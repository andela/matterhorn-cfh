import validator from 'validator';
import { isEmpty, trim } from 'lodash';

const validateInput = (input) => {
  let error = '';

  if (trim(input.email).length === 0) {
    error = 'Email is Invalid';
  } else if (!validator.isEmail(input.email)) {
    error = 'Email is Invalid';
  }

  if (trim(input.name).length === 0) {
    error = 'Name is Invalid';
  } else if (input.name.charAt(0) === ' ') {
    error = 'Name is Invalid';
  } else if (input.name.charAt(input.name.length - 1) === ' ') {
    error = 'Name is Invalid';
  }

  if (trim(input.password).length === 0) {
    error = 'Password is too short';
  } else if (input.password.length < 5) {
    error = 'Password is too short';
  }

  return {
    error,
    isValid: isEmpty(error)
  };
};

export default validateInput;
