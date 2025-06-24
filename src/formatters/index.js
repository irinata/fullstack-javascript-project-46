import { stylishFormatter } from './stylish.js'
import { plainFormatter } from './plain.js'

export { getFormatter }

function getFormatter(formatName) {
  if (formatName === 'stylish') {
    return stylishFormatter
  }
  if (formatName === 'plain') {
    return plainFormatter
  }
}
