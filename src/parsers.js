import path from 'path'
import { readFileSync } from 'node:fs'
import _ from 'lodash'
import yaml from 'js-yaml'
import { getFormatter } from './formatters/index.js'

export { gendiff }

function gendiff(filepath1, filepath2, formatName = 'stylish') {
  const [data1, data2] = [filepath1, filepath2].map(loadData)
  return genDataDiff(data1, data2, formatName)
}

function getParser(extname) {
  if (extname === '.yml' || extname === '.yaml') {
    return yaml.load
  }
  if (extname === '.json') {
    return JSON.parse
  }
  throw TypeError(`Unsupported file format ${extname}`)
}

function loadData(filepath) {
  const parse = getParser(path.extname(filepath))
  const fp = path.resolve(process.cwd(), filepath)
  const content = readFileSync(fp, 'utf-8')
  return parse(content)
}

function traverseObject(obj) {
  const keys = _.sortBy(Object.keys(obj))
  return keys.map((key) => {
    const value = obj[key]
    if (_.isObject(value)) {
      const children = traverseObject(value)
      return { key, result: 'unchanged', children }
    }
    else {
      return { key, value, result: 'unchanged' }
    }
  })
}

function getNodeAddRemove(key, value, result) {
  if (_.isObject(value)) {
    const children = traverseObject(value)
    return { key, result, children }
  }
  return { key, value, result }
}

// diffTree consists of array of nodes. Each node is an object
// with following fields: { key, value, result, from, to,
// children, fromChildren, toChildren }:

//  key: <property_name>
//  result: <property_compare_result>
//  value: <property_value> | undefined
//  from: <removed_property_value> | undefined
//  to: <added_property_value> | undefined
//  children: <nested_nodes> | undefined
//  fromChildren: <removed_nested_nodes> | undefined
//  toChildren: <added_nested_nodes> | undefined

function genDataDiff(data1, data2, formatName) {
  const calculateDiff = (obj1, obj2) => {
    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)
    const keys = _.sortBy(_.union(keys1, keys2))

    return keys.map((key) => {
      const value1 = obj1[key]
      const value2 = obj2[key]

      if (!Object.hasOwn(obj1, key)) {
        return getNodeAddRemove(key, value2, 'added')
      }

      if (!Object.hasOwn(obj2, key)) {
        return getNodeAddRemove(key, value1, 'removed')
      }

      if (_.isObject(value1) && _.isObject(value2)) {
        const children = calculateDiff(value1, value2)
        return { key, result: 'unchanged', children }
      }

      if (value1 === value2) {
        return { key, value: value1, result: 'unchanged' }
      }

      if (_.isObject(value1) && !_.isObject(value2)) {
        const children = traverseObject(value1)
        return { key, result: 'updated', fromChildren: children, to: value2 }
      }

      if (!_.isObject(value1) && _.isObject(value2)) {
        const children = traverseObject(value2)
        return { key, result: 'updated', from: value1, toChildren: children }
      }

      if (value1 !== value2) {
        return { key, result: 'updated', from: value1, to: value2 }
      }
      throw new Error('Unknown parser error')
    })
  }

  const diffTree = calculateDiff(data1, data2)
  const formatter = getFormatter(formatName)
  const lines = formatter(diffTree)
  return (lines.join('\n'))
}
