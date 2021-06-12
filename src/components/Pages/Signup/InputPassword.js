import { Fragment, useState, useEffect } from "react";
import InputVerify from "../../UI/InputVerify/InputVerify";
import ConvertObjectToArray from "../../../shared/convertData";
import * as colors from "../../../shared/colors";

import IcoOk from "../../../assets/ico/ico-ok";

export default function InputPassword({
  config,
  type,
  changed,
  clicked,
  valid,
  ...props
}) {
  const configArr = ConvertObjectToArray(config);
  const [validPassword, setValidPassword] = useState(false);

  useEffect(() => {
    if (configArr[0].id === "password" && configArr[0].options.valid) {
      setValidPassword(true);
    } else {
      setValidPassword(false);
    }
  }, [configArr]);

  const inputVerify = (input) => {
    return (
      <InputVerify
        key={input.id}
        label={input.options.label}
        config={input.options.config}
        touched={input.options.touched}
        initValidation={input.options.validation}
        value={input.options.value}
        showErrors={input.options.showErrors}
        errors={input.options.errors}
        valid={type === "signup" && input.options.valid}
        validate={type === "signup"}
        changed={(event) => {
          changed(event, input.id);
        }}
      />
    );
  };

  return (
    <Fragment>
      {configArr.map((input) => {
        // Only when on the Login Page
        if (type === "login" && input.id !== "confirmPassword") {
          return inputVerify(input);
        }

        if (type === "login") {
          return null;
        }

        // Only when on the Signin Page
        if (input.id !== "confirmPassword") {
          return (
            <Fragment key={input.id}>
              {inputVerify(input)}

              {input.options.touched && !input.options.valid && (
                <div className="flex flex-col sm:flex-row ">
                  <div className="mt-4 sm:mr-4">
                    {Object.keys(input.options.validOptions).map((key, i) => {
                      const fontColor = input.options.validOptions[key].check
                        ? colors.TEXT_COLOR_SUCCESS
                        : colors.TEXT_COLOR_NEUTRAL;
                      return (
                        <Fragment key={i}>
                          {i > 2 && (
                            <div className="mt-3 flex">
                              <IcoOk
                                className={`${fontColor} w-6 h-6 fill-current mr-2 mt-1 flex-none`}
                              />
                              <span className={`${fontColor}`}>
                                {input.options.validOptions[key].message}
                              </span>
                            </div>
                          )}
                        </Fragment>
                      );
                    })}
                  </div>

                  <div className="mr-4 sm:mt-4 sm:mr-0">
                    {Object.keys(input.options.validOptions).map((key, i) => {
                      const fontColor = input.options.validOptions[key].check
                        ? colors.TEXT_COLOR_SUCCESS
                        : colors.TEXT_COLOR_NEUTRAL;
                      return (
                        <Fragment key={i}>
                          {i <= 2 && (
                            <div className="mt-3 flex">
                              <IcoOk
                                className={`${fontColor} w-6 h-6 fill-current mr-2 mt-1 flex-none`}
                              />
                              <span className={`${fontColor}`}>
                                {input.options.validOptions[key].message}
                              </span>
                            </div>
                          )}
                        </Fragment>
                      );
                    })}
                  </div>
                </div>
              )}
            </Fragment>
          );
        }

        if (input.id === "confirmPassword" && validPassword) {
          return inputVerify(input);
        }

        return null;
      })}
    </Fragment>
  );
}
