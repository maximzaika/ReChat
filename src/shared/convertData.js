export default function ConvertObjectToArray(objToConvert) {
  const arr = [];
  for (let key in objToConvert) {
    arr.push({
      id: key,
      options: objToConvert[key],
    });
  }
  return arr;
}
