const crypto = require('crypto')

// Generate the relevant auth headers
export const genAuthSettings = async (options) => {
  let urn = new URL(options.url);
  
  let authResponse = await got.get(`${urn.protocol}//${urn.host}/authenticate/${options.user}`, { https: { rejectUnauthorized: options.rejectUnauthorized } }).json()
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

export const getAuthHeader = async(url, user, pw, rua) => {
  let urn = new URL(url);

  let authResponse = await got.get(`${urn.protocol}//${urn.host}/authenticate/${user}`, { https: { rejectUnauthorized: rua } }).json()
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