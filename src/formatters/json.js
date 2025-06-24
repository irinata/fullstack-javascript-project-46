export { jsonFormatter }

function jsonFormatter(tree) {
  return JSON.stringify(tree, null, 2)
}
