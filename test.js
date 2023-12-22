import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const countPayload = async () => {
  return new Promise((resolve, reject) => {
    fs.readFile('./src/crawlers/naver_stores/output/네이버스토어패션타운-designer.json', 'utf8', function readFileCallback (err, data) {
      if (err) {
        reject(err);
      } else {
        let file_object = JSON.parse(data);
        console.dir(file_object);
        console.log(file_object['payload'].length);
      }
    });
  });
}

const countPayloadA = async () => {
  return new Promise((resolve, reject) => {
    fs.readFile('./test.json', 'utf8', function readFileCallback (err, data) {
      if (err) {
        reject(err);
      } else {
        let file_object = JSON.parse(data);
        console.dir(file_object);
        console.log(file_object.length);
      }
    });
  });
}

const fetchData = async () => {
  try {
    const response = await fetch("https://shopping.naver.com/window/api/graphql?operationName=getChannelSearchWordByIds&variables=%7B%22ids%22%3A%5B%22100000448%22%2C%22100000657%22%2C%22100000825%22%2C%22100001172%22%2C%22100001203%22%2C%22100001248%22%2C%22100001275%22%2C%22100001407%22%2C%22100001473%22%2C%22100001738%22%2C%22100001867%22%2C%22100002869%22%2C%22100003239%22%2C%22100004598%22%2C%22100004941%22%2C%22100005317%22%2C%22100006092%22%2C%22100006128%22%2C%22100007505%22%2C%22100007922%22%2C%22100008164%22%2C%22100008405%22%2C%22100008452%22%2C%22100008633%22%2C%22100008742%22%2C%22100008817%22%2C%22100008870%22%2C%22100008882%22%2C%22100008957%22%2C%22100009078%22%2C%22100009464%22%2C%22100009506%22%2C%22100009815%22%2C%22100011230%22%2C%22100011257%22%2C%22100011460%22%2C%22100012110%22%2C%22100012450%22%2C%22100013403%22%2C%22100013410%22%2C%22100013780%22%2C%22100014498%22%2C%22100014833%22%2C%22100014945%22%2C%22100015122%22%2C%22100015482%22%2C%22100015798%22%2C%22100016194%22%2C%22100016281%22%2C%22100016635%22%2C%22100016719%22%2C%22100016882%22%2C%22100016999%22%2C%22100017145%22%2C%22100017855%22%2C%22100019355%22%2C%22100019480%22%2C%22100019491%22%2C%22100019514%22%2C%22100019593%22%2C%22100020767%22%2C%22100021254%22%2C%22100022603%22%2C%22100022870%22%2C%22100022881%22%2C%22100022886%22%2C%22100023349%22%2C%22100023397%22%2C%22100024268%22%2C%22100024574%22%2C%22100024953%22%2C%22100025287%22%2C%22100025353%22%2C%22100025589%22%2C%22100025725%22%2C%22100026264%22%2C%22100027047%22%2C%22100027182%22%2C%22100027256%22%2C%22100028072%22%2C%22100028332%22%2C%22100028579%22%2C%22100028994%22%2C%22100029604%22%2C%22100030461%22%2C%22100030944%22%2C%22100031298%22%2C%22100031872%22%2C%22100032232%22%2C%22100032263%22%2C%22100032264%22%2C%22100032353%22%2C%22100032375%22%2C%22100032385%22%2C%22100032420%22%2C%22100032611%22%2C%22100032678%22%2C%22100033142%22%2C%22100033657%22%2C%22100033972%22%5D%2C%22params%22%3A%7B%22subVerticalType%22%3A%22STYLE%22%7D%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%22e00ce20a33c3d4c797e3167b3141a6f083730cb0b68545776e60e7ba7c5b47f7%22%7D%7D", {
      "headers": {
        "accept": "*/*",
        "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
        "content-type": "application/json",
        "sec-ch-ua": "\"Chromium\";v=\"118\", \"Google Chrome\";v=\"118\", \"Not=A?Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "ssr": "false",
        "cookie": "NNB=UESJ7KJAVRAWK; STR_RP=2; nid_inf=-1531558894; NID_AUT=6ZIAZVTG3FQtW0kbfYINFo8W/1pkXSLmfoMBhO+6U//k9k28sgou27xmlC9P7TSH; NID_SES=AAABnLq7P87sdqYyhE8ij9IveC9JsJcluPUYYTuoURoM7u2JB++3lgKN35L63zoAJyCXImfe1o+CasD1M+AHZnDdTNzyeDGzcFb7J3JiDzZ7CL/HcowyW95kR/M43sa+KIJL/DVXy6shbPVfvPpij+Kb0HmQg/b2pos4gQKbCgMzJTxBFDhEZRJSRuCwRzH4W04MFJ0fHNInmTx7B/sguxi0Mvgkp28qmU3GQ1Tcx84MIOKur3irHZOWiwAfdKPsGBTUKxN9/1qHzn11VGZSNIWtXNj9BKs3EbcSKJCOaeCaGhDujKZTttFdPeLy6v2TROurPRvQ/X+8y9ZFiFmBWvGjDh+Pd7UBDjSXmSg6OkvKi+4zfvW+TC6r9nEPaMf1Ny56qBgxMEuWl6RXEpJQ0UYIHaEzJF5RCZL0imLWsikMm5OUhah02jSPWITRB5LDa2JlzldcBuJnc0HG9Ums22oORnKAv0HPbrSXCs99VQiRGOtsRUTX3HU3VXB6kxAhHXkVOj0BmalVRFvkBOF+/u/cjFW1h1pfcz7JWn2tHraK1hjm; NID_JKL=NErVG7oPJJqiuL0sdJU/1bSS92CJfiE1uJwx0cHwL2c=; wcs_bt=sc_1b6d235f1ff77_ahu1l:1698819023|sc_2757da496f392_2bv:1698817943|sc_a5730ae577e7_4uvpz:1698817923|sc_186358573077648707_ijl:1698817789",
        "Referer": "https://shopping.naver.com/window/style/category?switchTab=PRODUCT",
        "Referrer-Policy": "unsafe-url"
      },
      "body": null,
      "method": "GET"
    });

    let json_data = await response.json();
    console.log(json_data);
  } catch (e) {
    console.log(e);
  }
}

