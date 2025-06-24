#!/usr/bin/env node

import { Command } from 'commander'
import genDiff from '../src/parse.js'

function command(filepath1, filepath2) {
  const diff = genDiff(filepath1, filepath2, program.opts().format)
  console.log(diff)
}

const program = new Command()
program
  .description('Compares two configuration files and shows a difference.')
  .version('1.0.0')
  .arguments('<filepath1> <filepath2>')
  .option('-f, --format [type]', 'output format', 'stylish')
  .action(command)
  .showHelpAfterError()
  .parse()
