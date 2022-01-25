function* range(start, end) {
    for (let i = start; i <= end; i++) {
        yield i;
    }
}

fs = require('fs');
url = require('url');
request = require('request');

const permitted = {
  voice: {
  'ga_UL':              1,
  'ga_UL_anb_exthts':   2,
  'ga_UL_anb_nnmnkwii': 3,
  'ga_CO':              4,
  'ga_CO_hts':          5,
  'ga_CO_pmg_nnmnkwii': 6,
  'ga_MU_nnc_exthts':   7,
  'ga_MU_nnc_nnmnkwii': 8,
  'ga_MU_cmg_nnmnkwii': 9,
  },
  audioEncoding: {
    'LINEAR16':   1,
    'MP3':        2,
    'OGG_OPUS':   3,
  },
  outputType: {
    'JSON_WITH_TIMING': 1, // {timing: [], audioContent: string}
    'JSON':             2, // {audioContent: string}
    'HTML':             3, // rendered html page with audio element
  }
};

const defaultQuery = {
  voice: (() => {return 'ga_MU_nnc_nnmnkwii';}),
  audioEncoding: (() => {return 'MP3';}),
  outputType: (() => { return 'JSON_WITH_TIMING'; }),
};

const valid = {
  voice: ((str) => {
    return (str in permitted.voice)
      ? str
      : defaultQuery.voice(); }),
  audioEncoding: ((str) => {
    return (str in permitted.audioEncoding)
      ? str
      : defaultQuery.audioEncoding(); }),
  outputType: ((str) => {
      return (str in permitted.outputType)
        ? str
        : defaultQuery.outputType(); }),
}

/** @description - synthesise Irish text with
 *      https://www.abair.ie/api2/synthesise
 *
 *  @param query = {
 *    input,
 *    voice=defaultVoice(),
 *    outputType='JSON_WITH_TIMING',
 *    speed?,
 *    audioEncoding?,
 *  }
 *
 */
function synthesiseSingleSentenceDNN(query) {
  // query validation
  query.voice = valid.voice(query.voice);
  query.audioEncoding = valid.audioEncoding(query.audioEncoding);
  query.outputType = valid.outputType(query.outputType);
  return new Promise( (resolve, reject) => {
    request({
      url: 'https://www.abair.ie' + '/api2/synthesise',
      qs: query,
      method: 'GET', },
      (err, res, body) => {
        console.log(res.url);
        if (err)
          return reject({error: err, response: res, body: body});
        return resolve(body);
    });
  });
}

module.exports.synthesiseSingleSentenceDNN = synthesiseSingleSentenceDNN;
module.exports.permitted = permitted;
module.exports.defaultQuery = defaultQuery;
module.exports.valid = valid;

const base_url = 'https://www.abair.ie/api2/synthesise?';
(async function() {
  for(i of range(0,100)) {
    const words = ['mise ','tusa ']
    const test_text = words.map(s=>s+i)
    const ps = test_text 
      .map(s => synthesiseSingleSentenceDNN({input: s}));
    const rs = await Promise.all(ps);
    const audioContent = rs.map(r=>r.audioContent);
    if (audioContent[0] === audioContent[1]) {
      console.log('ATTEMPT '+ i + ' GAVE SAME AUDIO');
      fs.writeFile('attempt/mise_'+i,rs[0],(err)=>{});
      fs.writeFile('attempt/tusa_'+i,rs[1],(err)=>{});
    }
  }
})();
