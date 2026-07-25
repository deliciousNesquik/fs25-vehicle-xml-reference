# fs25-vehicle-xml-reference

Справочник по XML техники и оборудования **Farming Simulator 25**: `modDesc` и все
XML-блоки с примерами. Только разметка (XML), без скриптинга.

## Что это

Постраничное описание блоков vehicle-XML FS25: назначение, каждый атрибут (тип,
значение по умолчанию, описание), под-элементы, примеры XML, устройство объекта в
GIANTS Editor и типичные ошибки. Источник схем — исходный код игры (базовые
специализации `Vehicle.lua` и др.).

## Структура

```
docs/
├── base/             — общие блоки любой техники (modDesc, base, components, wheels, ...)
├── specializations/  — блоки по спецификациям (cutter, mower, sprayer, cultivator, ...)
├── concepts/         — сквозные темы (fill types, configurations, effects, sounds, ...)
└── _template.md      — шаблон новой страницы
```

## Содержание

### Base — общие блоки любой техники
- [typeDesc](docs/base/type-desc.md) — название типа техники в магазине (ключ локализации).
- [filename](docs/base/filename.md) — путь к `.i3d` (3D-модель).
- [sounds](docs/base/sounds.md) — ссылка на внешний файл звуков.
- [size](docs/base/size.md) — габариты техники и смещения.
- [schemaOverlay](docs/base/schema-overlay.md) — силуэт в схеме навески.
- [mapHotspot](docs/base/map-hotspot.md) — значок на карте.
- [components](docs/base/components.md) — тела, шарниры, столкновения.
- [i3dMappings](docs/base/i3d-mappings.md) — алиасы узлов i3d (ссылки на ноды по имени).

### Specializations — блоки по спецификациям
- [ai](docs/specializations/ai.md) — настройки автопомощника: габариты для навигатора, рулевые колёса, обнаружение препятствий, развороты.
- [licensePlates](docs/specializations/license-plates.md) — точки крепления номерных знаков: узлы, тип, позиция, область размещения.
- [powerTakeOffs](docs/specializations/power-take-offs.md) — валы отбора мощности (ВОМ): выход (трактор), вход (орудие), модель вала.
- [foliageBending](docs/specializations/foliage-bending.md) — сгибание растительности вокруг техники.
- [wearable](docs/specializations/wearable.md) — износ техники (влияет на стоимость и ремонт).
- [washable](docs/specializations/washable.md) — загрязнение и мойка (визуал).

### Concepts — сквозные темы
- [Объявление XML](docs/concepts/xml-declaration.md) — строка `<?xml … ?>` в начале каждого файла: version, encoding, standalone.

_Разделы пополняются по мере добавления блоков._

## Как читать

Каждая страница самодостаточна: таблицы атрибутов, примеры XML и глоссарий терминов
(сноски в конце страницы). Начинать удобнее с раздела `base`.

## Лицензия

[CC BY-SA 4.0](LICENSE). Использование, изменение и распространение свободны при
условии указания авторства; производные работы — под той же лицензией.

> Лицензируется текст справочника (описания, таблицы, примеры). Имена XML-тегов и
> атрибутов, а также факты о движке принадлежат GIANTS Software.