function hasKoreanCharacters (text) {
  // const korean_type_a_regex = /[\u3131-\uD79D]/g; // Range for Korean characters (전체? 한자도 포함되서 업데이트 필요했음)
  const korean_regex = /([\u3131-\u318F]|[\u1100-\u11FF]|[\uAC00-\uD7A3])/g;
  return korean_regex.test(text);
}

// hasKoreanCharacters('고');

function getDecodedURI () {
  let encoded_url = 'https://shopping.naver.com/window/api/graphql?operationName=getChannelSearchWordByIds&variables=%7B%22ids%22%3A%5B%22100000448%22%2C%22100000657%22%2C%22100000825%22%2C%22100001172%22%2C%22100001203%22%2C%22100001248%22%2C%22100001275%22%2C%22100001407%22%2C%22100001473%22%2C%22100001738%22%2C%22100001867%22%2C%22100002869%22%2C%22100003239%22%2C%22100004598%22%2C%22100004941%22%2C%22100005317%22%2C%22100006092%22%2C%22100006128%22%2C%22100007505%22%2C%22100007922%22%2C%22100008164%22%2C%22100008405%22%2C%22100008452%22%2C%22100008633%22%2C%22100008742%22%2C%22100008817%22%2C%22100008870%22%2C%22100008882%22%2C%22100008957%22%2C%22100009078%22%2C%22100009464%22%2C%22100009506%22%2C%22100009815%22%2C%22100011230%22%2C%22100011257%22%2C%22100011460%22%2C%22100012110%22%2C%22100012450%22%2C%22100013403%22%2C%22100013410%22%2C%22100013780%22%2C%22100014498%22%2C%22100014833%22%2C%22100014945%22%2C%22100015122%22%2C%22100015482%22%2C%22100015798%22%2C%22100016194%22%2C%22100016281%22%2C%22100016635%22%2C%22100016719%22%2C%22100016882%22%2C%22100016999%22%2C%22100017145%22%2C%22100017855%22%2C%22100019355%22%2C%22100019480%22%2C%22100019491%22%2C%22100019514%22%2C%22100019593%22%2C%22100020767%22%2C%22100021254%22%2C%22100022603%22%2C%22100022870%22%2C%22100022881%22%2C%22100022886%22%2C%22100023349%22%2C%22100023397%22%2C%22100024268%22%2C%22100024574%22%2C%22100024953%22%2C%22100025287%22%2C%22100025353%22%2C%22100025589%22%2C%22100025725%22%2C%22100026264%22%2C%22100027047%22%2C%22100027182%22%2C%22100027256%22%2C%22100028072%22%2C%22100028332%22%2C%22100028579%22%2C%22100028994%22%2C%22100029604%22%2C%22100030461%22%2C%22100030944%22%2C%22100031298%22%2C%22100031872%22%2C%22100032232%22%2C%22100032263%22%2C%22100032264%22%2C%22100032353%22%2C%22100032375%22%2C%22100032385%22%2C%22100032420%22%2C%22100032611%22%2C%22100032678%22%2C%22100033142%22%2C%22100033657%22%2C%22100033972%22%5D%2C%22params%22%3A%7B%22subVerticalType%22%3A%22STYLE%22%7D%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%22e00ce20a33c3d4c797e3167b3141a6f083730cb0b68545776e60e7ba7c5b47f7%22%7D%7D'
  console.log(decodeURI(encoded_url));
}


