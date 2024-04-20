const USER_AGENT_CANDIDATES = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

module.exports = {
  makeInt,
  makeUserAgent,
}

// output : 0, 1, ..., max
function makeInt(max) {
  return Math.floor(Math.random() * (max + 1));
}

function makeUserAgent () {
  const output = USER_AGENT_CANDIDATES[makeInt(USER_AGENT_CANDIDATES.length - 1)];
  console.log(`UserAgent: ${output}`);
  return output;
}