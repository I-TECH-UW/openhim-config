#!/usr/bin/env node
'use strict';

const fs = require('fs');
const got = require('got');
const crypto = require('crypto');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

let ohConfig = JSON.parse(fs.readFileSync('test-openhim-config.json'));

const argv = yargs(hideBin(process.argv)).argv;

const apiUrl = argv.apiUrl;
const user = argv.user ? argv.user : "root@openhim.org";
const password = argv.password ? argv.password : "openhim-password";

(async () => {
  console.log(`Attempting to load OpenHIM default config at ${apiUrl}`);
  
  try {
    await metadataPost(
      apiUrl+"/metadata", 
      ohConfig,
      user,
      password,
      false
    );

    console.log(`Successfully configured OpenHIM at ${apiUrl}`);
    process.exit(0);
  } catch (error) {
    console.log(`ERROR: Unable to configure OpenHIM at ${apiUrl}`);
    console.log(error);
    process.exit(1);
  }
})();

async function metadataPost(url, conf, user, pw, rejectUnauthorized) {
  let urn = new URL(url);

  let authResponse = await got.get(`${urn.protocol}//${urn.host}/authenticate/${user}`, { https: { rejectUnauthorized: rejectUnauthorized } }).json()
  let salt = authResponse.salt;
  
  let shasum = crypto.createHash('sha512');
  shasum.update(salt + pw);
  let passhash = shasum.digest('hex')

  let now = new Date();
  shasum = crypto.createHash('sha512');
  shasum.update(passhash + salt + now);
  let token = shasum.digest('hex');

  let headers = {
    'auth-username': user,
    'auth-ts': now,
    'auth-salt': salt,
    'auth-token': token
  };

  return got.post(url, { 
    headers: headers,
    https: { rejectUnauthorized: rejectUnauthorized }, 
    json: conf
  }).json();
}