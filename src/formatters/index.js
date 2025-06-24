import stylishFormatter from './stylish.js'
import plainFormatter from './plain.js'
import jsonFormatter from './json.js'

export default function getFormatter(formatName) {
  if (formatName === 'stylish') {
    return stylishFormatter
  }
  if (formatName === 'plain') {
    return plainFormatter
  }
  if (formatName === 'json') {
    return jsonFormatter
  }
}
