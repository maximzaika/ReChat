import { useState, useEffect } from "react";

export default function useFetchJson(url, addExtraObject, isAuth) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!isAuth) {
      setData([{ authError: "Please login" }]);
      return;
    }

    fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        if (addExtraObject) {
          for (let d in json) {
            for (let extra in addExtraObject) {
              json[d][extra] = "";
            }
          }
        }

        setData(json);
      });
  }, []);

  return [data, setData];
}
