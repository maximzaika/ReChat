import { useState, useEffect } from "react";

export default function useFetchJson(url) {
  const [data, setData] = useState([]);

  useEffect(() => {
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
        setData(json);
      });
  }, []);

  return data;
}
