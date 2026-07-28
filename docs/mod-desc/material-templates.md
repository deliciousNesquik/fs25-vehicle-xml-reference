# Farming Simulator 2025
## Элемент `<materialTemplates>`

```xml
<materialTemplates>
    <template name="GMNG_HELLABLACK" title="$l10n_color_hellaBlack" colorScale="0 0 0" parentTemplate="calibratedPaint"/>
</materialTemplates>
```

Объявляет **шаблоны материалов/цветов** — краски и материалы, доступные при выборе цвета в магазине.
Каждый `<template>` — именованный набор: цвет (`colorScale`, sRGB), PBR-параметры блеска/металличности и
детальные текстуры. На шаблон ссылаются по имени конфигурации цвета техники, диски, детали.

> Расположение: дочерний элемент `<modDesc>`. Раздел справочника — modDesc.
>
> Шаблоны материалов (`materialTemplate`) задают именованные наборы PBR-параметров покраски, на которые
> ссылаются по имени.

---

## 1. Что это

Материал-шаблон — это общий «материал по имени»: сам цвет плюс параметры шейдера (гладкость,
металличность, лак, пористость) и детальные карты. Игра держит базовый набор (краски и цвета брендов);
`<materialTemplates>` добавляет свои. Шаблоны регистрируются в **общем реестре**
(`VehicleMaterialManager`, синглтон `g_vehicleMaterialManager`) — вместе с базовыми и брендовыми — и
доступны технике по имени.

Читается у **всех** модов (не только DLC); базовые файлы шаблонов грузятся первыми, затем — из модов.

---

## 2. Контейнер `<materialTemplates>`

| Атрибут | Тип | Читается движком | Описание |
|---|---|---|---|
| `parentTemplateDefault` | STRING[^string] | да | Родитель по умолчанию для шаблонов блока, у которых не задан `parentTemplate`. Для модов запасное значение — `metalPainted`. |
| `id` | STRING | нет | Идентификатор файла — метаданные авторинга, в рантайме не используется. |
| `name` | STRING | нет | Имя файла — метаданные, в рантайме не используется. |
| `parentTemplateFilename` | STRING | нет | Путь к файлу родительских шаблонов — метаданные; наследование работает и без него (базовые файлы уже загружены). |

Реальные моды обычно пишут просто `<materialTemplates>` без атрибутов контейнера.

---

## 3. Атрибуты `<template>`

| Атрибут | Тип | Читается | Описание |
|---|---|---|---|
| `name` | STRING | да | Идентификатор шаблона (приводится к ВЕРХНЕМУ регистру; у мода неймспейсится — раздел 5). |
| `title` | L10N[^l10n] | да | Название цвета в магазине (`$l10n_<ключ>`; к нему добавляется название бренда). |
| `colorScale` | VEC3 | да | Сам цвет, sRGB (`r g b`, значения 0..1). |
| `smoothnessScale` | FLOAT[^float] | да | Гладкость (шейдер). По умолчанию `1`. |
| `metalnessScale` | FLOAT | да | Металличность. По умолчанию `1`. |
| `clearCoatIntensity` | FLOAT | да | Интенсивность лака. По умолчанию `0`. |
| `clearCoatSmoothness` | FLOAT | да | Гладкость лака. По умолчанию `0`. |
| `porosity` | FLOAT | да | Пористость. По умолчанию `0`. |
| `detailDiffuse` / `detailNormal` / `detailSpecular` | STRING | да | Детальные текстуры (путь относительно мода). Если ни шаблон, ни родитель их не задают — загрузка шаблона прерывается. |
| `brand` | STRING | да | Бренд (по имени); его название добавляется в подпись цвета. |
| `parentTemplate` | STRING | да | Родительский шаблон, от которого наследуются незаданные поля (раздел 4). |
| `usage` | INT[^int] | нет | Категория/слот цвета — метаданные, в рантайме инертно. |
| `description` | STRING | нет | Описание — метаданные. |
| `category` / `iconFilename` | STRING | нет | Только для DCC-инструмента; в рантайме не используются. |

Дочерний `<colorScan filename channelR channelG channelB channelMetalness channelSmoothness>` — средство
**авторинга** (калибровка по скану-образцу); движок его **не читает** (инертно в рантайме).

Значения `colorScale`/PBR применяются как одноимённые параметры шейдера, детальные карты — через
`setMaterialCustomMapFromFile`.

---

## 4. Наследование через `parentTemplate`

`parentTemplate` указывает уже загруженный шаблон (базовый или из ранее загруженного файла). Наследование
**по полям**: любое незаданное поле (`colorScale`, PBR, детальные карты) берётся у родителя. Если у
`<template>` нет `parentTemplate`, берётся `parentTemplateDefault` контейнера, а для модов — `metalPainted`.

Так мод задаёт только цвет (`colorScale`) и наследует «отделку» (глянец/мат/металлик) от базового
шаблона-родителя. Типовые базовые родители: `calibratedPaint`, `calibratedMatPaint`,
`calibratedMetallicPaint`, `metalPainted`, `metalPaintedOld`, `metalGalvanized`, `plasticPaintedBlack`,
`palladiumScratched`.

---

## 5. Имя и неймспейс

