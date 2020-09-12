# Prelude
To support multi-language translation for business requirements, the tool. is developed to solve mass translation issues, especially for those who always suffers from massive language translation problem. First of all, the tool applies **free Google Translation API** without both payments and API key authentication. Secondly, it supports **multi-level fields parsing** in a JSON file, which is not restricted to the conventional **key-value** resolution. 

That is to say, regardless of formats of the JSON files, this tool is able to parse them; fold multi-level fields into a single key, which converges to the simplest **key-value** form for resolution. It would unfold the translated texts back to form of multi-level fields thereafter.

# Prerequisite
#### [1] Node JS Version
Usually version 6+ is prefered. Follow the **[link](https://phoenixnap.com/kb/update-node-js-version)** to upgrade the version.
```sh
$ node -v
```

#### [2] Installation
To run the application, some modules is required for I/O, http requests, module loading and field folding as below. Administration priviledge might be needed for package installtion process.

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

To resolve JSON files in forms of multi-level keys, we apples 3rd-party package **[flat](https://github.com/hughsk/flat)** to realize the folding technique, which simplifies parsing complexity.
```sh
$ sudo npm install --save flat
```

# Feature
#### [1] Free Google Translation API
To support mass translation without both payments and authentication, we use a free online Google API as below.

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
	'A': {
		'B': {
			'C': {
				'D': 'final'
			}
		}
	}
}
```
If you are goiing to translate the JSON data, you need to know all the keys in order to access the final value. However, it is nearly possible since massive JSON file would contain tens of thousands of fields, not to mention the nested structure. The tool would process files by **folding** the JSON data as below, which converges to a single key-value pair and thus mitigate the pairing complexity.
```json
{
	'A.B.C.D': 'final'
}
```
After translation work is done, the application would **unfold** the result into its original form with translated texts. For example, if the sample above takes **en** as the source language and **zh-TW** as the target language. The JSON form after translation and unfolding would be
```json
{
	'A': {
		'B': {
			'C': {
				'D': '最後'
			}
		}
	}
}
```

#### [3] Token { token } Recognition
In our system, we use pattern **{ token }** to indicates words to be replaced with other symbols when running on system. So this tool would reserve the words fitting the pattern; combine them with translated texts. 

For example, we choose Japanese as our target language.
```json
"confirm_delete_airdrop_addresses": "Confirm to you want to delete \"{address}\"?"
```
would be translated to
```json
"confirm_delete_airdrop_addresses": "「{address}」を削除してもよろしいですか？"
```

# Usage
In CYBAVO, we update our system translation 2 times every month by adding new items. Defaultly, **The english version is applied as a base** to be compared with other language version and to be translated into corresponding specified language.

```sh
$ node -r esm -r fs -r node-fetch -r flat language-parser.js {target language} {input base file} {input comparison file}
```
**{target language}**: the language version you would like to translate to.

**{input base file}**: The base file to be translated, usually english version is specified.

**{input comparison file}**: Different language files might differ in some fields. The argument should be provided for the tool to recognize whether there are any missed fields needed to be translated. For example, file en.json contains field of key `name` but ja.json does not. So the tool would translate the corresponding fields into Japanese.

# Notice
Although most translation issue is resolved in the tool, inclusive of multi-level parsing and translation API, there are still some issues users need to be aware of since it might affect your final execution result.
#### Network Problem
As mentioned, the tool send HTTP requests to remote Google server for translation. It might interrupt your requests if you send too many requests in a short period of time. Therefore in the source code each translation request would delay a random duration between 5 and 10 seconds to avoid being mistaken as malicious attacks.
```javascript
var delay = GetRandomIntInclusive(5, 10) * 1000; //ms
```