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
    - parentFile — наследование XML (общий механизм движка); документирован в Concepts → [parentFile](concepts/parent-file.md).
    - [isSelectable](mod-desc/is-selectable.md) — виден/выбираем ли мод в списке (по умолчанию да).
    - [uniqueType](mod-desc/unique-type.md) — тег взаимного исключения модов (один включённый на тег).
    - [vehicleTypes](mod-desc/vehicle-types.md) — кастомные типы техники (набор спек); пара к specializations.
    - [placeableSpecializations](mod-desc/placeable-specializations.md) — регистрация кастомных спеков размещаемых объектов (класс `Placeable`).
    - [placeableTypes](mod-desc/placeable-types.md) — кастомные типы размещаемых объектов (набор спек); пара к placeableSpecializations.
    - [handToolSpecializations](mod-desc/handtool-specializations.md) — регистрация спеков ручных инструментов (класс `HandTool`; механизм FS25).
    - [handToolTypes](mod-desc/handtool-types.md) — кастомные типы ручных инструментов (набор спек); пара к handToolSpecializations.
    - [jointTypes](mod-desc/joint-types.md) — типы сцепок навески: глобальный реестр имён; стыковка attacherJoint ↔ inputAttacherJoint.
    - [storeItems](mod-desc/store-items.md) — товары мода в магазине: ссылки на XML предметов; данные магазина в `<storeData>` файла.
    - [storeCategories](mod-desc/store-categories.md) — кастомные категории магазина (только DLC); `name`/`title`/`image`/`type`/`insertAfter`.
    - [brands](mod-desc/brands.md) — бренды/производители: `name`/`title`/`image`/`imageOffset`; глобальный реестр, у всех модов.
    - [actions](mod-desc/actions.md) — регистрация действий ввода: `<action name/axisType/category/…>`; глобальное имя `InputAction.<name>`.
    - [inputBinding](mod-desc/input-binding.md) — привязки по умолчанию для действий: `<actionBinding><binding device/input/…>`; дефолт первого запуска.
    - [fillTypes](mod-desc/fill-types.md) — типы груза/наполнения: ссылка на внешний файл `<map>` с `<fillType>`; глобальный реестр `FillType.<ИМЯ>`.
    - [helpLines](mod-desc/help-lines.md) — страницы помощи: `<category>`/`<page>`/`<paragraph>` во вкладке «Помощь»; дополняют базовые.
    - [densityMapHeightTypes](mod-desc/density-map-height-types.md) — типы насыпных материалов (кучи на земле); внешний файл, привязка к fillType; условие высыпания.
    - [materialTemplates](mod-desc/material-templates.md) — шаблоны материалов/цветов магазина (FS25): `colorScale` sRGB + PBR, наследование `parentTemplate`.
    - [connectionHoses](mod-desc/connection-hoses.md) — типы шлангов трактор↔орудие: внешний файл (basicHoses/connectionHoseTypes/sockets); ссылка по имени.
    - [bales](mod-desc/bales.md) — типы тюков: внешний `<bale>` файл (i3d/размер/грузы/обмотка); подбор баллером по грузу+форме+размеру.
    - [missionVehicles](mod-desc/mission-vehicles.md) — пул техники для контрактов: внешний `<mission type>`→`<group>`→`<vehicle>`; аренда на миссию, только добавление.
    - [maps](mod-desc/maps.md) — играбельные карты мода: `id`/`configFilename`/`default*`/`<title>`/`<iconFilename>`; появляются в выборе карты.
    - [materialHolders](mod-desc/material-holders.md) — держатели материалов: i3d, грузится ради регистрации именованных материалов в общий реестр.
    - [consumables](mod-desc/consumables.md) — расходники (FS25): плёнка/сетка обмотки; надстройка над fillUnit, вариации, расход+пополнение.
    - [wildlife](mod-desc/wildlife.md) — дикая фауна (FS25 modDesc-путь): `<species filename>`; амбиентные животные/птицы (WildlifeSpawner).
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
    - [foldable](specializations/foldable.md) — складывание крыльев/частей: `foldAnimTime`, `foldingParts`, гейтинг `foldMinLimit/foldMaxLimit`.
    - [ai](specializations/ai.md) — настройки автопомощника (наёмного работника).
    - [licensePlates](specializations/license-plates.md) — точки крепления номерных знаков.
    - [powerTakeOffs](specializations/power-take-offs.md) — валы отбора мощности (ВОМ): выход и вход.
    - [foliageBending](specializations/foliage-bending.md) — сгибание растительности вокруг техники.
    - [wearable](specializations/wearable.md) — износ техники.
    - [washable](specializations/washable.md) — загрязнение и мойка.
- **Concepts** — сквозные темы.
    - [Объявление XML](concepts/xml-declaration.md) — строка `<?xml … ?>` в начале каждого файла.
    - [CDATA](concepts/cdata.md) — секция `<![CDATA[ … ]]>` для буквального текста.
    - [parentFile](concepts/parent-file.md) — наследование XML: родитель + правки `set`/`remove`/`clearList`; свои элементы ребёнка отбрасываются.

Лицензия: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
