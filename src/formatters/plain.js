export { plainFormatter }

function formatTree(path, nodes, outLines) {
  nodes.forEach(node => formatNode(path, node, outLines))
}

function getStringValue(obj, prop, color, endColor) {
  return Object.hasOwn(obj, prop)
    ? typeof obj[prop] === 'string' ? color + `'${obj[prop]}'` + endColor : obj[prop]
    : '[complex value]'
};

function getPath(path, key, color, endColor) {
  return (path.length !== 0 ? color + `'${path.join('.')}.` : color + `'`) + `${key}'` + endColor
}

function formatNode(path, node, outLines) {
  const YELLOW = '\x1b[93m'
  const RESET = '\x1b[0m'
  const enableHighlighting = false
  const color = enableHighlighting ? YELLOW : ''
  const endColor = enableHighlighting ? RESET : ''

  switch (node.result) {
    case 'updated': {
      const from = getStringValue(node, 'from', color, endColor)
      const to = getStringValue(node, 'to', color, endColor)
      const line = 'Property ' + getPath(path, node.key, color, endColor)
        + ` was updated. From ${from} to ${to}`
      outLines.push(line)
      break
    }
    case 'removed': {
      const line = 'Property ' + getPath(path, node.key, color, endColor) + ' was removed'
      outLines.push(line)
      break
    }
    case 'added': {
      const value = getStringValue(node, 'value', color, endColor)
      const line = 'Property ' + getPath(path, node.key, color, endColor)
        + ` was added with value: ${value}`
      outLines.push(line)
      break
    }
    default:
      if (node.children) {
        formatTree([...path, node.key], node.children, outLines)
      }
  }
}

function plainFormatter(diffTree) {
  const outLines = []
  formatTree([], diffTree, outLines)
  return outLines.join('\n')
}
