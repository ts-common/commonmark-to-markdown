import { Node, Parser } from "commonmark"
import * as fm from "front-matter"
import * as it from "@ts-common/iterator"

export interface MarkDownEx {
  readonly frontMatter?: string
  readonly markDown: Node
}

export const iterate = (node: Node) => it.iterable(function *() {
  let c = node.firstChild
  while (c !== null) {
    yield c
    c = c.next
  }
})

export const parse = (fileContent: string): MarkDownEx => {
  const result = fm(fileContent)
  const parser = new Parser()
  return {
    frontMatter: result.frontmatter,
    markDown: parser.parse(result.body)
  }
}

export const markDownExToString = (mde: MarkDownEx): string => {
  const md = unescape(commonmarkToString(mde.markDown))
  return mde.frontMatter === undefined ? md : `---\n${mde.frontMatter}\n---\n${md}`
}

function commonmarkToString(root: Node) {
  let walker = root.walker();
  let event;
  let output = "";
  while ((event = walker.next())) {
    let curNode = event.node;

    const leaving = render.leaving[curNode.type]
    if (!event.entering && leaving !== undefined) {
      output += leaving(curNode, event.entering);
    }
    const entering = render.entering[curNode.type]
    if (event.entering && entering !== undefined) {
      output += entering(curNode, event.entering);
    }
  }

  output = output.replace(/\n$/, "");

  return output;
}

type Func = (node: Node, b: unknown) => unknown

interface Render {
  readonly entering: {
    readonly [key: string]: Func|undefined
  }
  readonly leaving: {
    readonly [key: string]: Func|undefined
  }
}

const indent = (node: Node|null): string =>
  node !== null ? indent(node.parent) + (node.type === "item" ? "  " : "") : ""

const render : Render = {
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
      `${indent(node.parent)}${{ bullet: "*", ordered: `1${node.listDelimiter}` }[node.listType]} `,
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
    custom_block: (node: Node) => {},
  },

  leaving: {
    heading: (node: Node) => "\n\n",
    paragraph: (node: Node) => "\n\n",
    link: (node: Node) => `](${node.destination})`,
    strong: (node: Node) => "**",
    emph: (node: Node) => "*",
  }
};
