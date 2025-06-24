export default function stylishFormatter(tree) {
  const outLines = ['{']
  formatTree(1, [], tree, outLines)
  outLines.push('}')
  return outLines.join('\n')
}


function formatTree(depth, path, nodes, outLines) {
  nodes.forEach(node => formatNode(depth, path, node, outLines))
}

function getIndent(depth, sign) {
  return '    '.repeat(depth - 1) + `  ${sign || ' '} `
}

function generateItem(depth, path, key, value, children, outLines, sign) {
  const RED = '\x1b[31m'
  const GREEN = '\x1b[32m'
  const RESET = '\x1b[0m'
  const enableHighlighting = false
  const color = enableHighlighting
    ? sign === '+' ? GREEN : sign === '-' ? RED : ''
    : ''
  const endColor = enableHighlighting ? sign ? RESET : '' : ''

  if (children) {
    outLines.push(color + getIndent(depth, sign) + key + ': {')
    formatTree(depth + 1, [...path, key], children, outLines)
    outLines.push(getIndent(depth) + '}' + endColor)
  }
  else {
    outLines.push(color + getIndent(depth, sign) + `${key}: ${value}` + endColor)
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
