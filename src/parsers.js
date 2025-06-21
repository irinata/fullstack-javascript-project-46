import path from 'path'
import { readFileSync } from 'node:fs'
import _ from 'lodash'
import yaml from 'js-yaml'

export { gendiff }

function gendiff(filepath1, filepath2, formatType = 'stylish') {
  const [data1, data2] = [filepath1, filepath2].map(loadData)
  return genDataDiff(data1, data2, formatType)
}

function getParser(extname) {
  if (extname === '.yml' || extname === '.yaml') {
    return yaml.load
  }
  else if (extname === '.json') {
    return JSON.parse
  }
  else {
    throw TypeError(`Unsupported file format ${extname}`)
  }
}

function loadData(filepath) {
  const parse = getParser(path.extname(filepath))
  const fp = path.resolve(process.cwd(), filepath)
  const content = readFileSync(fp, 'utf-8')
  return parse(content)
}

function getIndent(depth, shift) {
  const defaultIndent = 4 // 4 spaces
  const amount = defaultIndent * depth - shift
  const indent = ' '.repeat(amount)
  return indent
}

function formatTokens(tokens) {
  const ast = tokens.map((token) => {
    const result = token.result
    let value = token.value
    let shift = 0
    let key = ''
    let delim = ': '

    if (_.isUndefined(value)) {
      value = ''
      delim = ''
    }
    else if (_.isNull(value)) {
      value = 'null'
    }
    else {
      value = _.toString(value)
    }
    if (result === 'added') {
      // shift = 1 sign + 1 space
      shift = 2
      key = '+ '
    }
    else if (result === 'removed') {
      shift = 2
      key = '- '
    }
    key += token.key
    const indent = getIndent(token.depth, shift)
    return `${indent}${key}${delim}${value}`
  })

  return ast.join('\n')
}

function traverseObject(obj, depth) { // create tokens for unchanged object
  depth += 1
  const keys = _.sortBy(Object.keys(obj))
  return keys.flatMap((key) => {
    const value = obj[key]
    if (_.isObject(value)) {
      return createTokenHelper(depth)
        .pushLine(key, '{')
        .pushTraverseObj(value).pushLine('}')
        .getTokens()
    }
    return createTokenHelper(depth)
      .pushLine(key, value)
      .getTokens()
  })
}

function createTokenHelper(depth = 0) {
  let tokens = []
  const helper = {
    pushAddLine: (key, value) => {
      tokens.push({ key, value, depth, result: 'added' })
      return helper
    },
    pushRemoveLine: (key, value) => {
      tokens.push({ key, value, depth, result: 'removed' })
      return helper
    },
    pushLine: (key, value = undefined) => {
      tokens.push({ key, value, depth, result: 'unchanged' })
      return helper
    },
    pushTraverseObj: (obj) => {
      tokens = tokens.concat(traverseObject(obj, depth))
      return helper
    },
    pushAnalyzedTokens: (list) => {
      tokens = tokens.concat(list)
      return helper
    },
    getTokens: () => tokens,
  }

  return helper
}

function genDataDiff(data1, data2, formatType) {
  const calculateDiff = (obj1, obj2, depth = 0) => {
    depth += 1
    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)
    const keys = _.sortBy(_.union(keys1, keys2))

    return keys.flatMap((key) => {
      const value1 = obj1[key]
      const value2 = obj2[key]

      if (!Object.hasOwn(obj1, key)) {
        if (_.isObject(value2)) {
          return createTokenHelper(depth)
            .pushAddLine(key, '{').pushTraverseObj(value2).pushLine('}')
            .getTokens()
        }
        else {
          return createTokenHelper(depth)
            .pushAddLine(key, value2)
            .getTokens()
        }
      }

      if (!Object.hasOwn(obj2, key)) {
        if (_.isObject(value1)) {
          return createTokenHelper(depth)
            .pushRemoveLine(key, '{').pushTraverseObj(value1).pushLine('}')
            .getTokens()
        }
        else {
          return createTokenHelper(depth)
            .pushRemoveLine(key, value1)
            .getTokens()
        }
      }

      if (_.isObject(value1) && !_.isObject(value2)) {
        return createTokenHelper(depth)
          .pushRemoveLine(key, '{').pushTraverseObj(value1)
          .pushLine('}').pushAddLine(key, value2)
          .getTokens()
      }

      if (!_.isObject(value1) && _.isObject(value2)) {
        return createTokenHelper(depth)
          .pushRemoveLine(key, value1).pushAddLine(key, '{')
          .pushTraverseObj(value2).pushLine('}')
          .getTokens()
      }

      if (_.isObject(value1) && _.isObject(value2)) {
        const diff = calculateDiff(value1, value2, depth)
        return createTokenHelper(depth)
          .pushLine(key, '{')
          .pushAnalyzedTokens(diff)
          .pushLine('}')
          .getTokens()
      }

      if (value1 !== value2) {
        return createTokenHelper(depth)
          .pushRemoveLine(key, value1).pushAddLine(key, value2)
          .getTokens()
      }

      if (value1 === value1) {
        return createTokenHelper(depth)
          .pushLine(key, value1)
          .getTokens()
      }

      throw new Error('Unknown parser error')
    })
  }
  const diff = calculateDiff(data1, data2)
  const tokens = createTokenHelper()
    .pushLine('{')
    .pushAnalyzedTokens(diff)
    .pushLine('}')
    .getTokens()

  return formatTokens(tokens, formatType)
}
