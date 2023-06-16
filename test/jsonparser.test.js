const assert = require("assert");
const path = require("path");
const { FGL, starkSetup, starkGen, starkVerify } = require("pil-stark");
const { newConstantPolsArray, newCommitPolsArray, compile, verifyPil } = require("pilcom");

const smJsonParser = require("../src/jsonparser.js");
const smGlobal = require("../src/global.js");


const obj = {
    country: "Italy",
    name: "John",
    surname: "Doe",
    age: "30",
}

describe("test jsonparser sm", async function () {
    let constPols;
    let cmPols;
    let pil;

    this.timeout(10000000);

    it("It should create the pols main", async () => {
        pil = await compile(FGL, path.join(__dirname, "..", "src", "jsonparser.pil"));

        constPols =  newConstantPolsArray(pil);
        smJsonParser.buildConstants(constPols.Jsonparser);
        smGlobal.buildConstants(constPols.Global);

        cmPols = newCommitPolsArray(pil);
        smJsonParser.execute(cmPols.Jsonparser, obj, "age", "30");

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

        console.log("resP.publics:", resP.publics.reduce((acc, curr) => {
            return acc + (parseInt(curr) === 0 ? " " : String.fromCharCode(parseInt(curr)));
        }, ""));
    });
});
