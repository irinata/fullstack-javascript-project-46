import path from 'path'
import { readFileSync } from 'node:fs'
import _ from 'lodash'
import yaml from 'js-yaml'

export { genFilesDiff }

function getParser(format) {
  if (format === '.yml' || format === '.yaml') {
    return yaml.load;
  } else if (format === '.json') {
    return JSON.parse;
  } else {
    throw TypeError(`Unsupported file format ${format}`)
  }
}

function loadData(filepath) {  
  const parse = getParser(path.extname(filepath));
  const fp = path.resolve(process.cwd(), filepath);
  const content = readFileSync(fp, 'utf-8');
  return parse(content);
}

function genDataDiff(data1, data2) {
  const plus = '  + '
  const minus = '  - '

  const keys1 = Object.keys(data1)
  const keys2 = Object.keys(data2)
  const keys = _.sortBy(_.union(keys1, keys2))
  const result = ['{']

  for (const key of keys) {
    if (!Object.hasOwn(data1, key)) {
      result.push(`${plus}${key}: ${data2[key]}`)
    }
    else
      if (!Object.hasOwn(data2, key)) {
        result.push(`${minus}${key}: ${data1[key]}`)
      }
      else
        if (data1[key] !== data2[key]) {
          result.push(`${minus}${key}: ${data1[key]}`)
          result.push(`${plus}${key}: ${data2[key]}`)
        }
        else {
          result.push(`    ${key}: ${data1[key]}`)
        }
  }
  result.push('}')
  return result.join('\n')
}

function genFilesDiff(filepath1, filepath2) {
  const [data1, data2] = [filepath1, filepath2].map(loadData);
  return genDataDiff(data1, data2)
}
