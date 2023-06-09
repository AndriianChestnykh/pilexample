module.exports.buildConstants = async function (pols) {
  const N = pols.ISLAST.length;

  for ( let i=0; i<N; i++) {
    pols.ISLAST[i] = (i === N-1) ? 1n : 0n;
  }
}

module.exports.execute = async function (pols, jsonStr) {
  const N = pols.json.length;

  if (jsonStr.length > N) {
    throw new Error("json too long");
  }

  for (let i = 0; i < N; i++) {
    pols.json[i] = i < jsonStr.length ? BigInt(jsonStr.charCodeAt(i)) : 0n;
    pols.isQuote[i] = i < jsonStr.length && jsonStr.charCodeAt(i) === 34 ? 1n : 0n;
    pols.quoteCounter[i] = i === 0 ? pols.isQuote[i] : pols.quoteCounter[i-1] + pols.isQuote[i];

    if (i === 0) {
      pols.isInsideQuotesDirty[i] = pols.isQuote[i] === 1n ? 1n : 0n;
      pols.firstInQuotes[i] = 0n;
      pols.isInsideQuotes[i] = 0n;
    } else if (pols.isQuote[i] === 1n && pols.isInsideQuotesDirty[i-1] === 0n) {
      pols.isInsideQuotesDirty[i] = 1n;
      pols.firstInQuotes[i] = 1n;
      pols.isInsideQuotes[i] = 0n;
    } else if (pols.isQuote[i] === 1n && pols.isInsideQuotesDirty[i-1] === 1n) {
      pols.isInsideQuotesDirty[i] = 0n;
      pols.firstInQuotes[i] = 0n;
      pols.isInsideQuotes[i] = 0n;
    } else {
      pols.isInsideQuotesDirty[i] = pols.isInsideQuotesDirty[i-1];
      pols.firstInQuotes[i] = 0n;
      pols.isInsideQuotes[i] = pols.isInsideQuotesDirty[i-1];
    }
  }

  // sum all values in the pols.insideQuotes array
  let sum = pols.isInsideQuotes.reduce((acc, curr) => acc + curr, 0n);
  console.log("sum: " + sum);

  sum = pols.isInsideQuotesDirty.reduce((acc, curr) => acc + curr, 0n);
  console.log("sum dirty : " + sum);
}
