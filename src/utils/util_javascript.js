const fetch = require('node-fetch')

module.exports = {
  checkType,
  clearObject,
  delay,
  fetchRetry,
}

function checkType (object) {
  return Object.prototype.toString.call(object)
}

function clearObject (obj) {
  Object.keys(obj).forEach((param) => {
    if ((obj[param]).toString() === "[object Object]") {
      clearObject(obj[param])
    } else {
      obj[param] = null
    }
  })
  Object.keys(obj).forEach((param) => delete obj[param])
  return obj
}
function delay (ms){
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchRetry (url, ms, tries, fetchOptions = {}) {
  async function onError(err) {
    tries = tries - 1
      if(!tries){
          throw err
      }
      await delay(ms)
      return fetchRetry(url, ms, tries, fetchOptions)
  }
  try {
    return fetch(url,fetchOptions)
  } catch (e) {
    return onError(e)
  }
}