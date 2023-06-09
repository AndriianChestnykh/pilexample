const assert = require("assert");
const path = require("path");
const { FGL, starkSetup, starkGen, starkVerify } = require("pil-stark");
const { newConstantPolsArray, newCommitPolsArray, compile, verifyPil } = require("pilcom");

const smJsonParse = require("../src/json_parse.js");

describe("test json parse sm", async function () {
    let constPols;
    let cmPols;
    let pil;

    this.timeout(10000000);

    it("It should create the pols main", async () => {

        pil = await compile(FGL, path.join(__dirname, "..", "src", "json_parse.pil"));

        constPols =  newConstantPolsArray(pil);
        cmPols = newCommitPolsArray(pil);

        const jsonObject = {
          age: 35,
          country: "Italy",
        }
        const jsonStr = JSON.stringify(jsonObject);

        const result = await smJsonParse.execute(cmPols.Jsonparse, jsonStr, "country", "Italy");
        console.log("Result: " + result);

        await verifyPil(FGL, pil, cmPols , constPols);
    });

    it("It should generate and verify the stark", async () => {
        const starkStruct = {
            nBits: 10,
            nBitsExt: 14,
            nQueries: 32,
            verificationHashType : "GL",
            steps: [
                {nBits: 14},
                {nBits: 9},
                {nBits: 4}
            ]
        };

        const setup = await starkSetup(constPols, pil, starkStruct);
        const resP = await starkGen(cmPols, constPols, setup.constTree, setup.starkInfo);

        const resV = await starkVerify(resP.proof, resP.publics, setup.constRoot, setup.starkInfo);
        assert(resV==true);
  });
});
