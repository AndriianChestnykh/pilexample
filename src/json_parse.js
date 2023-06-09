module.exports.execute = async function (pols, jsonStr, key, value) {
  const N = pols.keyValueSymbol.length;

  if (jsonStr.length > N) {
    throw new Error("json too long");
  }

  if (JSON.parse(jsonStr)[key] !== value) {
    throw new Error("key value pair does not exist");
  }

  let keyValueStr = "\"" + key + "\":\"" + value + "\"";
  const keyValueIndex = jsonStr.indexOf(keyValueStr);
  if (keyValueIndex === -1) {
    throw new Error("Can't find first symbol of key value pair");
  }

  for (let i = 0; i < N; i++) {
    pols.json[i] = i < jsonStr.length ? BigInt(jsonStr.charCodeAt(i)) : 0n;
    if (i >= keyValueIndex && i < keyValueIndex + keyValueStr.length) {
      pols.isKeyValueSymbol[i] = 1n;
      pols.keyValueSymbol[i] = BigInt(keyValueStr.charCodeAt(i - keyValueIndex));
    } else {
      pols.isKeyValueSymbol[i] = 0n;
      pols.keyValueSymbol[i] = 0n;
    }
  }
}
