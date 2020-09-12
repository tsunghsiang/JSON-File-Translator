/**
 * Read a JSON file from a specified file path
 * @param {*} fileHandler - I/O manipulator
 * @param {string} filePath - input file path 
 */
function ReadJsonFile(fileHandler, filePath) {
    if (!fileHandler) {
        console.error(`[ReadJsonFile][ERROR] Undefined File Handler`);
        process.exit();
    }

    if (!filePath || filePath == '') {
        console.error(`[ReadJsonFile][ERROR] Undefined File Path or Empty String`);
        process.exit();
    }

    try {
        const jsonData = fileHandler.readFileSync(filePath);
        const jsonArr = JSON.parse(String(jsonData));
        return jsonArr;
        //console.log(jsonArr);
    } catch (err) {
        console.log(`[ReadJsonFile][ERROR] Read File Failure: ${err}`);
        return;
    }
}

/**
 * Write a JSON structure to specified file path
 * @param {module} fileHandler - I/O manipulator 
 * @param {string} filePath - output file path
 * @param {JSON} jsonData - JSON data structure 
 */
function WriteJsonFile(fileHandler, filePath, jsonData) {
    fileHandler.writeFile(filePath, jsonData, err => {
        if (err)
            console.error(`[WriteJsonFile][ERROR] ${err}`);
    });
}

/**
 * Print contents of a JSON structure
 * @param {JSON} jsonData - parsed JSON data
 */
function DispJsonArr(jsonData) {
    if (!jsonData) {
        console.error(`[DispJsonArr][ERROR] Undefined Input`);
        process.exit();
    }

    for (var key in jsonData)
        console.log(`key: ${key}, value: ${jsonData[key]}`);
}

/**
 * Generate a random integer value between min & max
 * @param {Number} min - minimum integer value
 * @param {Number} max - maximum integer value
 */
function GetRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive 
}

/**
 * Transform characters of halfwidth to characteres of fullwidth
 * @param {string} str - halfwidth string
 */
function ToDBC(str) {
    var result = "";
    var len = str.length;
    for (var i = 0; i < len; i++) {
        var cCode = str.charCodeAt(i);
        // difference between fullwidth and halfwidth (except space)：65248(decimal)
        cCode = (cCode >= 0x0021 && cCode <= 0x007E) ? (cCode + 65248) : cCode;
        // handle space
        cCode = (cCode == 0x0020) ? 0x03000 : cCode;
        result = result.concat(String.fromCharCode(cCode));
    }
    return result;
}

/**
 *  Transform characters of fullwidth to characteres of halfwidth
 * @param {string} str - fullwidth string
 */
function ToSBC(str) {
    var result = "";
    var len = str.length;
    for (var i = 0; i < len; i++) {
        var cCode = str.charCodeAt(i);
        // difference between fullwidth and halfwidth (except space)：65248(decimal)
        cCode = (cCode >= 0xFF01 && cCode <= 0xFF5E) ? (cCode - 65248) : cCode;
        // handle space
        cCode = (cCode == 0x03000) ? 0x0020 : cCode;
        result = result.concat(String.fromCharCode(cCode));
    }
    return result;
}

/**
 * Translate key-value pair from its source language to user-specified language
 * @param {module} fileHandler - I/O manipulator 
 * @param {module} fetchCmd - HTTP handler
 * @param {module} flatCmd - JSON folding handler
 * @param {module} unflatCmd - JSON unfolding handler
 * @param {JSON} baseJsonArr - Input JSON array
 * @param {string} url - API url
 * @param {string} language - target language
 * @param {string} outputFile - output file path
 * @param {string} expression - regular expression
 */
