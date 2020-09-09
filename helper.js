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
        const jsonData = fileHandler.readFileSync(filePath);
        const jsonArr = JSON.parse(String(jsonData));
        return jsonArr;
        //console.log(jsonArr);
    } catch(err) {
        console.log(`[ReadJsonFile][ERROR] Read File Failure: ${err}`);
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

function GetRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive 
  }

function TranslateKeys(fileHandler, fetchCmd, flatCmd, unflatCmd, baseJsonArr, compJsonArr, url, language, outputFile){
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
    var flattenedBaseJsonArr = flatCmd(baseJsonArr);
    var flattenedCompJsonArr = flatCmd(compJsonArr);

    for(var key in flattenedBaseJsonArr){
        if(flattenedCompJsonArr[key] !== undefined){
            outputArr[key] = flattenedCompJsonArr[key];
        }else{
            outputArr[key] = "";
            // console.log(`key: ${key}`);
            undefinedTerms.push({"idx": count, "key": key});
            count++;
        }
    }

    if(undefinedTerms.length == 0){
        outputArr = unflatCmd(outputArr, { object: true });
        console.log(outputArr);
        WriteJsonFile(fileHandler, outputFile, JSON.stringify(outputArr, null, 2));
        return;
    }

    // Translate the undefined terms here
    var idx = 0;
    var length = undefinedTerms.length;
    const regex = /\{{[^}}]+}\}/g;
    const spearator = String.fromCodePoint(44, 65292, 12289);
    (async function TranslatePromise(fetchCmd, url, srcLang, targetLang, term){

        var delay = GetRandomIntInclusive(5, 10) * 1000; //ms

        // String Processing Here: 
        // [1] split texts with specified regular expression
        var splits = flattenedBaseJsonArr[term.key].split(regex);
        
        // [2] Join texts to be translated with commas, '|'
        
        var joinedSplits = splits.map(elem => elem.replace(/\n/g, '<br>'))      // '`'
                                 .map(elem => elem.replace(' ', '%20'))         // ' '
                                 .join('%7e%7e');                               // '~~'
        // console.log(joinedSplits);

        // [3] Store tokens in an array, which is later append to the translated texts
        var tokens = [];
        var token;
        while((token = regex.exec(flattenedBaseJsonArr[term.key])) != null)
            tokens.push(token[0]);
  
        setTimeout(() => {
            var uri = `${url}client=gtx&dt=t&dj=1&ie=UTF-8&sl=en&tl=${language}&q=${joinedSplits}`;
            console.log(`initial uri: ${uri}`);

            fetchCmd(uri, { method: "GET",
                            headers: { "Content-Type": "application/json; charset=utf-8" },
                            redirect: "follow",
                            referrer: "no-referrer" })
            .then(rsp => {
                if(!rsp.ok){
                    outputArr = unflatCmd(outputArr, { object: true });
                    WriteJsonFile(fileHandler, outputFile, JSON.stringify(outputArr, null, 2));
                    throw 'fetch error';
                }
                else
                    return rsp.json();
            })
            .then(data => {
                // console.log(`initial trans: ${data.sentences[0].trans}`);
                
                var translatedTexts = data.sentences[0].trans.replace(/<br>/g, '\n').split('~~');
                var text = translatedTexts[0];
                // console.log(translatedTexts);
                for(var i = 0; i < tokens.length; i++)
                   text = text.concat(tokens[i]).concat(translatedTexts[i+1]? translatedTexts[i+1] : '');
                outputArr[term.key] = text;
                console.log(`translated text: ${text}`);
                
            }).catch(err => {
                console.error(`${err}`);
                process.exit();
            });

            // Halt asynchronous operation if whole undefined terms have been translated
            idx++;
            if(idx == length){
                clearTimeout();
                outputArr = unflatCmd(outputArr, { object: true });
                WriteJsonFile(fileHandler, outputFile, JSON.stringify(outputArr, null, 2));
                return;
            }
            else {
                TranslatePromise(fetchCmd, url, 'en', targetLang, undefinedTerms.find(elem => {
                    if(elem.idx == idx)
                        return elem;         
                }));
            }
        }, delay);
    })(fetchCmd, url, 'en', language, undefinedTerms.find(elem => { 
        if(elem.idx == idx)
            return elem; 
    }));
}

// Exporting variables and functions
export { ReadJsonFile, WriteJsonFile, DispJsonArr, GetRandomIntInclusive, TranslateKeys };