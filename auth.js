const crypto = require('crypto')
const got = require('got');

// Generate the relevant auth headers
exports.genAuthSettings = async (options) => {
  let urn = new URL(options.url);
  
  console.log("Generating Auth Settings:"+JSON.stringify(options))

  let authResponse = await got.get(`${urn.protocol}//${urn.host}/authenticate/${options.user}`, { https: { rejectUnauthorized: false, requestCert: false } }).json()
  const salt = authResponse.salt

  // create passhash
  let shasum = crypto.createHash('sha512')
  shasum.update(salt + options.password)
  const passhash = shasum.digest('hex')


  // define request headers with auth credentials
  return {
    authSalt: salt,
    authHash: passhash,
  }
}

exports.getAuthHeader = async(url, user, pw, rua) => {
  let urn = new URL(url);

  console.log("Getting auth header")
  let authResponse = await got.get(`${urn.protocol}//${urn.host}/authenticate/${user}`, { https: { rejectUnauthorized: false, agent: false, requestCert: true } }).json()
  const salt = authResponse.salt;
  
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

  return headers;
}