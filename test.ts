import { readFileSync } from "fs";
import { Node } from "commonmark";
import { expect } from "chai";
import { parse, markDownExToString } from ".";
import * as glob from "glob";

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
  const fileContent = readFileSync(path, "utf8")
  const parsed = parse(fileContent)
  const result = markDownExToString(parsed)
  const reparse = parse(result)

  expect(reparse.frontMatter).to.eql(parsed.frontMatter)
  expect(nodes(reparse.markDown)).to.eql(nodes(parsed.markDown))
}

describe("#commonmarkToString()", function() {
  for (const file of glob.sync("./md-tests/*/specification/**/*.md")) {
    it(`should produce an markdown document which has a matching AST to ${file}`, function() {
      testFile(file);
    });
  }
});
