import * as commonmark from "commonmark";
import { readFileSync, readdirSync } from "fs";
import { Node } from "commonmark";
import { expect } from "chai";
import { commonmarkToString } from ".";
import { relative } from "path";
import * as glob from "glob";
var assert = require("assert");

function nodes(root: Node) {
  let walker = root.walker();
  let event = walker.next();
  let nodes: any[] = [];

  while (event) {
    let curNodeA = event.node;
    nodes = [
      ...nodes,
      {
        type: curNodeA.type,
        literal: curNodeA.literal,
        title: curNodeA.title,
        info: curNodeA.info,
        level: curNodeA.level,
        listType: curNodeA.listType,
        listDelimiter: curNodeA.listDelimiter
      }
    ];
    event = walker.next();
  }

  return nodes;
}

function testFile(path: string) {
  let reader = new commonmark.Parser();

  let parsed = reader.parse(readFileSync(path, "utf8")); // parsed is a 'Node' tree
  let reparse = reader.parse(unescape(commonmarkToString(parsed)));

  expect(nodes(reparse)).to.eql(nodes(parsed));
}

describe("#commonmarkToString()", function() {
  for (const file of glob.sync("./md-tests/*/specification/**/*.md")) {
    it(`should produce an markdown document which has a matching AST to ${file}`, function() {
      testFile(file);
    });
  }
});
