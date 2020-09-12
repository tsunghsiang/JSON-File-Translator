/**
 * Command: node - r esm - r fs - r node - fetch - r flat language - parser.js { target language } { input base file } { input comparison file }
 */

// Load external files
import { ReadJsonFile, WriteJsonFile, DispJsonArr, GetRandomIntInclusive, TranslateKeys } from './helper.js';

const fetch = require("node-fetch");
const fs = require("fs");
const flatten = require('flat');
const unflatten = require('flat').unflatten;

const TARGET_LANG = process.argv[2];
const INPUT_FILE = `${process.argv[3]}`;
const OUTPUT_FLIE = `${process.argv[4]}`;
const REGEXP = `${process.argv[5]}`;
const URL = "http://translate.google.cn/translate_a/single?";

// Display Program Information
console.log(`Target Language: ${TARGET_LANG}`);
console.log(`Input File: ${INPUT_FILE}`);
console.log(`Output File: ${OUTPUT_FLIE}`);
console.log(REGEXP ? `Token Pattern: ${REGEXP}` : '');

var baseJsonArr = ReadJsonFile(fs, INPUT_FILE);
TranslateKeys(fs, fetch, flatten, unflatten, baseJsonArr, URL, TARGET_LANG, OUTPUT_FLIE, REGEXP);