import path from 'path'
import { readFileSync } from 'node:fs'
import _ from 'lodash'
import yaml from 'js-yaml'

export { gendiff }

function gendiff(filepath1, filepath2) {
  const [data1, data2] = [filepath1, filepath2].map(loadData)
  return genDataDiff(data1, data2)
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

function getIndent(depth, sign) {
  return '    '.repeat(depth - 1) + `  ${sign || ' '} `
}

function formatTree(depth, path, nodes, outLines) {
  nodes.forEach(node => formatNode(depth, path, node, outLines))
}

function generateItem(depth, path, key, value, children, outLines, sign) {
  const enableHighlighting = false
  const RED = '\x1b[31m'
  const GREEN = '\x1b[32m'
  const RESET = '\x1b[0m'
  const start = enableHighlighting
    ? sign === '+' ? GREEN : sign === '-' ? RED : ''
    : ''
  const end = enableHighlighting ? sign ? RESET : '' : ''

  if (children) {
    outLines.push(start + getIndent(depth, sign) + key + ': {')
    formatTree(depth + 1, [...path, key], children, outLines)
    outLines.push(getIndent(depth) + '}' + end)
  }
  else {
    outLines.push(start + getIndent(depth, sign) + `${key}: ${value}` + end)
  }
}

function formatNode(depth, path, node, outLines) {
  if (node.result === 'updated') {
    generateItem(depth, path, node.key, node.from, node.fromChildren, outLines, '-')
    generateItem(depth, path, node.key, node.to, node.toChildren, outLines, '+')
  }
  else {
    const sign = node.result === 'added' ? '+' : node.result === 'removed' ? '-' : undefined
    generateItem(depth, path, node.key, node.value, node.children, outLines, sign)
  }
}

function stylishFormatter(tree) {
  const outLines = ['{']
  formatTree(1, [], tree, outLines)
  outLines.push('}')
  return outLines
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

function genDataDiff(data1, data2) {
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
  const lines = stylishFormatter(diffTree)
  return (lines.join('\n'))
}
