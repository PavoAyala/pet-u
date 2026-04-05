import getReadingTime from 'reading-time';
import { toString } from 'mdast-util-to-string';
import { visit } from 'unist-util-visit';

type RemarkPlugin = () => (tree: unknown, file: { data?: { astro?: { frontmatter?: Record<string, unknown> } } }) => void;
type RehypeNode = {
  type?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: RehypeNode[];
};
type RehypePlugin = () => (tree: RehypeNode) => void;

export const readingTimeRemarkPlugin: RemarkPlugin = () => {
  return function (tree: unknown, file) {
    const textOnPage = toString(tree);
    const readingTime = Math.ceil(getReadingTime(textOnPage).minutes);

    if (typeof file?.data?.astro?.frontmatter !== 'undefined') {
      file.data.astro.frontmatter.readingTime = readingTime;
    }
  };
};

export const responsiveTablesRehypePlugin: RehypePlugin = () => {
  return function (tree) {
    if (!tree.children) return;

    for (let i = 0; i < tree.children.length; i++) {
      const child = tree.children[i];

      if (child.type === 'element' && child.tagName === 'table') {
        tree.children[i] = {
          type: 'element',
          tagName: 'div',
          properties: {
            style: 'overflow:auto',
          },
          children: [child],
        };

        i++;
      }
    }
  };
};

export const lazyImagesRehypePlugin: RehypePlugin = () => {
  return function (tree) {
    if (!tree.children) return;

    visit(tree as never, 'element', function (node: RehypeNode) {
      if (node.tagName === 'img') {
        node.properties = node.properties ?? {};
        node.properties.loading = 'lazy';
      }
    });
  };
};
