export {
	hasKoreanCharacters,
  convertUnicodeToText,
}


function hasKoreanCharacters(text) {
  // const korean_type_a_regex = /[\u3131-\uD79D]/g; // Range for Korean characters (전체? 한자도 포함되서 업데이트 필요했음)
  const korean_regex = /([\u3131-\u318F]|[\u1100-\u11FF]|[\uAC00-\uD7A3])/g;
  return korean_regex.test(text);
}

function convertUnicodeToText(unicode_input) {
  return unicode_input.replace(/\\u([\dA-F]{4})/gi, function (match, p1) {
    return String.fromCharCode(parseInt(p1, 16));
  });
}