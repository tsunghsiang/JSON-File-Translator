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
        const jsonDara = fs.readFileSync(filePath);
        const jsonArr = JSON.parse(String(jsonDara));
        return jsonArr;
        //console.log(jsonArr);
    } catch(err) {
        console.log(`[ReadJsonFile][ERROR] Read FIle Failure: ${err}`);
        return;
    }
}

function DispJsonArr(jsonData) {
    if(!jsonData) {
        console.error(`[DispJsonArr][ERROR] Undefined Input`);
        process.exit();
    }

    for(var key in jsonData)
        console.log(`key: ${key}, value: ${jsonData[key]}`);
}

function TranslateTerms(fetchCmd, baseJsonArr, compJsonArr, url, language){
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
    // var lenght = Object.keys(baseJsonArr).length;
    for(var key in baseJsonArr){
        if(compJsonArr[key] !== undefined){
            outputArr[key] = compJsonArr[key];
        }else{
            var uri = `${url}client=gtx&dt=t&dj=1&ie=UTF-8&sl=en&tl=${language}&q=${baseJsonArr[key]}`;
            console.log(`URI: ${uri}`);
            try{
                fetchCmd(uri, { method: "GET",
                                headers: { "Content-Type": "application/json; charset=utf-8" },
                                redirect: "follow",
                                referrer: "no-referrer" })
                .then(rsp => rsp.json())
                .then(data => console.log(data.text()));
                break;
            }catch(err){
                console.error(`[TranslateTerms][ERROR] Translate Error: ${err}`);
            }
        }
    }

    return outputArr;
}

const fetch = require("node-fetch");
const fs = require("fs");

const TARGET_LANG = process.argv[2];
const BASE_FILE = `input/i18n/2fa/${process.argv[3]}`;
const COMP_FILE = `input/i18n/2fa/${TARGET_LANG}.json`;
const OUTPUT_FLIE = `output/i18n/2fa/${TARGET_LANG}.json`;
const URL = "http://translate.google.cn/translate_a/single?";

// Display Program Information
console.log(`Target Language: ${TARGET_LANG}`);
console.log(`Base File: ${BASE_FILE}`);
console.log(`Compared File: ${COMP_FILE}`);
console.log(`Output File: ${OUTPUT_FLIE}`);

var baseJsonArr = ReadJsonFile(fs, BASE_FILE);
var compJsonArr = ReadJsonFile(fs, COMP_FILE);
var outputArr = TranslateTerms(fetch, baseJsonArr, compJsonArr, URL, TARGET_LANG);
