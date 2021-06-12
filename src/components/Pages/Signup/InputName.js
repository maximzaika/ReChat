import InputVerify from "../../UI/InputVerify/InputVerify";
import ConvertObjectToArray from "../../../shared/convertData";

export default function InputName({ config, changed, valid, ...props }) {
  const configArr = ConvertObjectToArray(config);

  return (
    <div className="flex-col sm:grid sm:grid-cols-2 sm:gap-4">
      {configArr.map((input) => (
        <InputVerify
          key={input.id}
          label={input.options.label}
          valid={input.options.valid}
          validate={true}
          config={input.options.config}
          touched={input.options.touched}
          value={input.options.value}
          showErrors={input.options.showErrors}
          errors={input.options.errors}
          changed={(event) => {
            changed(event, input.id);
          }}
        />
      ))}
    </div>
  );
}
