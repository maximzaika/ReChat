import React, { useState } from "react";
import { updateObject } from "../../shared/updateData";
import { inputValidity, verifyPasswords } from "../../shared/inputValidity";

import MyLink from "../UI/MyLink/MyLink";
import InputName from "../Pages/Signup/InputName";
import InputVerify from "../UI/InputVerify/InputVerify";
import InputPassword from "../Pages/Signup/InputPassword";
import HorizontalLine from "../UI/HorizontalLine/HorizontalLine";
import ButtonLoading from "../UI/ButtonLoading/ButtonLoading";
import ErrorMessage from "../UI/ErrorMessage/ErrorMessage";

// type = login/signup
function AuthForm({ onAuth, type, isLoading, isError, ...props }) {
  const authType = type === "signup";
  const [form, setForm] = useState({
    firstName: {
      label: "First name",
      type: "input",
      config: {
        name: "fname",
        type: "text",
        placeholder: "eg. John",
      },
      value: "",
      validation: {
        required: true,
        isName: true,
      },
      valid: false,
      validOptions: {},
      showErrors: false,
      errors: null,
      touched: false,
    },
    surName: {
      label: "Surname",
      type: "input",
      config: {
        name: "lname",
        type: "text",
        placeholder: "eg. Smith",
      },
      value: "",
      validation: {
        required: true,
        isName: true,
      },
      valid: false,
      validOptions: {},
      showErrors: false,
      errors: null,
      touched: false,
    },
    email: {
      label: "Email",
      type: "input",
      config: {
        name: "email",
        type: "email",
        placeholder: authType ? "eg. johnsmith@email.com" : "Enter your Email",
      },
      value: "",
      validation: {
        required: true,
        isEmail: true,
      },
      valid: false,
      validOptions: {},
      showErrors: false,
      errors: null,
      touched: false,
    },
    password: {
      label: "Password",
      type: "input",
      config: {
        type: "password",
        placeholder: authType ? "At least 6 characters" : "Enter your Password",
      },
      value: "",
      validation: {
        required: true,
        isPassword: true,
        minLength: 6,
        maxLength: 16,
      },
      valid: false,
      validOptions: {
        min: { check: null, message: "At least 6 characters required" },
        max: { check: null, message: "Must be less than 16 characters" },
        lower: {
          check: null,
          message: "At least 1 lower case letter is required",
        },
        upper: {
          check: null,
          message: "At least 1 upper case letter is required",
        },
        isNumeric: {
          check: null,
          message: "At least 1 number is required",
        },
        special: {
          check: null,
          message: "At least 1 special character is required",
        },
      },
      showErrors: false,
      errors: null,
      touched: false,
    },
    confirmPassword: {
      label: "Confirm Password",
      type: "input",
      config: {
        type: "password",
        placeholder: "Same as password",
      },
      value: "",
      validation: {
        required: true,
        isPassword: true,
        minLength: 6,
        maxLength: 16,
        isMatchingPassword: null,
      },
      valid: false,
      validOptions: {},
      showErrors: false,
      errors: null,
      touched: false,
    },
  });
  const [formValid, setFormValid] = useState(false);
  const [attemptSubmit, setAttemptSubmit] = useState(false);

  const updateForm = (key, keyToUpdate) => {
    const updatedInput = updateObject(form[key], keyToUpdate);
    setForm((prevState) => updateObject(prevState, { [key]: updatedInput }));
  };

  const onClickHandler = (key) => {
    if (!form[key].touched) {
      updateForm(key, {
        touched: true,
      });
    }
  };

  const onSubmitHandler = (event) => {
    event.preventDefault();
    let invalid = false;

    if (authType) {
      for (let key in form) {
        if (authType) {
          invalid = verifyPasswords(key, form, authType, updateForm);
        }

        if (
          !authType &&
          !form[key].valid &&
          (key === "email" || key === "password")
        ) {
          invalid = true;
          updateForm(key, {
            errors: [`${form[key].label} is required`],
            showErrors: true,
          });
        }
      }

      setAttemptSubmit(true);
    } else {
      invalid = form.password.value.length === "" || form.email.length === "";
    }

    if (invalid) {
      return;
    }

    onAuth(
      form.email.value,
      form.password.value,
      authType,
      form.firstName.value,
      form.surName.value
    );
  };

  const onInputChangeHandler = (event, key) => {
    let tempForm = { ...form };
    const value = event.target.value;
    const [valid, validations, errors] = inputValidity(
      key,
      value,
      tempForm[key].label,
      tempForm[key].validation
    );

    let validOptions = null;
    if (key === "password" && authType) {
      validOptions = { ...tempForm.password.validOptions };
      for (let key in validations) {
        for (let key2 in validOptions) {
          if (key === key2) {
            validOptions[key].check = validations[key];

            // Initiates the updated on the confirm for matching purposes
            const updatePasswordForMatching = updateObject(
              tempForm["confirmPassword"],
              {
                validation: updateObject(
                  tempForm["confirmPassword"].validation,
                  {
                    isMatchingPassword: value,
                  }
                ),
              }
            );
            updateForm("confirmPassword", updatePasswordForMatching);
          }
        }
      }
    }

    let showError = false;
    if (errors && attemptSubmit && errors.length > 0 && authType) {
      showError = true;
    }

    const recordsToUpdate = {
      value: value,
      valid: valid,
      touched: true,
      errors: errors,
      validOptions: validOptions ? validOptions : tempForm[key].validOptions,
      showErrors: showError,
    };

    updateForm(key, recordsToUpdate);
    tempForm = updateObject(tempForm, { [key]: recordsToUpdate });

    let formIsValid = true;
    for (let key in tempForm) {
      formIsValid = tempForm[key].valid && formIsValid;
    }

    setFormValid(formIsValid);

    if (key === "password" && attemptSubmit && authType) {
      updateForm("confirmPassword", {
        showErrors: showError,
      });
    }
  };

  const secondaryText = authType
    ? "Already have an account? "
    : "New to ReChat? ";
  const secondaryPath = authType ? "/login" : "/signup";
  const secondaryLink = authType ? "Login" : "Join now";

  return (
    <div className="w-full table h-screen">
      <form onSubmit={onSubmitHandler} className="table-cell align-middle">
        <h1>
          {authType ? "Sing Up" : "Login"} to{" "}
          <MyLink path="/" className="text-5xl">
            ReChat
          </MyLink>
        </h1>
        <p className="italic">
          Fill in the details below to{" "}
          {authType ? "create an account" : "sign in"}.
        </p>
        <div className="max-w-500px">
          {authType && (
            <InputName
              config={{ firstName: form.firstName, surName: form.surName }}
              changed={(event, inputKey) => {
                onInputChangeHandler(event, inputKey);
              }}
            />
          )}

          <InputVerify
            label={form.email.label}
            config={form.email.config}
            touched={form.email.touched}
            initValidation={form.email.validation}
            value={form.email.value}
            showErrors={form.email.showErrors}
            errors={form.email.errors}
            valid={type === "signup" && form.email.valid}
            validate={type === "signup"}
            changed={(event) => {
              onInputChangeHandler(event, "email");
            }}
          />

          <InputPassword
            config={{
              password: form.password,
              confirmPassword: form.confirmPassword,
            }}
            type={type}
            changed={(event, inputKey) => {
              onInputChangeHandler(event, inputKey);
            }}
            clicked={(inputKey) => {
              onClickHandler(inputKey);
            }}
          />

          <ButtonLoading
            ariaLabel={authType ? "Sign up" : "Login"}
            loading={isLoading}
            type="submit"
            disabled={(!formValid && authType) || isLoading}
          >
            {authType && !isLoading ? "Sign up" : !isLoading ? "Login" : null}
          </ButtonLoading>

          <ErrorMessage show={!isLoading && isError} message={isError} />

          <HorizontalLine />

          <p className="italic">
            {secondaryText}
            <MyLink path={secondaryPath}>{secondaryLink}</MyLink>
          </p>
        </div>
      </form>
    </div>
  );
}

export default AuthForm;
