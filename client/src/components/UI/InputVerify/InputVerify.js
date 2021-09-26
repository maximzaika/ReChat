import IcoOk from "../../../assets/ico/ico-ok";
import { TEXT_COLOR_DANGER } from "../../../shared/colors";

function InputVerify({
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
  const initialClass =
    "block w-full border border-solid border-gray-400 px-2 py-1.5";

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
        <input
          className={initialClass}
          onChange={changed}
          onClick={clicked}
          {...config}
        />
      </div>

      {errorEl}
    </div>
  );
}

export default InputVerify;
