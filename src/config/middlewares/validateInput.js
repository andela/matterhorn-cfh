import validator from 'validator';
import { isEmpty, trim } from 'lodash';

const validateInput = (input) => {
  let error = '';

  if (input.password.length === 0) {
    error = 'Password is Required';
  } else if (input.password.length < 5) {
    error = 'Password is too short (Minimum of 5 characters required)';
  }

  if (trim(input.email).length === 0) {
    error = 'Email is Required';
  } else if (!validator.isEmail(input.email)) {
    error = 'Email is Invalid';
  }

  if (trim(input.name).length === 0) {
    error = 'Name is Required';
  } else if (input.name.charAt(0) === ' ') {
    error = 'Name is Invalid';
  } else if (input.name.charAt(input.name.length - 1) === ' ') {
    error = 'Name is Invalid';
  }

  return {
    error,
    isValid: isEmpty(error)
  };
};

export default validateInput;
