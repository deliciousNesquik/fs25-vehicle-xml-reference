---
title: "Указатель тегов A→Z"
description: "Плоский список документированных XML-элементов — когда имя тега известно, а раздел нет."
sidebar:
  label: "Указатель тегов A→Z"
---

Список всех элементов, у которых в справочнике есть разбор. Нужен, когда имя тега вы уже
знаете — из чужого мода, лога или файла игры — а в какой раздел дерева оно попадает, нет.

Одноимённые теги из разных контекстов перечислены отдельными строками: `<map>` внутри `<maps>` и
`<map>` как корень внешнего файла типов груза — разные вещи.

---

## Элементы

| Тег | Что это | Страница |
|---|---|---|
| `<action>` | одно действие ввода внутри `<actions>` | [modDesc → actions](../mod-desc/actions.md) |
| `<actionBinding>` | привязки одного действия внутри `<inputBinding>` | [modDesc → input-binding](../mod-desc/input-binding.md) |
| `<actions>` | регистрация действий ввода мода | [modDesc → actions](../mod-desc/actions.md) |
| `<ai>` | настройки автопомощника (наёмного работника) | [Спецификации → ai](../specializations/ai.md) |
| `<alarmTrigger>` | сигнал по диапазону уровня груза | [Спецификации → fill-unit](../specializations/fill-unit.md) |
| `<areaMarkers>` | маркеры рабочей области для ИИ | [Спецификации → ai](../specializations/ai.md) |
| `<attributes>` | правка атрибутов элемента при наследовании | [Механизмы → parent-file](../concepts/parent-file.md) |
| `<author>` | автор мода | [modDesc → author](../mod-desc/author.md) |
| `<bale>` | описание типа тюка внутри `<bales>` | [modDesc → bales](../mod-desc/bales.md) |
| `<bales>` | регистрация типов тюков | [modDesc → bales](../mod-desc/bales.md) |
| `<baseColorConfiguration>` | один вариант основного цвета | [Основа → base-color-configurations](../base/base-color-configurations.md) |
| `<baseColorConfigurations>` | выбор основного цвета в магазине | [Основа → base-color-configurations](../base/base-color-configurations.md) |
| `<bendingNode>` | узел области сгибания растительности | [Спецификации → foliage-bending](../specializations/foliage-bending.md) |
| `<binding>` | конкретная клавиша/ось внутри `<actionBinding>` | [modDesc → input-binding](../mod-desc/input-binding.md) |
| `<brand>` | один бренд внутри `<brands>` | [modDesc → brands](../mod-desc/brands.md) |
| `<brands>` | бренды и производители мода | [modDesc → brands](../mod-desc/brands.md) |
| `<category>` | категория страниц помощи | [modDesc → help-lines](../mod-desc/help-lines.md) |
| `<clearList>` | очистка списка при наследовании | [Механизмы → parent-file](../concepts/parent-file.md) |
| `<collisionPair>` | пара компонентов, не сталкивающихся друг с другом | [Основа → components](../base/components.md) |
| `<component>` | физическое тело техники | [Основа → components](../base/components.md) |
| `<components>` | тела, шарниры и столкновения техники | [Основа → components](../base/components.md) |
| `<configurationSet>` | один готовый комплект вариантов | [Механизмы → vehicle-configurations](../concepts/vehicle-configurations.md) |
| `<configurationSets>` | комплекты конфигураций в магазине | [Механизмы → vehicle-configurations](../concepts/vehicle-configurations.md) |
| `<connectionHose>` | тип шланга внутри `<connectionHoses>` | [modDesc → connection-hoses](../mod-desc/connection-hoses.md) |
| `<connectionHoses>` | типы шлангов трактор↔орудие | [modDesc → connection-hoses](../mod-desc/connection-hoses.md) |
| `<consumable>` | ссылка на файл вариаций расходника | [modDesc → consumables](../mod-desc/consumables.md) |
| `<consumables>` | регистрация расходников мода | [modDesc → consumables](../mod-desc/consumables.md) |
| `<consumableVariation>` | вариация расходника (плёнка, сетка) | [modDesc → consumables](../mod-desc/consumables.md) |
| `<cultivator>` | спека обработки почвы (культиватор, лущильник) | [Спецификации → cultivator](../specializations/cultivator.md) |
| `<deformNode>` | узел, деформирующий кучу груза | [Спецификации → fill-volume](../specializations/fill-volume.md) |
| `<densityMapHeightType>` | тип насыпного материала во внешнем файле | [modDesc → density-map-height-types](../mod-desc/density-map-height-types.md) |
| `<densityMapHeightTypes>` | регистрация насыпных материалов (кучи) | [modDesc → density-map-height-types](../mod-desc/density-map-height-types.md) |
| `<dependencies>` | требуемые моды | [modDesc → dependencies](../mod-desc/dependencies.md) |
| `<dependency>` | один требуемый мод | [modDesc → dependencies](../mod-desc/dependencies.md) |
| `<description>` | многоязычное описание мода | [modDesc → description](../mod-desc/description.md) |
| `<directionNode>` | узел направления обработки почвы | [Спецификации → cultivator](../specializations/cultivator.md) |
| `<exactFillRootNode>` | узел точной заправки ёмкости | [Спецификации → fill-unit](../specializations/fill-unit.md) |
| `<extraSourceFiles>` | глобальные Lua-скрипты мода | [modDesc → extra-source-files](../mod-desc/extra-source-files.md) |
| `<filename>` | путь к .i3d — 3D-модели техники | [Основа → filename](../base/filename.md) |
| `<fillPlane>` | плоскость груза, движущаяся по уровню | [Спецификации → fill-plane](../specializations/fill-plane.md) |
| `<fillTrigger>` | скорость заправки из триггера | [Спецификации → fill-unit](../specializations/fill-unit.md) |
| `<fillType>` | описание типа груза во внешнем файле | [modDesc → fill-types](../mod-desc/fill-types.md) |
| `<fillTypes>` | регистрация типов груза/наполнения | [modDesc → fill-types](../mod-desc/fill-types.md) |
| `<fillUnit>` | ёмкость: литры, типы груза, масса, HUD | [Спецификации → fill-unit](../specializations/fill-unit.md) |
| `<fillUnits>` | контейнер ёмкостей внутри конфигурации | [Спецификации → fill-unit](../specializations/fill-unit.md) |
| `<fillVolume>` | объёмная куча груза внутри кузова | [Спецификации → fill-volume](../specializations/fill-volume.md) |
| `<foldable>` | спека складывания частей и крыльев | [Спецификации → foldable](../specializations/foldable.md) |
| `<foldingConfiguration>` | один вариант складывания | [Спецификации → foldable](../specializations/foldable.md) |
| `<foldingConfigurations>` | конфигурации складывания | [Спецификации → foldable](../specializations/foldable.md) |
| `<foldingPart>` | складывающаяся часть (анимация, узлы) | [Спецификации → foldable](../specializations/foldable.md) |
| `<foldingParts>` | список складывающихся частей | [Спецификации → foldable](../specializations/foldable.md) |
| `<foliageBending>` | спека сгибания растительности вокруг техники | [Спецификации → foliage-bending](../specializations/foliage-bending.md) |
| `<group>` | группа техники контракта | [modDesc → mission-vehicles](../mod-desc/mission-vehicles.md) |
| `<handToolSpecializations>` | регистрация спек ручных инструментов | [modDesc → handtool-specializations](../mod-desc/handtool-specializations.md) |
| `<handToolTypes>` | кастомные типы ручных инструментов | [modDesc → handtool-types](../mod-desc/handtool-types.md) |
| `<heightNode>` | узел, следящий за высотой кучи | [Спецификации → fill-volume](../specializations/fill-volume.md) |
| `<helpLines>` | страницы помощи мода | [modDesc → help-lines](../mod-desc/help-lines.md) |
| `<i3dMapping>` | алиас одного узла i3d | [Основа → i3d-mappings](../base/i3d-mappings.md) |
| `<i3dMappings>` | алиасы узлов i3d (ссылки по имени) | [Основа → i3d-mappings](../base/i3d-mappings.md) |
| `<iconFilename>` | иконка мода (DDS 512×512) | [modDesc → icon-filename](../mod-desc/icon-filename.md) |
| `<input>` | вход ВОМ на стороне орудия | [Спецификации → power-take-offs](../specializations/power-take-offs.md) |
| `<inputBinding>` | привязки клавиш по умолчанию | [modDesc → input-binding](../mod-desc/input-binding.md) |
| `<isSelectable>` | виден ли мод в списке модов | [modDesc → is-selectable](../mod-desc/is-selectable.md) |
| `<joint>` | шарнир между компонентами | [Основа → components](../base/components.md) |
| `<jointType>` | имя типа сцепки навески | [modDesc → joint-types](../mod-desc/joint-types.md) |
| `<jointTypes>` | регистрация типов сцепок навески | [modDesc → joint-types](../mod-desc/joint-types.md) |
| `<l10n>` | локализация мода: строки и ключи | [modDesc → l10n](../mod-desc/l10n.md) |
| `<licensePlate>` | одна точка крепления номерного знака | [Спецификации → license-plates](../specializations/license-plates.md) |
| `<licensePlates>` | спека номерных знаков | [Спецификации → license-plates](../specializations/license-plates.md) |
| `<liquidSimulation>` | плескание жидкости в ёмкости | [Спецификации → fill-unit](../specializations/fill-unit.md) |
| `<map>` | карта мода внутри `<maps>` | [modDesc → maps](../mod-desc/maps.md) |
| `<map>` | корень внешнего файла типов груза | [modDesc → fill-types](../mod-desc/fill-types.md) |
| `<mapHotspot>` | значок техники на карте | [Основа → map-hotspot](../base/map-hotspot.md) |
| `<maps>` | играбельные карты мода | [modDesc → maps](../mod-desc/maps.md) |
| `<material>` | подписка материала на выбранный цвет | [Основа → base-color-configurations](../base/base-color-configurations.md) |
| `<materialHolder>` | i3d-держатель именованных материалов | [modDesc → material-holders](../mod-desc/material-holders.md) |
| `<materialHolders>` | регистрация держателей материалов | [modDesc → material-holders](../mod-desc/material-holders.md) |
| `<materialTemplates>` | регистрация шаблонов материалов мода | [modDesc → material-templates](../mod-desc/material-templates.md) |
| `<mission>` | тип контракта в пуле техники | [modDesc → mission-vehicles](../mod-desc/mission-vehicles.md) |
| `<missionVehicles>` | пул техники для контрактов | [modDesc → mission-vehicles](../mod-desc/mission-vehicles.md) |
| `<modDesc>` | корень modDesc.xml (атрибут descVersion) | [modDesc → root](../mod-desc/root.md) |
| `<multiplayer>` | самодекларация MP-совместимости | [modDesc → multiplayer](../mod-desc/multiplayer.md) |
| `<objectChange>` | переключение узлов при выборе конфигурации | [Механизмы → vehicle-configurations](../concepts/vehicle-configurations.md) |
| `<output>` | выход ВОМ на стороне трактора | [Спецификации → power-take-offs](../specializations/power-take-offs.md) |
| `<page>` | страница внутри категории помощи | [modDesc → help-lines](../mod-desc/help-lines.md) |
| `<paragraph>` | абзац страницы помощи | [modDesc → help-lines](../mod-desc/help-lines.md) |
| `<parentFile>` | наследование XML от родительского файла | [Механизмы → parent-file](../concepts/parent-file.md) |
| `<placeableSpecializations>` | регистрация спек размещаемых объектов | [modDesc → placeable-specializations](../mod-desc/placeable-specializations.md) |
| `<placeableTypes>` | кастомные типы размещаемых объектов | [modDesc → placeable-types](../mod-desc/placeable-types.md) |
| `<powerTakeOffs>` | валы отбора мощности (ВОМ) | [Спецификации → power-take-offs](../specializations/power-take-offs.md) |
| `<remove>` | удаление элемента при наследовании | [Механизмы → parent-file](../concepts/parent-file.md) |
| `<schemaOverlay>` | силуэт техники в схеме навески | [Основа → schema-overlay](../base/schema-overlay.md) |
| `<set>` | изменение значения при наследовании | [Механизмы → parent-file](../concepts/parent-file.md) |
| `<size>` | габариты техники и смещения | [Основа → size](../base/size.md) |
| `<sizeMarkers>` | маркеры габаритов для ИИ | [Спецификации → ai](../specializations/ai.md) |
| `<sounds>` | ссылка на внешний файл звуков техники | [Основа → sounds](../base/sounds.md) |
| `<sourceFile>` | один глобальный Lua-скрипт | [modDesc → extra-source-files](../mod-desc/extra-source-files.md) |
| `<specialization>` | одна спека: name / className / filename | [modDesc → specializations](../mod-desc/specializations.md) |
| `<specializations>` | регистрация кастомных спек техники | [modDesc → specializations](../mod-desc/specializations.md) |
| `<species>` | вид дикой фауны | [modDesc → wildlife](../mod-desc/wildlife.md) |
| `<storeCategories>` | кастомные категории магазина (только DLC) | [modDesc → store-categories](../mod-desc/store-categories.md) |
| `<storeCategory>` | одна категория магазина | [modDesc → store-categories](../mod-desc/store-categories.md) |
| `<storeData>` | витрина предмета внутри его файла | [modDesc → store-items](../mod-desc/store-items.md) |
| `<storeItem>` | один товар мода | [modDesc → store-items](../mod-desc/store-items.md) |
| `<storeItems>` | товары мода в магазине | [modDesc → store-items](../mod-desc/store-items.md) |
| `<tailwaterDepth>` | пороги затопления машины: предупреждение и поломка | [Спецификации → water-seeding](../specializations/water-seeding.md) |
| `<template>` | шаблон материала: цвет sRGB + PBR | [Основа → materials-paint](../base/materials-paint.md) |
| `<text>` | инлайн-строка локализации | [modDesc → l10n](../mod-desc/l10n.md) |
| `<title>` | многоязычное название мода | [modDesc → title](../mod-desc/title.md) |
| `<type>` | тип внутри `<vehicleTypes>` / `<placeableTypes>` / `<handToolTypes>` | [modDesc → vehicle-types](../mod-desc/vehicle-types.md) |
| `<typeDesc>` | название типа техники в магазине | [Основа → type-desc](../base/type-desc.md) |
| `<uniqueType>` | тег взаимного исключения модов | [modDesc → unique-type](../mod-desc/unique-type.md) |
| `<vehicleTypes>` | кастомные типы техники | [modDesc → vehicle-types](../mod-desc/vehicle-types.md) |
| `<version>` | версия мода | [modDesc → version](../mod-desc/version.md) |
| `<volume>` | один объём внутри `<fillVolume>` | [Спецификации → fill-volume](../specializations/fill-volume.md) |
| `<washable>` | спека загрязнения и мойки | [Спецификации → washable](../specializations/washable.md) |
| `<waterSeeding>` | требование по воде для сеялки: запрещено или обязательно | [Спецификации → water-seeding](../specializations/water-seeding.md) |
| `<wearable>` | спека износа техники | [Спецификации → wearable](../specializations/wearable.md) |
| `<wildlife>` | дикая фауна мода | [modDesc → wildlife](../mod-desc/wildlife.md) |

---

## Темы без отдельного тега

| Тема | Что это | Страница |
|---|---|---|
| `<?xml … ?>` | объявление XML в начале каждого файла | [Механизмы → xml-declaration](../concepts/xml-declaration.md) |
| `<![CDATA[ … ]]>` | буквальный текст: спецсимволы, многострочность | [Механизмы → cdata](../concepts/cdata.md) |
| `<имя>Configurations` / `<имя>Configuration` | конфигурации техники в магазине (57 типов) | [Механизмы → vehicle-configurations](../concepts/vehicle-configurations.md) |
| `materialSlotName` | привязка материала к слоту модели | [Основа → materials-paint](../base/materials-paint.md) |
| `descVersion` | версия формата modDesc.xml | [modDesc → root](../mod-desc/root.md) |

---

## Если тега здесь нет

- **Поиск** (<kbd>Ctrl</kbd>+<kbd>K</kbd>) ищет по всему тексту страниц, включая таблицы атрибутов и
  примеры XML — по именам атрибутов (`useDeepMode`) и значениям (`DEFAULT_CULTIVATOR_WORK`) тоже.
- Блок может быть ещё не описан: справочник пополняется. Список разобранных блоков целиком виден в
  дереве навигации слева.
