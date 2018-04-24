import { Node } from "commonmark";
import * as commonmark from "commonmark";
import { readFileSync, writeFileSync } from "fs";

export function commonmarkToString(root: Node) {
  let walker = root.walker();
  let event;
  let output = "";
  while ((event = walker.next())) {
    let curNode = event.node;

    if (!event.entering && render.leaving[curNode.type]) {
      output += render.leaving[curNode.type](curNode, event.entering);
    }
    if (event.entering && render.entering[curNode.type]) {
      output += render.entering[curNode.type](curNode, event.entering);
    }
  }

  output = output.replace(/\n$/, "");

  return output;
}

const render = {
  entering: {
    text: (node: Node) => node.literal,
    softbreak: (node: Node) => "\n",
    linebreak: (node: Node) => "\n",
    emph: (node: Node) => "*",
    strong: (node: Node) => "**",
    html_inline: (node: Node) => "`",
    link: (node: Node) => "[",
    image: (node: Node) => {},
    code: (node: Node) => `\`${node.literal}\``,
    document: (node: Node) => "",
    paragraph: (node: Node) => "",
    block_quote: (node: Node) => "> ",
    item: (node: Node) =>
      `${{ bullet: "*", ordered: `1${node.listDelimiter}` }[node.listType]} `,
    list: (node: Node) => "",
    heading: (node: Node) =>
      Array(node.level)
        .fill("#")
        .join("") + " ",
    code_block: (node: Node) =>
      `\`\`\` ${node.info}\n${node.literal}\`\`\`\n\n`,
    html_block: (node: Node) => node.literal,
    thematic_break: (node: Node) => "---\n\n",
    custom_inline: (node: Node) => {},
    custom_block: (node: Node) => {}
  },

  leaving: {
    heading: (node: Node) => "\n\n",
    paragraph: (node: Node) => "\n\n",
    link: (node: Node) => `](${node.destination})`,
    strong: (node: Node) => "**",
    emph: (node: Node) => "*"
  }
};
