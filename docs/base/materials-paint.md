# Farming Simulator 2025
## Материалы и покраска: шаблоны материалов

```xml
<!-- modDesc: свой шаблон материала (регистрируется в общий реестр) -->
<materialTemplates>
    <template name="myBrandGreen" parentTemplate="calibratedPaint" title="$l10n_color_green"
              colorScale="0.07 0.28 0.18" smoothnessScale="0.6" metalnessScale="0"
              clearCoatSmoothness="0" clearCoatIntensity="0" porosity="0"/>
</materialTemplates>
```

Покраска техники в FS25 идёт через **шаблоны материалов** (`materialTemplate`). Шаблон задаёт цвет
(`colorScale`, sRGB) и PBR-финиш (гладкость/металличность/лак/пористость), а к геометрии он применяется по
**имени слота материала** (`materialSlotName`) i3d. Выбор конкретного шаблона в магазине описывается
блоками конфигурации цвета (`<baseColorConfigurations>` и родственные, см. раздел 5).

> Расположение: реестр шаблонов — `data/shared/brandMaterialTemplates.xml`; свои шаблоны мод добавляет
> через [`<materialTemplates>`](../mod-desc/material-templates.md) в `modDesc`. Раздел справочника — Base.

---

## 1. Как устроена покраска

Три части системы:

1. **Шаблон материала** (`<template>`) — именованный набор «цвет + финиш» (раздел 2).
2. **Применение к мешу** — движок (`VehicleMaterial`) находит SHAPE-узлы с нужным `materialSlotName` и
   пишет параметры шейдера из шаблона (раздел 3–4).
3. **Выбор в магазине** — блоки `<...ColorConfigurations>` предлагают список шаблонов/цветов и через
   `<material>` привязывают выбранное к слотам (раздел 5).

Ни один шаг не использует старые `colorMatN`/`<baseMaterial>` — они удалены из FS25 (раздел 7).

---

## 2. Шаблон материала (`<template>`)

Реестр `templates` (`data/shared/brandMaterialTemplates.xml` + `defaultMaterialTemplates`); свои шаблоны
добавляются `<materialTemplates>` в `modDesc` (имя неймспейсится префиксом мода). Поля `<template>`:

| Атрибут | Тип | Описание |
|---|---|---|
| `name` | STRING[^string] | Имя шаблона (реестр хранит в верхнем регистре; у модов — с префиксом окружения). |
| `parentTemplate` | STRING | Родительский шаблон; незаданные поля наследуются от него. Нерезолвленный родитель — предупреждение и пропуск. |
| `title` | L10N[^l10n] | Отображаемое имя цвета в магазине. |
| `brand` | STRING | Идентификатор бренда шаблона. |
| `colorScale` | VEC3[^vec3] | **Цвет (sRGB)**, 3 компонента. |
| `smoothnessScale` | FLOAT[^float] | Гладкость. |
| `metalnessScale` | FLOAT | Металличность. |
| `clearCoatSmoothness` | FLOAT | Гладкость лака (clear coat). |
| `clearCoatIntensity` | FLOAT | Интенсивность лака. |
| `porosity` | FLOAT | Пористость. |
| `detailDiffuse` / `detailNormal` / `detailSpecular` | STRING | Детальные текстуры (заданы здесь или у родителя). |
| `colorScan#filename` + `#channelR/G/B/Smoothness/Metalness` | — | Калибровочные данные DCC. |
| `usage` / `category` / `iconFilename` | — | Метаданные для инструментов. |

Наследование через `parentTemplate`: поле, не заданное в шаблоне, берётся из родителя; если и там нет —
жёсткий дефолт (`colorScale` → `1 1 1`, `smoothnessScale`/`metalnessScale` → `1`, лак/пористость → `0`,
детальные текстуры → библиотека `data/shared/detailLibrary/nonMetallic/default_*`).

---

## 3. Как шаблон ложится на меш (`materialSlotName`)

`VehicleMaterial:apply(node, targetMaterialSlotName)` обходит дерево SHAPE-узлов; для каждого перебирает
материалы (`getNumOfMaterials`) и сверяет `getMaterialSlotName(node, i)` с целевым именем слота. Материал
патчится, **только если имя слота совпадает** с `targetMaterialSlotName` (или цель не задана — тогда все
материалы узла).

Из этого следует: какие детали красятся каким цветом — определяется **именем слота материала**, заданным
в i3d при моделировании (GIANTS Editor). Свободных «каналов» вроде старых `colorMat0..3` нет — привязка
идёт по стабильному строковому имени слота.

