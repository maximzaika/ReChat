import IcoOk from "../../../assets/ico/ico-ok";
import { TEXT_COLOR_DANGER } from "../../../shared/colors";

function InputVerify({
  inputType,
  valid,
  validate,
  label,
  config,
  changed,
  showErrors,
  errors,
  clicked,
  ...props
}) {
  let inputElement = null;
  const initialClass =
    "outline-none block w-full border border-solid " +
    "border-gray-400 bg-gray-50 rounded " +
    "px-2 py-1.5 focus:ring focus:border-p";

  switch (inputType) {
    case "textarea":
      inputElement = (
        <textarea
          className={initialClass}
          onChange={changed}
          onClick={clicked}
          {...config}
        />
      );
      break;
    default:
      // input
      inputElement = (
        <input
          className={initialClass}
          onChange={changed}
          onClick={clicked}
          {...config}
        />
      );
  }

  let errorEl = null;
  if (showErrors) {
    if (errors && errors.length > 0) {
      errorEl = (
        <ul className="mt-1 ml-1 list-disc list-inside">
          {errors.map((error, i) => (
            <li key={i} className="text-red-400">
              {error}
            </li>
          ))}
        </ul>
      );
    } else {
      errorEl = (
        <p className={`mt-1 ${TEXT_COLOR_DANGER}`}>
          Enter {label.toLowerCase()}
        </p>
      );
    }
  }

  return (
    <div className="mt-2">
      <label>{label}</label>
      <div className="relative">
        {valid && validate && (
          <IcoOk
            className={`
                absolute top-1 text-p w-6 h-6 
                fill-current mr-2 mt-1 flex-none
                right-0
            `}
          />
        )}
        {inputElement}
      </div>

      {errorEl}
    </div>
  );
}

export default InputVerify;