const writeFile = async (payload) => {
  try {
    const __dirname = new URL('.', import.meta.url).pathname;
    let output_path = path.join(__dirname, `output`).substring(1);
    const isExists = fs.existsSync(output_path);
    if(!isExists) {
      fs.mkdirSync( output_path, { recursive: true } );
    }
    output_path = output_path + "/output.json";

    // create file if not exists
    const base_data = JSON.stringify({"payload":[]});
    await new Promise((resolve, reject) => {
      fs.writeFile(output_path, base_data, { encoding: 'utf8', flag: 'wx' }, (err) => {
        if (err) {
          if (err.message.indexOf('file already exists') >= 0) {
            resolve();
            return;
          }
          reject(err);
          return;
        }
        resolve();
      });

    });
    // write
    fs.readFile(output_path, 'utf8', function readFileCallback (err, data) {
      if (err) {
        throw err;
      } else {
        // let file_object = JSON.parse(data);
        // if (Object.keys(file_object).indexOf("payload") < 0) {
        //   throw 'no "payload" key';
        // }
        // if (!Array.isArray(file_object["payload"])) {
        //   throw '"payload" value is not array';
        // }
        // if (file_object["payload"].length > 0) {
        //   throw '"payload" value is not array';
        // }

        // file_object['payload'] = payload;
        let file_object = payload;
        let stores_json = JSON.stringify(file_object, null, 2);

        fs.writeFile(output_path, stores_json, 'utf8', () => {
          console.log('File writing Done');
        });
      }
    });
  } catch (e) {
    console.log(e);
  }
}

function testObjectUndefined () {
  let a = {'test': 0};
  if (!a['test']) {
    console.log('! true');
  }
  if (a['test'] === null) {
    console.log('null true');
  }
  if (a['test'] === void 0) {
    console.log('void 0 true');
  }
  if (a['test'] === undefined) {
    console.log('undefined true');
  }

  if (a['test'] == null) {
    console.log('== null true');
  }
  if (a['test'] == undefined) {
    console.log('== undefined true');
  }
}


async function testSinsang () {
  try {
    const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhYmFyYSIsImp0aSI6ImRlYXV0ZSIsImlhdCI6MTcwMTA0MzI1MCwibmJmIjoxNzAxMDQzMjUwLCJleHAiOjE3MDExMjk2NTAsInBhcnQiOiJSIiwic3RvcmVfaWQiOjE2NDUyNSwiZGF0YSI6eyJ1dWlkIjpudWxsLCJpcCI6IjEyNy4wLjAuNiIsInVzZXJfYWdlbnQiOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTE5LjAuMC4wIFNhZmFyaS81MzcuMzYiLCJrZXkiOiIifX0.YghcrMk6b9MjlLcqUff_gYivLejofBCPGj2qdBUtDG0';
    const response = await fetch(`https://ip-api.sinsang.market/search/v1/product/category?page=${168}&size=60&buildingId=${2}`, {
      "headers": {
        "accept": "application/json, text/plain, */*",
        "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
        "access-token": ACCESS_TOKEN,
        "global": "ko",
        "platform": "WEB",
        "sec-ch-ua": "\"Google Chrome\";v=\"119\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "Referer": "https://sinsangmarket.kr/",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
      "body": null,
      "method": "GET"
    });

    let json_data = await response.json();
    // let items = json_data['items'];
    console.log(json_data['meta']);
    console.log(json_data['items'][0]);
  } catch (e) {
    console.log(e);
  }
}


function testLengthLoop () {
  const a = ['0', '1', '2,','3']; // length 4
  for (let i = 0; i < a.length; i++) {
    console.log(i);
  }
}

testLengthLoop();

// testObjectUndefined();
// 

// writeFile([{"test": "test1"}, {"test2": "test2"}]);
// getDecodedURI();
// fetchData();
// countPayload();
// countPayloadA(); // payload 내용 및 갯수 확인