- `name` приводится к верхнему регистру. У шаблона мода имя **неймспейсится** окружением мода
  (`MODNAME.NAME`); базовые шаблоны — голым именем.
- При поиске движок сначала пробует `MODNAME.NAME`, затем голое имя. Поэтому **внутри своего мода** на
  свой шаблон ссылаются голым именем (движок подставит префикс), а на базовые/брендовые — голым глобальным
  именем. Свои имена принято префиксовать (`GMNG_…`, `BEDNAR_…`) во избежание путаницы.
- Повторное объявление того же (полного) имени не ошибка — поля перезаписываются на месте.

---

## 6. Как техника ссылается на шаблон

В XML техники — конфигурации цвета, каждая перечисляет варианты по имени шаблона и привязывается к
материалу меша:

```xml
<baseColorConfigurations useDefaultColors="true" defaultColorMaterialTemplateName="metalGalvanized">
    <baseColorConfiguration materialTemplateName="GMNG_HELLABLACK" isDefault="true"/>
    <baseColorConfiguration materialTemplateName="BEDNAR_RED1"/>
    <material materialSlotName="mmMainBody_mat"/>
</baseColorConfigurations>
```

Есть аналогичные `<designColorConfigurations>` / `<designColor2Configurations>`. Тот же реестр шаблонов
используют и другие места: диски (`<rimMaterial materialTemplateName="…"/>`), детали навески (по
`materialTemplateName`). Ключевой атрибут ссылки — `materialTemplateName`.

---

## 7. Примеры

Свои цвета мода (реальный мод FS25_BednarBatWing): только `colorScale` + наследование отделки:

```xml
<materialTemplates>
    <template name="GMNG_HELLABLACK"          title="$l10n_color_hellaBlack"          colorScale="0 0 0" parentTemplate="calibratedPaint"/>
    <template name="GMNG_HELLABLACK_MATTE"    title="$l10n_color_hellaBlack_matte"    colorScale="0 0 0" parentTemplate="calibratedMatPaint"/>
    <template name="GMNG_HELLABLACK_METALLIC" title="$l10n_color_hellaBlack_metallic" colorScale="0 0 0" parentTemplate="calibratedMetallicPaint"/>
    <template name="GMNG_HELLABLACK_GALVANIZED" title="$l10n_color_hellaBlack_galvanized" colorScale="0 0 0" parentTemplate="metalGalvanized"/>
</materialTemplates>
```

Структура базового брендового шаблона (для сравнения — с `brand`/`usage`/`smoothnessScale`):

```xml
<template name="ALBUTT_RED1" brand="ALBUTT" title="$l10n_ui_colorRed" usage="15" colorScale="0.9390 0.0000 0.0090" smoothnessScale="1.0000"/>
```

---

## 8. Типичные ошибки

- **`parentTemplate` на несуществующий шаблон** — шаблон пропускается с предупреждением.
- **Нет детальных карт ни у шаблона, ни у родителя** — загрузка шаблона прерывается; поэтому обычно
  наследуют базовый родитель, у которого они есть.
- **Расчёт на `usage`/`category`/`iconFilename`/`<colorScan>` в рантайме** — это авторинг-метаданные,
  движок их не применяет.
- **Строчные буквы в `name`** — имя приводится к верхнему регистру; ссылки резолвятся по верхнему.
- **Ссылка `materialTemplateName` на неопределённый шаблон** — если он не базовый и не объявлен, цвет не
  подхватится.
- **Ожидание, что блок только для DLC** — нет, читается у всех модов.

---

## 9. Примечания

- Элемент FS25; шаблоны — общий реестр `g_vehicleMaterialManager` (базовые + брендовые + модовые).
- `colorScale` — сам цвет (sRGB); PBR-поля и детальные карты идут в шейдер; часть атрибутов — только для
  авторинга (`usage`, `description`, `category`, `iconFilename`, `<colorScan>`).
- Наследование по полям через `parentTemplate` (мод задаёт цвет, наследует отделку).
- Имя мода неймспейсится (`MODNAME.NAME`); внутри мода ссылаются голым именем, на базовые — голым
  глобальным.
- Техника ссылается через `materialTemplateName` в конфигурациях цвета (и у дисков/деталей).
- Базовые шаблоны — в `$data/shared/brandMaterialTemplates.xml` (цвета брендов) и файле общих отделок
  (`calibratedPaint`, `metalPainted`, …); в открытые исходники не входят — из кода подтверждены
  `metalPainted` и `calibratedPaint`.
- Механика подтверждена по исходникам FS25 (`VehicleMaterialManager.lua`, `VehicleMaterial.lua`,
  `VehicleConfigurationItemColor.lua`) и реальными модами (FS25_BednarBatWing, FS25_FarmFillStations).

---

## Глоссарий

[^string]: STRING — строковый тип значения. <https://en.wikipedia.org/wiki/String_(computer_science)>
[^float]: FLOAT — число с плавающей точкой. <https://en.wikipedia.org/wiki/Floating-point_arithmetic>
[^int]: INT — целочисленный тип. <https://en.wikipedia.org/wiki/Integer_(computer_science)>
[^l10n]: L10N — ключ локализации (`$l10n_<ключ>`), заменяется переведённой строкой. <https://en.wikipedia.org/wiki/Internationalization_and_localization>
