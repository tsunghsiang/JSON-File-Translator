// Notice: 
// 1. Upgrade node.js version >=  (ref: https://phoenixnap.com/kb/update-node-js-version)
// 2. To run the application, remember to install libraries 'fs', 'node-fetch', 'esm' and 'flat'
//      npm install fs
//      npm install fetch (ref: https://www.npmjs.com/package/fetch)
//      npm install esm (ref: https://github.com/standard-things/esm)
//      npm install flat (ref: https://github.com/hughsk/flat)
// 3. To avoid being mistaken as DDoS attacks by Google server, fetch API delay is configured to be 
//    2000 ms by default. Smaller value might lead to unhandled exceptions

// Command: node -r esm -r fs -r node-fetch -r flat language-parser.js {target language} {input base file} {input comparison file}

// Load external files
import { ReadJsonFile, WriteJsonFile, DispJsonArr, GetRandomIntInclusive, TranslateKeys } from './helper.js';

const fetch = require("node-fetch");
const fs = require("fs");
const flatten = require('flat');
const unflatten = require('flat').unflatten;

const TARGET_LANG = process.argv[2];
const BASE_FILE = `${process.argv[3]}`;
const COMP_FILE = `${process.argv[4]}`;
const OUTPUT_FLIE = COMP_FILE.replace('input', 'output');
const URL = "http://translate.google.cn/translate_a/single?";

// Display Program Information
console.log(`Target Language: ${TARGET_LANG}`);
console.log(`Base File: ${BASE_FILE}`);
console.log(`Compared File: ${COMP_FILE}`);
console.log(`Output File: ${OUTPUT_FLIE}`);

var baseJsonArr = ReadJsonFile(fs, BASE_FILE);
var compJsonArr = ReadJsonFile(fs, COMP_FILE);
TranslateKeys(fs, fetch, flatten, unflatten, baseJsonArr, compJsonArr, URL, TARGET_LANG, OUTPUT_FLIE);