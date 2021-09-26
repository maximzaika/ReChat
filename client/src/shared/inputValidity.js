/**
 * @param key {string} - key within the object that requires update
 * @param value {any} - value from the object for verification
 * @param label {string} - label used for custom errors based on the label of the input
 * @param rules {Object} - object that contains rules for verification
 * @return [isValid, validations, errors] Array {string[]} - returns whether current input is valid
 *                       all of its validations, and error messages
 * */
export function inputValidity(key, value, label, rules) {
  let isValid = true;

  if (!rules) {
    return true;
  }

  const validations = {};
  const errors = [];
  const _label = label.toLowerCase();
  const notKey = key !== "confirmPassword";

  const updateError = (errorMessage, isValid) => {
    if (!isValid && notKey) {
      errors.push(errorMessage);
    }
  };

  const updateErrorIfKey = (errorMessage, isValid) => {
    if (!isValid) {
      errors.push(errorMessage);
    }
  };

  if (rules.required) {
    isValid = value.trim() !== "" && isValid;
    validations.required = isValid;

    const errorMessage = `Enter ${_label}`;
    updateError(errorMessage, isValid);
  }

  if (rules.minLength) {
    isValid = value.length >= rules.minLength && isValid;
    validations.min = isValid;

    const errorMessage = `Must be at least ${rules.minLength} characters`;
    updateError(errorMessage, isValid);
  }

  if (rules.maxLength) {
    isValid = value.length <= rules.maxLength && isValid;
    validations.max = isValid;

    const errorMessage = `Must be less than ${rules.maxLength} characters`;
    updateError(errorMessage, isValid);
  }

  if (rules.isEmail) {
    const pattern = /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
    isValid = pattern.test(value) && isValid;
    validations.isEmail = isValid;

    const errorMessage = `Invalid email`;
    updateError(errorMessage, isValid);
  }

  if (rules.isPassword) {
    validations["lower"] = /[a-z]/.test(value) > 0;
    validations["upper"] = /[A-Z]/.test(value) > 0;
    validations["isNumeric"] = /[0-9]/.test(value) > 0;
    validations["special"] = /[!@_#$&*]/.test(value) > 0;

    const errorIsNotLower = `At least 1 lower case character is required`;
    const errorIsNotUpper = `At least 1 upper case character is required`;
    const errorIsNotNumeric = `At least 1 number is required`;
    const errorIsNotSpecial = `At least 1 special character is required`;
    updateError(errorIsNotLower, validations.lower);
    updateError(errorIsNotUpper, validations.upper);
    updateError(errorIsNotNumeric, validations.isNumeric);
    updateError(errorIsNotSpecial, validations.special);

    isValid =
      validations.lower &&
      validations.upper &&
      validations.isNumeric &&
      validations.special &&
      isValid;
  }

  if (rules.isName) {
    const pattern = /^[a-z ,.'-]+$/i;
    isValid = pattern.test(value) && isValid;
    validations.isName = isValid;

    const errorMessage = `Must not contain numbers`;
    updateError(errorMessage, isValid);
  }

  if (rules.isNumeric) {
    const pattern = /^d+$/;
    isValid = pattern.test(value) && isValid;
    validations.isNumeric = isValid;
    const errorMessage = `Must be a number`;
    updateError(errorMessage, isValid);
  }

  if (rules.hasNoUrl) {
    const pattern = /((useHttp:\/\/|https:\/\/)?(www.)?(([a-zA-Z0-9-]){2,}\.){1,4}([a-zA-Z]){2,6}(\/([a-zA-Z-_/.0-9#:?=&;,]*)?)?)/;
    isValid = !pattern.test(value) && isValid;
    validations.hasNoUrl = isValid;
    const errorMessage = `Must not contain a URL`;
    updateError(errorMessage, isValid);
  }

  if (rules.isMatchingPassword) {
    isValid = value === rules.isMatchingPassword && isValid;
    const errorMessage = `Passwords don't match`;
    updateErrorIfKey(errorMessage, isValid);
  }

  return [isValid, validations, errors];
}

export function verifyPasswords(
  key,
  form,
  performValidation,
  updateForm,
  showError
) {
  let invalid = false;
  let checkPassword = null;
  if (
    key === "password" &&
    form[key].value !== form.confirmPassword.value &&
    form.confirmPassword.value !== "" &&
    form[key].value !== "" &&
    performValidation
  ) {
    checkPassword = "Passwords don't match";
    invalid = true;
    updateForm("confirmPassword", {
      errors: checkPassword ? [checkPassword] : form[key].errors,
      showErrors: showError !== undefined ? showError : true,
    });
  }

  if (!form[key].valid && performValidation && !invalid) {
    invalid = true;
    updateForm(key, {
      showErrors: showError !== undefined ? showError : true,
    });
  }

  return invalid;
}
