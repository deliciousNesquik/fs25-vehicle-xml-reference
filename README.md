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

### modDesc — описание мода
- [Корень `<modDesc>` (descVersion)](docs/mod-desc/root.md) — атрибуты корневого тега.
- [author](docs/mod-desc/author.md) — имя автора; указание соавторов (отдельного тега нет).
- [version](docs/mod-desc/version.md) — версия мода; формат свободный (a.b.c.d — рекомендация), major/minor/patch.
- [title](docs/mod-desc/title.md) — многоязычное название; закрытый набор из 27 языковых кодов, фолбэк на en.
- [description](docs/mod-desc/description.md) — многоязычное описание; та же языковая модель, обычно CDATA.
- [iconFilename](docs/mod-desc/icon-filename.md) — путь к иконке мода; DDS 512×512, BC1, без мипов (не путать со store-иконкой).
- [multiplayer](docs/mod-desc/multiplayer.md) — `supported`/`only`; самодекларация MP-совместимости (движок не проверяет код).
- [l10n](docs/mod-desc/l10n.md) — локализация: `filenamePrefix` (внешние файлы `l10n_<код>.xml`) или инлайн-`<text>`; `$l10n_`/getText, en-фолбэк.
- [specializations](docs/mod-desc/specializations.md) — регистрация кастомных спеков техники: `name`/`className`/`filename`; неймспейс `<modName>.<name>`.
- [extraSourceFiles](docs/mod-desc/extra-source-files.md) — глобальные Lua-скрипты (`sourceFile#filename`), грузятся при загрузке мода по порядку.
- [dependencies](docs/mod-desc/dependencies.md) — требуемые моды (имя без `.zip`); проверка включённости, блокирует старт; НЕ порядок загрузки.
- [parentFile](docs/mod-desc/parent-file.md) — наследование XML: `xmlFilename` родитель + `set`/`remove`/`clearList`; общий механизм движка (чаще в конфигах техники).
- [isSelectable](docs/mod-desc/is-selectable.md) — виден/выбираем ли мод в меню (по умолчанию `true`); `false` — служебные/зависимые моды.
- [uniqueType](docs/mod-desc/unique-type.md) — тег взаимоисключения: моды с одинаковым тегом нельзя включить вместе (диалог-своп).
- [vehicleTypes](docs/mod-desc/vehicle-types.md) — кастомные типы техники: `parent` + `<specialization>`; ссылка через `type=` в vehicle.xml.
- [placeableSpecializations](docs/mod-desc/placeable-specializations.md) — регистрация кастомных спеков размещаемых объектов: `name`/`className`/`filename`; класс `Placeable`, общий с техникой механизм.
- [placeableTypes](docs/mod-desc/placeable-types.md) — кастомные типы размещаемых объектов: `parent="simplePlaceable"` + `<specialization>`; ссылка через `type=` в placeable.xml.
- [handToolSpecializations](docs/mod-desc/handtool-specializations.md) — регистрация спеков ручных инструментов (класс `HandTool`); механизм новый в FS25.
- [handToolTypes](docs/mod-desc/handtool-types.md) — кастомные типы ручных инструментов: `parent` + `<specialization>`; корень `<handTool type=>`; 9 базовых спек.
- [jointTypes](docs/mod-desc/joint-types.md) — типы сцепок навески: `<jointType name=>`; глобальный реестр (без неймспейса), стыковка по совпадению имени attacherJoint ↔ inputAttacherJoint.
- [storeItems](docs/mod-desc/store-items.md) — товары мода в магазине: `<storeItem xmlFilename=>` ссылается на файл предмета; вся витрина — в `<storeData>` файла; вид по `<species>`.
- [storeCategories](docs/mod-desc/store-categories.md) — кастомные категории магазина: `<storeCategory name/title/image/type/insertAfter>`; читается ТОЛЬКО у DLC, обычный мод — скриптом; типы VEHICLE/TOOL/PLACEABLE/OBJECT.
- [brands](docs/mod-desc/brands.md) — бренды/производители: `<brand name/title/image/imageOffset>`; глобальный реестр по имени (заглавные+`_`), у всех модов; ссылка через `storeData.brand`, fallback LIZARD.
- [actions](docs/mod-desc/actions.md) — регистрация действий ввода: `<action name/axisType/category/displayCategory/ignoreComboMask>`; глобальное имя, `InputAction.<name>`, имя действия в меню — `input_<name>`.
- [inputBinding](docs/mod-desc/input-binding.md) — привязки по умолчанию: `<actionBinding action><binding input/device/index/axisComponent/inputComponent/neutralInput>`; комбо через пробел; приоритет у конфига игрока.

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
- [CDATA](docs/concepts/cdata.md) — секция `<![CDATA[ … ]]>` для буквального текста (спецсимволы, многострочный текст).

_Разделы пополняются по мере добавления блоков._

## Как читать

Каждая страница самодостаточна: таблицы атрибутов, примеры XML и глоссарий терминов
(сноски в конце страницы). Начинать удобнее с раздела `base`.

## Лицензия

[CC BY-SA 4.0](LICENSE). Использование, изменение и распространение свободны при
условии указания авторства; производные работы — под той же лицензией.

> Лицензируется текст справочника (описания, таблицы, примеры). Имена XML-тегов и
> атрибутов, а также факты о движке принадлежат GIANTS Software.
