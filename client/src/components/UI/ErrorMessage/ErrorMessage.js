import { Fragment, useState, useEffect, useRef } from "react";
import IcoClose from "../../../assets/ico/ico-close";

export default function ErrorMessage({ show, message }) {
  const [showError, setShowError] = useState(false);
  const timer = useRef(null);

  const onCloseClickHandler = () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    setShowError(false);
  };

  useEffect(() => {
    if (!show) {
      setShowError(false);
      return;
    }

    if (timer.current) {
      clearTimeout(timer.current);
      setShowError(false);
    }

    setShowError(true);

    timer.current = setTimeout(() => {
      setShowError(false);
    }, 4000);
  }, [show]);

  useEffect(
    () => () => {
      // Clear error just in case if the page changes white timer is running
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    []
  );

  return (
    <Fragment>
      {showError && (
        <div className="bg-red-600 rounded relative">
          <IcoClose
            className="absolute text-white w-5 h-5
              fill-current mr-2 mt-1 flex-none top-0 -right-0.5 cursor-pointer
              hover:text-p"
            clicked={onCloseClickHandler}
          />
          <p className="text-white p-4 pr-10 italic">{message}</p>
        </div>
      )}
    </Fragment>
  );
}
