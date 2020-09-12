# Introduction
To support multi-language translation for business requirements, the tool, **JSON File Translator**, is developed to solve mass translation issues, especially for those who always suffers from massive language translation problem. The tool contains features as below:

* **Free Google Translation API**
It provides users a more convenient way to apply the service without extra fees and authentication.

* **Multi-Level Fields Folding/Unfolding**
Unlike conventional **1 on 1** key-value mapping, it gives users the flexibility to define **1 on (\*) on (\*) ...** JSON format for translation without redundant parsing on their own. The translated result will be un-folded back to original form.

* **String Pattern Reservation**
For some business applications, developers get used to applying some string pattern for recognition or replacement when applications run. The tool provides the option for developers to choose if required.

# Prerequisite
#### [1] Node JS Version
Usually version 6+ is prefered. Follow the **[link](https://phoenixnap.com/kb/update-node-js-version)** to upgrade the version.
```sh
$ node -v
```

#### [2] Installation
To run the application, some modules is required for I/O, http requests, module loading and fields folding as below. Administration priviledge might be needed for package installtion process.

The tool is going to manipulate file I/O. Therefore module **[fs](https://www.npmjs.com/package/fs)** is needed.
```sh
$ sudo npm install --save fs
```

Differently from traditional **[XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)**, **[fetch](https://www.npmjs.com/package/fetch)** module provides us a more efficient way of sending HTTP requests to remote server; handle asynchronous operations in a sequential way. Learn it more from the **[link](https://developers.google.com/web/updates/2015/03/introduction-to-fetch)**.
```sh
$ sudo npm install --save fetch
```

To load external scripts, **[esm](https://github.com/standard-things/esm)** supports EMCAScript module loading. The fast, production ready, zero dependency loader is all you need to support ECMAScript modules in Node 6+.
```sh
$ sudo npm install --save esm
```

To resolve JSON files in forms of multi-level keys, we apply 3rd-party package **[flat](https://github.com/hughsk/flat)** to realize the folding technique, which simplifies parsing complexity.
```sh
$ sudo npm install --save flat
```

# Feature
#### [1] Free Google Translation API
To support mass translation without both payments and API authentication, we use a free online Google API as below.

Method: **GET**
Url: http://translate.google.cn/translate_a/single

| Parameters | client  | dt | dj | ie | sl | tl | q |
|:-----------------|:-------------:|:---------------:|:---------------:|:---------------:|:---------------:|:---------------:|:---------------:|
| Description | gtx | t | 1 | UTF-8 | souce language | target language | texts, separated by commas |


For given GET parameters, fields **client**, **dt**, **dj**, **ie** are default. Users only need to adjust [source/target language](https://cloud.google.com/translate/docs/languages) and texts. Moreover, texts are separated by commas(,).

#### [2] Multi-Level Fields Folding/Unfolding
For some developers, they might define JSON files to represent use scenarios based on web architectures, page flows or user behavior. The JSON structure, nontheless, might get developers into trouble when it comes to translating fields because multi-level structure would lead to considerable complexity if they attempt to parse files on their own, no matter in programming or processing.

Take the snippet below as an instance to indicate the power of folding and unfolding.
```json
{
	"A": {
		"B": {
			"C": {
				"D": "final"
			}
		}
	}
}
```
If you are goiing to translate the JSON data, you need to know all the keys in order to access the final value. However, it is nearly possible since massive JSON file would contain tens of thousands of fields, not to mention the nested structure. The tool would process files by **folding** the JSON data as below, which converges to a single key-value pair and thus mitigate the pairing complexity.
```json
{
	"A.B.C.D": "final"
}
```
After translation task is done, the application would **unfold** the result into its original form with translated texts. For example, if the sample above takes **en** as the source language and **zh-TW** as the target language. The JSON form after translation and unfolding would be
```json
{
	"A": {
		"B": {
			"C": {
				"D": "最後"
			}
		}
	}
}
```

#### [3] String Token Reservation
As many online applications, they usually read a configuration file to replace vocabulary or some pattern with corresponding symbols. Therefore developers prefer to keep them as usual instead of change them when translation task begins. The tool would reserve the words fitting the pattern; combine them with translated texts. 

For example, we choose Japanese as our target language. Besides, we define a regular expression **/\\{.*?\\}/g** to recognize any strings that match the pattern and keep them static.
```json
"alert": "Confirm to you want to delete \"{address}\"?"
```
would be translated to
```json
"alert": "「{address}」を削除してもよろしいですか？"
```

# Usage
```sh
$ node -r esm -r fs -r node-fetch -r flat language-parser.js {target language} {input JSON file path} {output JSON file path} {pattern}
```
**{target language}**: the [language version](https://cloud.google.com/translate/docs/languages) you would like to translate to.

**{input JSON file path}**: The input JSON file to be translated. Remember that the format should abide by JSON standard, otherwise the program will crash.
Ex: **input/test.json**

**{output JSON file path}**: The output file path of translated JSON file.
Ex: **output/ja.json**

**{pattern}**: (optional) Developers could specify a defined regular expression to reserve texts that fit the pattern for further process in the future. Ex: **\\{.*?\\}**

To know how to define a regular expression, please refer to the [link](https://regex101.com/).

#Sample
To experience the power of the tool, I strongly suggest you type the command given yourself. There are test [input file](input/test.json) and [output file](output/ja.json) correspondingly. 

```json
{
    "greetings": "hello there!",
    "self-introduction": "My name is {name}",
    "security": {
        "birthday": "When is your birthday date?",
        "login": "id: {id}, password: {password}"
    },
    "department": {
        "software": {
            "count": "Total: {count} people on SW",
            "state": {
                "on-board": "0",
                "on-vacation": "1",
                "quit": "2",
                "laid-off": "3"
            }
        },
        "hardware:": {
            "count": "Total: {count} people on HW",
            "state": {
                "on-board": "0",
                "on-vacation": "1",
                "quit": "2",
                "laid-off": "3"
            }
        },
        "design": {
            "count": "We have {amount} logos",
            "state": {
                "on-board": "0",
                "on-vacation": "1",
                "quit": "2",
                "laid-off": "3"
            }
        }
    }
}
```
```json
{
  "greetings": "こんにちは!",
  "self-introduction": "私の名前は{name}です",
  "security": {
    "birthday": "あなたの誕生日はいつですか?",
    "login": "ID:{id}、パスワード:{password}"
  },
  "department": {
    "software": {
      "count": "合計:SWの{count}人",
      "state": {
        "on-board": "0",
        "on-vacation": "1",
        "quit": "2",
        "laid-off": "3"
      }
    },
    "hardware:": {
      "count": "合計:HWの{count}人",
      "state": {
        "on-board": "0",
        "on-vacation": "1",
        "quit": "2",
        "laid-off": "3"
      }
    },
    "design": {
      "count": "{amount}ロゴがあります",
      "state": {
        "on-board": "0",
        "on-vacation": "1",
        "quit": "2",
        "laid-off": "3"
      }
    }
  }
}
```
You can specify any [languages](https://cloud.google.com/translate/docs/languages) for translation.

# Notice
Although most translation issue is resolved in the tool, inclusive of multi-level parsing, translation API and pattern recognition, there are still some issues users need to be aware of since it might affect your final execution result.
#### Network Problem
As mentioned, the tool send HTTP requests to remote Google server for translation. It might interrupt your requests if you send too many requests in a short period of time. Therefore in the source code each translation request would delay a random duration between 5 and 10 seconds to avoid being mistaken as malicious attacks.
```javascript
var delay = GetRandomIntInclusive(5, 10) * 1000; //ms
```