function TranslateKeys(fileHandler, fetchCmd, flatCmd, unflatCmd, baseJsonArr, url, language, outputFile, expression) {
    if (!fileHandler) {
        console.error(`[TranslateTerms][ERROR] Undefined fileHandler`);
        process.exit();
    }

    if (!fetchCmd) {
        console.error(`[TranslateTerms][ERROR] Undefined fetchCmd`);
        process.exit();
    }

    if (!flatCmd) {
        console.error(`[TranslateTerms][ERROR] Undefined flatCmd`);
        process.exit();
    }

    if (!unflatCmd) {
        console.error(`[TranslateTerms][ERROR] Undefined unflatCmd`);
        process.exit();
    }

    if (!baseJsonArr) {
        console.error(`[TranslateTerms][ERROR] Undefined baseJsonArr`);
        process.exit();
    }

    if (!url) {
        console.error(`[TranslateTerms][ERROR] Undefined url`);
        process.exit();
    }

    if (!language) {
        console.error(`[TranslateTerms][ERROR] Undefined language`);
        process.exit();
    }

    if (!outputFile) {
        console.error(`[TranslateTerms][ERROR] Undefined outputFile`);
        process.exit();
    }

    if (!expression) {
        console.error(`[TranslateTerms][ERROR] Undefined expression`);
        process.exit();
    }

    /**
     * @var outputArr - translated texts stored as JSON
     * @var flattenedBaseJsonArr - folded input JSON
     * @var idx - index of JSON structure
     * @var keys - collection of keys of flatten JSON
     * @constant regex - token pattern
     */
    var outputArr = {};
    var flattenedBaseJsonArr = flatCmd(baseJsonArr);
    var idx = 0;
    var keys = Object.keys(flattenedBaseJsonArr);
    const regex = expression ? RegExp(expression, 'g') : null; // /\{.*?\}/g;

    /**
     * Iterate all terms of folded JSON; translate them into specified target language
     * @param {module} fetchCmd - HTTP handler
     * @param {string} url - API url
     * @param {string} srcLang - source language
     * @param {string} targetLang - target language
     * @param {string} term - text to be translated
     */
    (async function TranslatePromise(fetchCmd, url, srcLang, targetLang, term) {

        /**
         * @var {Number} delay - a random period between 5 & 10 seconds to avoid being mistaken as malicious attack
         * @var {Array} splits - array of texts split by pattern
         * @var {string} joinedSplits - text that joins split texts together after processing
         * @var {Array} tokens - collection of tokens that fit the pattern
         * @var {string} token - matched token
         */
        var delay = GetRandomIntInclusive(5, 10) * 1000; //ms

        // String Processing Here:

        // [1] split texts with specified regular expression
        var splits = term.split(regex);
        // [2] Join texts to be translated with '~~'
        var joinedSplits = splits.map(elem => elem.replace(/\n/g, '<br>'))  // '\n'
            .map(elem => elem.replace(' ', '%20'))     // ' '
            .join('%7e%7e');                           // '~~'
        // console.log(joinedSplits);

        // [3] Store tokens in an array, which is later append to the translated texts
        var tokens = [];
        var token;
        while ((token = regex.exec(term)) != null)
            tokens.push(token[0]);

        setTimeout(() => {
            /**
             * @var {string} uri - HTTP request uri
             */
            var uri = `${url}client=gtx&dt=t&dj=1&ie=UTF-8&sl=${srcLang}&tl=${targetLang}&q=${joinedSplits}`;
            console.log(`initial uri: ${uri}`);

            fetchCmd(uri, {
                method: "GET",
                headers: { "Content-Type": "application/json; charset=utf-8" },
                redirect: "follow",
                referrer: "no-referrer"
            }).then(rsp => {
                if (!rsp.ok) {
                    outputArr = unflatCmd(outputArr, { object: true });
                    WriteJsonFile(fileHandler, outputFile, JSON.stringify(outputArr, null, 2));
                    throw 'fetch error';
                }
                else
                    return rsp.json();
            }).then(data => {
                /**
                 * @var {string} translatedTexts - translated sub-texts separated by '~~'
                 * @var {string} text - final merged, translated text
                 */
                var translatedTexts = data.sentences[0].trans.replace(/<br>/g, '\n').split('~~');
                var text = translatedTexts[0];

                for (var i = 0; i < tokens.length; i++)
                    text = text.concat(tokens[i]).concat(translatedTexts[i + 1] ? translatedTexts[i + 1] : '');
                outputArr[keys[idx]] = ToSBC(text);
                //console.log(`translated text: ${text}`);

                // Halt asynchronous operation if whole terms have been translated
                idx++;
                if (idx == keys.length) {
                    outputArr = unflatCmd(outputArr, { object: true });
                    WriteJsonFile(fileHandler, outputFile, JSON.stringify(outputArr, null, 2));
                    return;
                }
                else {
                    TranslatePromise(fetchCmd, url, 'en', targetLang, flattenedBaseJsonArr[keys[idx]]);
                }
            }).catch(err => {
                console.error(`${err}`);
                process.exit();
            });
        }, delay);
    })(fetchCmd, url, 'en', language, flattenedBaseJsonArr[keys[idx]]);
}

// Exporting variables and functions
export { ReadJsonFile, WriteJsonFile, DispJsonArr, GetRandomIntInclusive, TranslateKeys };