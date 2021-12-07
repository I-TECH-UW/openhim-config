#!/usr/bin/env node
'use strict';

const fs = require('fs');
const got = require('got');
const crypto = require('crypto');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { getAuthHeader, genAuthSettings } = require('./auth');

let ohConfig = JSON.parse(fs.readFileSync('test-openhim-config.json'));

const argv = yargs(hideBin(process.argv)).argv;

const apiUrl = argv.apiUrl;
const adminUser = argv.user ? argv.user : "root@openhim.org";
const initialPw = argv.password ? argv.password : "openhim-password";
const adminPw = argv.adminPw ? argv.adminPassword : "openhim";

(async () => {
  console.log(`Attempting to load OpenHIM default config at ${apiUrl}`);
  
  try {
    await metadataPost(
      apiUrl+"/metadata", 
      ohConfig,
      adminUser,
      initialPw,
      adminPw,
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

async function metadataPost(url, conf, user, pw, adminPw, rejectUnauthorized) {
  let headers = await getAuthHeader(url, user, pw, rejectUnauthorized)

  let pwConf = await genAuthSettings({
    url: url,
    user: user,
    password: adminPw
  })

  conf.Users[0].passwordHash = pwConf.authHash;
  conf.Users[0].passwordSalt = pwConf.authSalt;
  
  return got.post(url, { 
    headers: headers,
    https: { rejectUnauthorized: rejectUnauthorized }, 
    json: conf
  }).json();
}