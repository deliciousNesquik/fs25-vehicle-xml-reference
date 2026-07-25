# FS25 Vehicle XML Reference

Справочник по XML техники и оборудования Farming Simulator 25: `modDesc` и все
XML-блоки с примерами. Только разметка, без скриптинга.

## Разделы

- **modDesc** — описание мода (`modDesc.xml`).
    - [Корень `<modDesc>` (descVersion)](mod-desc/root.md) — атрибуты корневого тега.
    - [author](mod-desc/author.md) — имя автора; как указывать соавторов (отдельного тега нет).
    - [version](mod-desc/version.md) — версия мода; формат не строгий, но конвенция полезна.
    - [title](mod-desc/title.md) — многоязычное название; закрытый набор из 27 языковых кодов.
    - [description](mod-desc/description.md) — многоязычное описание; та же языковая модель, CDATA.
    - [iconFilename](mod-desc/icon-filename.md) — путь к иконке мода (DDS 512×512, BC1).
    - [multiplayer](mod-desc/multiplayer.md) — флаг совместимости с MP (самодекларация, не проверка).
    - [l10n](mod-desc/l10n.md) — локализация: внешние файлы (filenamePrefix) или инлайн-переводы.
    - [specializations](mod-desc/specializations.md) — регистрация кастомных спеков (Lua) техники.
    - [extraSourceFiles](mod-desc/extra-source-files.md) — подключение глобальных Lua-скриптов при загрузке мода.
    - [dependencies](mod-desc/dependencies.md) — требуемые моды (должны быть включены; не порядок загрузки).
    - [parentFile](mod-desc/parent-file.md) — наследование XML: родитель как основа + правки (общий механизм движка).
    - [isSelectable](mod-desc/is-selectable.md) — виден/выбираем ли мод в списке (по умолчанию да).
    - [uniqueType](mod-desc/unique-type.md) — тег взаимного исключения модов (один включённый на тег).
    - [vehicleTypes](mod-desc/vehicle-types.md) — кастомные типы техники (набор спек); пара к specializations.
    - [placeableSpecializations](mod-desc/placeable-specializations.md) — регистрация кастомных спеков размещаемых объектов (класс `Placeable`).
    - [placeableTypes](mod-desc/placeable-types.md) — кастомные типы размещаемых объектов (набор спек); пара к placeableSpecializations.
    - [handToolSpecializations](mod-desc/handtool-specializations.md) — регистрация спеков ручных инструментов (класс `HandTool`; механизм FS25).
    - [handToolTypes](mod-desc/handtool-types.md) — кастомные типы ручных инструментов (набор спек); пара к handToolSpecializations.
- **Base** — общие блоки любой техники.
    - [typeDesc](base/type-desc.md) — название типа техники в магазине (ключ локализации).
    - [filename](base/filename.md) — путь к `.i3d` (3D-модель).
    - [sounds](base/sounds.md) — ссылка на внешний файл звуков.
    - [size](base/size.md) — габариты техники и смещения.
    - [schemaOverlay](base/schema-overlay.md) — силуэт в схеме навески.
    - [mapHotspot](base/map-hotspot.md) — значок на карте.
    - [components](base/components.md) — тела, шарниры, столкновения.
    - [i3dMappings](base/i3d-mappings.md) — алиасы узлов i3d (ссылки по имени).
- **Specializations** — блоки по спецификациям.
    - [ai](specializations/ai.md) — настройки автопомощника (наёмного работника).
    - [licensePlates](specializations/license-plates.md) — точки крепления номерных знаков.
    - [powerTakeOffs](specializations/power-take-offs.md) — валы отбора мощности (ВОМ): выход и вход.
    - [foliageBending](specializations/foliage-bending.md) — сгибание растительности вокруг техники.
    - [wearable](specializations/wearable.md) — износ техники.
    - [washable](specializations/washable.md) — загрязнение и мойка.
- **Concepts** — сквозные темы.
    - [Объявление XML](concepts/xml-declaration.md) — строка `<?xml … ?>` в начале каждого файла.
    - [CDATA](concepts/cdata.md) — секция `<![CDATA[ … ]]>` для буквального текста.

Лицензия: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
