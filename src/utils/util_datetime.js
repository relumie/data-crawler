module.exports = {
  makeDateString,
}


function makeDateString (datetime, options) {
  options = {
    year: 'yyyy',
    month: 'mm',
    date: 'dd',
    hour: '',
    minutes: '',
    ...options
  }

  let output = '';
  
  if (options['year'] === 'yyyy')
    output += datetime.getFullYear()
  else if (options['year'] === 'yy')
    output += datetime.getFullYear().toString().slice(2, 4)

  if (options['month'] === 'mm')
    output += '-' + (datetime.getMonth() + 1).toString().padStart(2, '0')
  if (options['date'] === 'dd')
    output += '-' + (datetime.getDate()).toString().padStart(2, '0')
  if (options['hour'] === '')
    return output
  if (options['minutes'] === '')
    return output
}