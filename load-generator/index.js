'use strict';

const log = false;

const process = require('process');
const https = require('https');
const casual = require('casual');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // eslint-disable-line no-process-env

/* ----------------- */
/* --- Variables --- */
/* ----------------- */

const state = {
  counter: 0
};
const config = {
  interval: 2000,
  limit: null,
  loadGeneration: []
};
const generators = {
  counter: () => {
    return state.counter;
  },
  text: base => {
    return `(${base}) ${casual.text}`;
  },
  temperature: base => {
    const temp = base % 2 === 0 ? 10 : 5;

    return (temp + (base % 5)) + '°C';
  }
};
/* eslint-disable no-process-env */
const requestOptions = {
  hostname: process.env.RECEIVER_HOST || 'localhost',
  port: process.env.RECEIVER_PORT || 8080,
  path: process.env.RECEIVER_PATH || '/receiver/api',
  method: 'POST',
  headers: {
    'content-type': 'application/json'
  }
};
/* eslint-disable no-process-env */

/* ---------------------- */
/* --- Initialization --- */
/* ---------------------- */

const intervalArg = parseInt(process.argv[2], 10);

if (!isNaN(intervalArg)) {
  config.interval = intervalArg;
}

const limitArg = parseInt(process.argv[4], 10);

if (!isNaN(limitArg)) {
  config.limit = limitArg;
}

const loadGenerationString = process.argv[3];

if (typeof loadGenerationString !== 'string') {
  throw new Error();
}

const loadGenerationDefStrings = loadGenerationString.split(',');

loadGenerationDefStrings.forEach(loadGenerationDefString => {
  const loadGenerationDef = loadGenerationDefString.split('=');
  const loadGenerationConfig = {
    channel: loadGenerationDef[0],
    generator: loadGenerationDef[1]
  };

  if (generators.hasOwnProperty(loadGenerationConfig.generator)) {
    loadGenerationConfig.generator = generators[loadGenerationConfig.generator];
  } else {
    loadGenerationConfig.generator = generators.counter;
  }

  config.loadGeneration.push(loadGenerationConfig);
});

console.log(`Initialization Completed:\n - interval: ${config.interval}\n - limit: ${config.limit}\n - loadGeneration:\n`, config.loadGeneration); // eslint-disable-line no-console

/* --------------- */
/* --- Runtime --- */
/* --------------- */

const sendLoad = loadObject => {
  const loadString = JSON.stringify(loadObject);
  const req = https.request(requestOptions, res => {
    log && console.log(`loadString: ${loadString}\nstatusCode: ${res.statusCode}\n`); // eslint-disable-line no-console,no-unused-expressions
  });

  req.end(loadString);
};

const generateLoad = () => {
  config.loadGeneration.forEach(loadConfig => {
    const loadObject = {
      channel: loadConfig.channel,
      msg: loadConfig.generator(state.counter)
    };

    sendLoad(loadObject);
  });

  state.counter += 1;
  if (!config.limit || state.counter < config.limit) {
    setTimeout(generateLoad, config.interval);
  }
};

setTimeout(generateLoad, config.interval);
