const { FGL } = require("pil-stark");
module.exports.buildConstants = function (pols) {
  const N = pols.ISLAST.length;

  for ( let i=0; i<N; i++) {
    pols.ISLAST[i] = (i === N-1) ? 1n : 0n;
    pols.COUNTER[i] = BigInt(i) + 1n;
  }
}

module.exports.execute = function (pols, obj, key, value) {
  const jsonStr = JSON.stringify(obj);

  const N = pols.json.length;

  if (jsonStr.length > N) {
    throw new Error("json too long");
  }

  // check key and value is in obj
  if (key !== undefined && value !== undefined) {
    if (obj[key] !== value) {
      throw new Error("key and value not in obj");
    }
  } else {
    throw new Error("key or value not defined");
  }

  fillArray(pols, "json", jsonStr, getCharCode);
  fillArray(pols, "isQuote", jsonStr, isQuote);
  fillArray(pols, "isColon", jsonStr, isColon);
  fillArray(pols, "isComma", jsonStr, isComma);

  fillKeyArea(pols);
  fillIsInsideQuotes(pols);
  fillIsFirstInsideQuotes(pols);
  fillKeyAndValueIndex(pols);
  fillKeyAndValueSymbolIndex(pols);

  fillKeyValueIndex(pols, obj, key, value);
}

function fillKeyValueIndex(pols, obj, key, value) {
  const N = pols.key.length;
  const index = Object.keys(obj).indexOf(key);

  for (let i = 0; i < N; i++) {
    pols.key[i] = i < key.length ? BigInt(key.charCodeAt(i)) : 0n;
    pols.value[i] = i < value.length ? BigInt(value.charCodeAt(i)) : 0n;
    pols.index[i] = BigInt(index);
    pols.isKey[i] = i < key.length ? 1n : 0n;
    pols.isValue[i] = i < value.length ? 1n : 0n;
  }
}

function fillArray(pols, arrName, jsonStr, callback) {
  const N = pols[arrName].length;

  for (let i = 0; i < N; i++) {
    pols[arrName][i] = i < jsonStr.length ? callback(jsonStr, i) : 0n;
  }
}

function fillKeyArea(pols) {
  const arrName = "isKeyArea";
  const N = pols[arrName].length;

  let isKeyArea = 1n;
  for (let i = 0; i < N; i++) {
    isKeyArea = pols.isColon[i] + pols.isComma[i] === 1n ? 1n - isKeyArea : isKeyArea;
    pols[arrName][i] = isKeyArea;
  }
}

function fillIsInsideQuotes(pols) {
  const arrName = "isInsideQuotes";
  const N = pols[arrName].length;

  let isInsideQuotes = 0n;
  for (let i = 0; i < N; i++) {
    isInsideQuotes = pols.isQuote[i] === 1n ? 1n - isInsideQuotes : isInsideQuotes;
    pols[arrName][i] = isInsideQuotes;
  }
}

function fillIsFirstInsideQuotes(pols) {
  const arrName = "isFirstInsideQuotes";
  const N = pols[arrName].length;

  let isFirstInsideQuotes = 0n;
  let prevIsInsideQuotes = pols.isInsideQuotes[N-1];
  for (let i = 0; i < N; i++) {
    isFirstInsideQuotes = pols.isInsideQuotes[i] === 1n && prevIsInsideQuotes === 0n ? 1n : 0n;
    prevIsInsideQuotes = pols.isInsideQuotes[i];
    pols[arrName][i] = isFirstInsideQuotes;
  }
}

function fillKeyAndValueIndex(pols) {
  const arrName = "keyValueIndex";
  const N = pols[arrName].length;

  let keyValueIndex = 0n;
  for (let i = 0; i < N; i++) {
    keyValueIndex = pols.isComma[i] === 1n ? FGL.add(keyValueIndex, 1n) : keyValueIndex;
    pols[arrName][i] = keyValueIndex;
  }
}

function fillKeyAndValueSymbolIndex(pols) {
  const arrName = "keyValueSymbolIndex";
  const N = pols[arrName].length;

  let keyValueSymbolIndex = 0n;
  let isInsideQuotes = 0n;
  for (let i = 0; i < N; i++) {
    keyValueSymbolIndex = pols.isInsideQuotes[i] === 1n ? FGL.add(keyValueSymbolIndex, isInsideQuotes) : 0n;
    isInsideQuotes = pols.isInsideQuotes[i];
    pols[arrName][i] = keyValueSymbolIndex;
  }
}

function getCharCode(jsonStr, index) {
  return BigInt(jsonStr.charCodeAt(index));
}

function isQuote(jsonStr, index) {
  return jsonStr.charCodeAt(index) === 34 ? 1n : 0n;
}

function isColon(jsonStr, index) {
  return jsonStr.charCodeAt(index) === 58 ? 1n : 0n;
}

function isComma(jsonStr, index) {
  return jsonStr.charCodeAt(index) === 44 ? 1n : 0n;
}