---

## 4. Параметры шейдера покраски

`VehicleMaterial:applyToMaterial` пишет параметры шейдера из шаблона (`setShaderParameter`) в таком
порядке:

| Параметр шейдера | Из поля шаблона | Смысл |
|---|---|---|
| `colorScale` | `colorScale` (VEC3, sRGB) | Базовый цвет. |
| `smoothnessScale` | `smoothnessScale` | Гладкость поверхности. |
| `metalnessScale` | `metalnessScale` | Металличность. |
| `clearCoatSmoothness` | `clearCoatSmoothness` | Гладкость лака. |
| `clearCoatIntensity` | `clearCoatIntensity` | Интенсивность лака. |
| `porosity` | `porosity` | Пористость. |

Дополнительно при необходимости подменяются текстуры (детальные `detail*`, базовые diffuse/normal/gloss)
через `setMaterialCustomMapFromFile`/`setMaterial*MapFromFile`. Если у `<material>`-подписчика (раздел 5)
стоит флаг «только цвет» — пишется лишь `colorScale`, остальной финиш остаётся из i3d.

---

## 5. Типы конфигураций цвета

Выбор цвета в магазине описывается блоками, которые все загружает класс `VehicleConfigurationItemColor`:

| Блок | Что красит |
|---|---|
| `baseColorConfigurations` | основной цвет |
| `designColorConfigurations` | дизайн-цвет |
| `designColor2Configurations` … `designColor16Configurations` | доп. дизайн-цвета (2–16) |
| `rimColorConfigurations` | диски/колёса |
| `wrappingColorConfigurations` | обмотка тюков |

Все они имеют одинаковую структуру: контейнер с общими атрибутами, список выбираемых цветов
(`<...Configuration>`) и список `<material>`-подписчиков, привязывающих выбор к слотам материалов.
Подробно — [`<baseColorConfigurations>`](base-color-configurations.md).

---

## 6. Типичные ошибки

- **Меш не красится** — у его материала в i3d не задан ожидаемый `materialSlotName`, либо имя слота не
  совпадает с `materialSlotName`/`targetMaterialSlotName` из `<material>` (в лог — «Failed to find
  material by material slot name»).
- **`colorScale` в линейном пространстве** — значение задаётся в **sRGB**, не в линейном RGB.
- **Ставка на старые блоки** — `<baseMaterial>`/`<baseMaterialConfigurations>`/`colorMatN` в FS25 удалены
  (раздел 7); использовать шаблоны материалов и `<...ColorConfigurations>`.
- **Незаданный `parentTemplate` при частичном шаблоне** — недостающие поля уйдут в жёсткие дефолты
  (белый цвет, полная гладкость/металличность), а не в ожидаемый финиш.

---

## 7. Примечания

- Покраска = шаблон материала (`colorScale` sRGB + PBR: `smoothnessScale`/`metalnessScale`/
  `clearCoatSmoothness`/`clearCoatIntensity`/`porosity`), применяемый по `materialSlotName`.
- Привязка к геометрии — по имени слота материала i3d, а не по номерному каналу.
- Выбор цвета в магазине — `<...ColorConfigurations>` (`VehicleConfigurationItemColor`); см.
  [`<baseColorConfigurations>`](base-color-configurations.md).
- Устаревшие блоки: `vehicle.baseMaterial`, `vehicle.baseMaterialConfigurations`,
  `designMaterial…Configurations` и параметр `colorMatN` в FS25 **удалены из схемы** и лишь ремапятся
  загрузчиком (`baseMaterialConfigurations`/`designMaterial…` → `designColorConfigurations`) с
  предупреждением; в новых модах не применяются.
- Поведение — по официальной схеме FS25 (`vehicle.xsd`) и движку (`VehicleMaterial`,
  `VehicleMaterialManager`, `VehicleConfigurationItemColor`).

---

## Глоссарий

[^string]: STRING — строковый тип значения. <https://en.wikipedia.org/wiki/String_(computer_science)>
[^float]: FLOAT — число с плавающей точкой. <https://en.wikipedia.org/wiki/Floating-point_arithmetic>
[^vec3]: VEC3 — вектор из трёх чисел (здесь — цвет sRGB). <https://en.wikipedia.org/wiki/Euclidean_vector>
[^l10n]: L10N — ключ локализации (`$l10n_<ключ>`), заменяется переведённой строкой. <https://en.wikipedia.org/wiki/Internationalization_and_localization>
