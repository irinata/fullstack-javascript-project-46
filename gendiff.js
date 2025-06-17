#!/usr/bin/env node

import { Command } from 'commander'
import { getDiff } from './src/filesDiff.js'

function command(filepath1, filepath2) {
  const diff = getDiff(filepath1, filepath2)
  console.log(diff)
}

const program = new Command()
program
  .description('Compares two configuration files and shows a difference.')
  .version('1.0.0')
  .arguments('<filepath1> <filepath2>')
  .option('-f, --format [type]', 'output format')
  .action(command)
  .parse()
