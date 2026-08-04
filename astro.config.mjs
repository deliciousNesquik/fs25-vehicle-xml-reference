// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { remarkDocLinks } from './src/plugins/remark-doc-links.mjs';

const repo = 'https://github.com/deliciousNesquik/fs25-vehicle-xml-reference';
const base = '/fs25-vehicle-xml-reference';

export default defineConfig({
	site: 'https://deliciousnesquik.github.io',
	base,
	// Относительные ссылки на .md переписываются в URL страниц; битая ссылка = ошибка сборки.
	markdown: { remarkPlugins: [[remarkDocLinks, { base }]] },
	redirects: {
		// Страница переехала из Concepts в Рецепты. В цели base не подставляется — пишем полностью.
		'/concepts/custom-paint-script': `${base}/recipes/custom-paint/`,
	},
	integrations: [
		starlight({
			title: 'FS25 Vehicle XML Reference',
			description:
				'Справочник по XML техники и оборудования Farming Simulator 25: modDesc и все XML-блоки с примерами.',
			defaultLocale: 'root',
			locales: {
				root: { label: 'Русский', lang: 'ru' },
				en: { label: 'English', lang: 'en' },
			},
			social: [{ icon: 'github', label: 'GitHub', href: repo }],
			editLink: { baseUrl: `${repo}/edit/main/` },
			lastUpdated: true,
			// Дерево навигации: верхний уровень — файл, который правит человек.
			sidebar: [
				{
					label: 'Начало',
					translations: { en: 'Getting started' },
					items: ['start/how-to-read', 'start/tag-index'],
				},
				{
					label: 'modDesc.xml',
					items: [
						{
							label: 'Паспорт мода',
							translations: { en: 'Mod manifest' },
							items: [
								'mod-desc/root',
								'mod-desc/author',
								'mod-desc/version',
								'mod-desc/title',
								'mod-desc/description',
								'mod-desc/icon-filename',
								'mod-desc/multiplayer',
								'mod-desc/is-selectable',
								'mod-desc/unique-type',
							],
						},
						{
							label: 'Код и типы',
							translations: { en: 'Code and types' },
							items: [
								'mod-desc/specializations',
								'mod-desc/extra-source-files',
								'mod-desc/vehicle-types',
								'mod-desc/placeable-specializations',
								'mod-desc/placeable-types',
								'mod-desc/handtool-specializations',
								'mod-desc/handtool-types',
								'mod-desc/dependencies',
							],
						},
						{
							label: 'Магазин',
							translations: { en: 'Store' },
							items: [
								'mod-desc/store-items',
								'mod-desc/store-categories',
								'mod-desc/brands',
								'mod-desc/material-templates',
							],
						},
						{
							label: 'Игровые реестры',
							translations: { en: 'Game registries' },
							items: [
								'mod-desc/fill-types',
								'mod-desc/density-map-height-types',
								'mod-desc/joint-types',
								'mod-desc/connection-hoses',
								'mod-desc/bales',
								'mod-desc/consumables',
								'mod-desc/material-holders',
								'mod-desc/mission-vehicles',
								'mod-desc/maps',
								'mod-desc/wildlife',
							],
						},
						{
							label: 'Интерфейс и ввод',
							translations: { en: 'UI and input' },
							items: [
								'mod-desc/l10n',
								'mod-desc/actions',
								'mod-desc/input-binding',
								'mod-desc/help-lines',
							],
						},
					],
				},
				{
					label: 'vehicle.xml — техника и оборудование',
					translations: { en: 'vehicle.xml — vehicles and tools' },
					items: [
						{
							label: 'Основа',
							translations: { en: 'Base' },
							items: [
								'base/filename',
								'base/components',
								'base/i3d-mappings',
								'base/size',
								'base/type-desc',
								'base/schema-overlay',
								'base/map-hotspot',
								'base/sounds',
							],
						},
						{
							label: 'Внешний вид',
							translations: { en: 'Appearance' },
							items: ['base/materials-paint', 'base/base-color-configurations'],
						},
						{
							label: 'Конфигурации',
							translations: { en: 'Configurations' },
							items: ['concepts/vehicle-configurations'],
						},
						{
							label: 'Спецификации',
							translations: { en: 'Specializations' },
							items: [
								{
									label: 'Обработка почвы',
									translations: { en: 'Soil work' },
									items: ['specializations/cultivator'],
								},
								{
									label: 'Подвижные части',
									translations: { en: 'Moving parts' },
									items: ['specializations/foldable'],
								},
								{
									label: 'Навеска и передача',
									translations: { en: 'Attaching and power' },
									items: ['specializations/power-take-offs'],
								},
								{
									label: 'Состояние машины',
									translations: { en: 'Machine condition' },
									items: ['specializations/wearable', 'specializations/washable'],
								},
								{
									label: 'Помощник и визуал',
									translations: { en: 'AI and visuals' },
									items: [
										'specializations/ai',
										'specializations/foliage-bending',
										'specializations/license-plates',
									],
								},
							],
						},
					],
				},
				{
					label: 'Механизмы движка',
					translations: { en: 'Engine mechanisms' },
					items: ['concepts/xml-declaration', 'concepts/cdata', 'concepts/parent-file'],
				},
				{
					label: 'Рецепты',
					translations: { en: 'Recipes' },
					items: [
						'recipes/custom-paint',
						'recipes/custom-vehicle-type',
						'recipes/localization',
					],
				},
			],
		}),
	],
});
