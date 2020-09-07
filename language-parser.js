// The script takes the responsibility of translating JSON files of terms from English to other language versions
// Now we are going to translate JSON files based on English version (en.json) of corresponding directories since
// it has been completely documented. Therefore the corresponding translated json files would be put into the 
// output directory.

// The translation rules as below:
// 1. Do not revise existing terms if identical keys exist in both English & another language version (Korean, Japanese, Simple Chinese, Traditional Chinese
//    ex: "greetings": "How are you?" (English)
//        "greetings": "你好嗎？" (Traditional Chinese)
// 2. Add new terms to another language json file if there are not correspondinng terms in English json file.
//    ex: "greetings": "How are you?" (English)
//        (Not exist) (Traditional Chinese) <- Add this term and translated text to the file
// 3. For terms containing special symbols  ex: {..} <..> =.+_)(*&^%$#@!|:"?><~"), keep them static as usual; 
//    translate other parts of the sentence
//    Ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
// 4. Free Translation Platform: https://www.itread01.com/content/1554462245.html

function ReadJsonFile(fileHandler, filePath) {
    if(!fileHandler){
        console.error(`[ReadJsonFile][ERROR] Undefined File Handler`);
        process.exit();
    }

    if(!filePath || filePath == ''){
        console.error(`[ReadJsonFile][ERROR] Undefined File Path or Empty String`);
        process.exit();
    }

    try {
        const jsonData = fs.readFileSync(filePath);
        const jsonArr = JSON.parse(String(jsonData));
        return jsonArr;
        //console.log(jsonArr);
    } catch(err) {
        console.log(`[ReadJsonFile][ERROR] Read FIle Failure: ${err}`);
        return;
    }
}

function WriteJsonFile(fileHandler, filePath, jsonData) {
    fileHandler.writeFile(filePath, jsonData, err => {
        if(err)
            console.error(`[WriteJsonFile][ERROR] ${err}`);
    });
}

function DispJsonArr(jsonData) {
    if(!jsonData) {
        console.error(`[DispJsonArr][ERROR] Undefined Input`);
        process.exit();
    }

    for(var key in jsonData)
        console.log(`key: ${key}, value: ${jsonData[key]}`);
}

function TranslateTerms(fileHandler, fetchCmd, baseJsonArr, compJsonArr, url, language, outputFile){
    if(!baseJsonArr){
        console.error(`[TranslateTerms][ERROR] Undefined baseJsonArr`);
        process.exit();       
    }

    if(!compJsonArr){
        console.error(`[TranslateTerms][ERROR] Undefined compJsonArr`);
        process.exit();       
    }

    if(!language){
        console.error(`[TranslateTerms][ERROR] Undefined language`);
        process.exit();       
    }

    var outputArr = {};
    var undefinedTerms = [];
    var count = 0;
    for(var key in baseJsonArr){
        if(compJsonArr[key] !== undefined){
            outputArr[key] = compJsonArr[key];
        }else{
            outputArr[key] = "";
            undefinedTerms.push({"idx": count, "key": key});
            count++;
        }
    }

    if(undefinedTerms.length == 0){
        WriteJsonFile(fileHandler, outputFile, JSON.stringify(outputArr, null, 2));
        return;
    }

    // Translate the undefined terms here
    var idx = 0;
    var length = undefinedTerms.length;
    (function TranslatePromise(fetchCmd, url, srcLang, targetLang, term){
        setTimeout(() => {
            // console.log(baseJsonArr[term.key]);
            var uri = `${url}client=gtx&dt=t&dj=1&ie=UTF-8&sl=en&tl=${language}&q=${baseJsonArr[term.key]}`;
            // console.log(uri);

            try{
                fetchCmd(uri, { method: "GET",
                                headers: { "Content-Type": "application/json; charset=utf-8" },
                                redirect: "follow",
                                referrer: "no-referrer" })
                .then(rsp => {
                    if(!rsp.ok)
                        throw 'fetch error';
                    else
                        rsp.json();
                })
                .then(data => { 
                    outputArr[term.key] = data.sentences[0].trans; 
                    console.log(outputArr[term.key]); 
                });
            }catch(err){}
  
            // Halt asynchronous operation if whole undefined terms have been translated
            idx++;
            if(idx == length){
                clearTimeout();
                WriteJsonFile(fileHandler, outputFile, JSON.stringify(outputArr, null, 2));
                return;
            }
            else {
                TranslatePromise(fetchCmd, url, 'en', targetLang, undefinedTerms.find(elem => {
                    if(elem.idx == idx)
                        return elem;         
                }));
            }
        }, 100);
    })(fetchCmd, url, 'en', language, undefinedTerms.find(elem => { 
        if(elem.idx == idx)
            return elem; 
    }));
}

const fetch = require("node-fetch");
const fs = require("fs");
const path = require('path');

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
TranslateTerms(fs, fetch, baseJsonArr, compJsonArr, URL, TARGET_LANG, OUTPUT_FLIE);