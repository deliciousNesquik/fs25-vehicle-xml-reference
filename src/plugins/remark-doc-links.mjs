import fs from 'node:fs';
import path from 'node:path';

const DOCS_ROOT = path.resolve('src/content/docs');

/** Обходит дерево и вызывает fn для каждого узла-ссылки. */
function eachLink(node, fn) {
	if (!node || typeof node !== 'object') return;
	if (node.type === 'link' || node.type === 'definition') fn(node);
	for (const child of node.children ?? []) eachLink(child, fn);
}

/**
 * Переписывает относительные ссылки на `.md` в URL страниц: `../mod-desc/l10n.md`
 * → `<base>/mod-desc/l10n/`. Ссылки в исходниках остаются рабочими и на GitHub.
 * Битая ссылка (нет такого файла) роняет сборку — это защита от опечаток.
 */
export function remarkDocLinks({ base = '' } = {}) {
	return function transformer(tree, file) {
		const from = file.history?.[0];
		if (!from) return;

		eachLink(tree, (node) => {
			const url = node.url;
			if (!url || /^[a-z]+:/i.test(url) || url.startsWith('/') || url.startsWith('#')) return;

			const [target, hash] = url.split('#');
			if (!target.endsWith('.md')) return;

			const abs = path.resolve(path.dirname(from), target);
			if (!fs.existsSync(abs)) {
				throw new Error(
					`Битая ссылка в ${path.relative(process.cwd(), from)}: "${url}" — файла ${path.relative(process.cwd(), abs)} нет`
				);
			}

			const slug = path
				.relative(DOCS_ROOT, abs)
				.replace(/\\/g, '/')
				.replace(/\.md$/, '')
				.replace(/(^|\/)index$/, '');

			node.url = `${base}/${slug}${slug ? '/' : ''}${hash ? `#${hash}` : ''}`;
		});
	};
}
