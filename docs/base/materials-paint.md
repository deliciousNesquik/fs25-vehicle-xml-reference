# Farming Simulator 2025
## Материалы и покраска: `<baseMaterial>` / `<material>`

```xml
<baseMaterial>
    <material name="Harrow_mat" baseNode="1>0">
        <shaderParameter name="colorMat0" value="0.07 0.28 0.18" material="6"/>
    </material>
</baseMaterial>
```

Задаёт покраску частей техники: привязывает логический материал к материалу i3d и записывает в него
параметр шейдера цвета. В FS22 цвет несёт параметр `colorMatN` (VEC4: RGB + индекс типа краски); в FS25
эта система заменена **шаблонами материалов** (`colorScale` + PBR, см. раздел 5).

> Расположение: блок техники `<vehicle.baseMaterial>`. Раздел справочника — Base.

---

## 1. `<baseMaterial>` и `<material>`

Путь — `vehicle.baseMaterial.material(?)`. Каждый `<material>` описывает один окрашиваемый материал:

| Атрибут | Тип | Описание |
|---|---|---|
| `name` | STRING[^string] | Логическое имя материала (валидное индекс-имя). Используется как ссылка из блоков конфигурации цвета. Может **не совпадать** с внутренним именем материала i3d. |
| `baseNode` | NODE[^node] | Узел-образец (путь вида `1>0` = компонент 1, ребёнок 0). Должен быть SHAPE. Движок берёт `getMaterial(baseNode, 0)` — этот материал i3d и будет патчиться. |

Внутри — один или несколько `<shaderParameter>` (без него запись отклоняется):

| Атрибут | Тип | Описание |
|---|---|---|
| `name` | STRING | Имя параметра шейдера (`colorMat0`, `colorMat1`…). |
| `value` | COLOR[^color] | Цвет RGB (компоненты `value[1..3]`). |
| `material` | INT[^int] | Индекс типа краски (`value[4]`, см. раздел 3). |

**Применение:** движок рекурсивно обходит дерево узлов; для каждого SHAPE, чей материал совпадает с
образцом (`getMaterial(node,0) == materialId`) и у которого есть указанный параметр шейдера, вызывает
`setShaderParameter(node, name, r, g, b, materialIndex, false)`. То есть один `<material>` перекрашивает
**все** вхождения этого материала i3d по технике.

---

## 2. Пример из практики

```xml
<baseMaterial>
    <material name="Harrow_mat" baseNode="1>0">
        <shaderParameter name="colorMat0" value="0.07 0.28 0.18" material="6"/>
    </material>
</baseMaterial>
```

Здесь материал i3d, взятый с узла `1>0`, красится в RGB `(0.07, 0.28, 0.18)` с типом краски `6` через
канал `colorMat0`.

---

## 3. `colorMatN` — VEC4 и «4-й компонент»

Параметры `colorMat0`, `colorMat1`, `colorMat2`, `colorMat3` — векторы из 4 чисел:

- `value[1..3]` — **RGB** (цвет, линейный 0..1);
- `value[4]` — **целочисленный индекс типа краски** (не альфа!): выбирает финиш из массива красок
  шейдера техники (глянец/мат/металлик/хром/пластик и т.п.). Например индексы металликов — `{2, 3, 19,
  30, 31, 35}`.

**Как задаётся 4-й компонент:** из атрибута `material` (INT), если он есть; иначе берётся текущее
«запечённое» значение `w` с узла (из i3d); иначе `1`. Надёжный способ выбрать финиш — атрибут `material`
(число 4-м в `value` при отсутствии `material` перекрывается запечённым `w`).

**Слоты (конвенция):** `colorMat0` — основной/базовый цвет, `colorMat1` — второй/дизайн-цвет,
`colorMat2` — декали, `colorMat3` — доп. дизайн-канал. Диски/ступицы перебирают `colorMat0..7`.

**Подписка меша на канал** задаётся в i3d: материал получает цвет через `colorMatN` только если он
объявляет этот параметр шейдера (проверка `getHasShaderParameter`). Т.е. какие детали красятся базовым
цветом, а какие — дизайн-цветом, решается на этапе моделирования (какой `colorMatN` выставлен у материала).

---

## 4. Дефолтные «методы» покраски (типы конфигураций)

Покраска в магазине идёт через типы конфигураций цвета:

| Тип (FS22) | Что красит | XML-блок |
|---|---|---|
| `baseMaterial` (= baseColor) | основной цвет | `vehicle.baseMaterialConfigurations` |
| `designMaterial` / `designMaterial2` / `designMaterial3` | дизайн-цвета | `vehicle.designMaterial…Configurations` |
| `rimColor` | диски/колёса | `vehicle.rimColorConfigurations` |

В FS25 типы: `baseColor`, `designColor`, `designColor2…designColor16`, `rimColor`, `wrappingColor` (обмотка
тюков); диски — через `rimMaterialTemplateName` у `WheelVisual`. См. [`<baseMaterialConfigurations>`](base-material-configurations.md).

---

## 5. FS22 vs FS25 — важное различие

- **FS22:** покраска — `colorMatN` (RGB + индекс типа краски). `<baseMaterial>`/`<material>` и
  `baseMaterialConfigurations` — рабочие.
- **FS25:** система заменена **шаблонами материалов** (`materialTemplate`): красится параметр `colorScale`
  (RGB) + PBR-параметры `smoothnessScale`/`metalnessScale`/`clearCoatSmoothness`/`clearCoatIntensity`/
  `porosity` из шаблона (`data/shared/brandMaterialTemplates.xml`), применяется по `materialSlotName`.
  Финиш кодируется значениями шаблона, а не целым индексом. Блок `<baseMaterial>` в FS25 **устаревший** —
  движок выдаёт предупреждения и ремапит его на систему `designColorConfigurations`/шаблонов. См.
  [`<materialTemplates>`](../mod-desc/material-templates.md).

---

## 6. Типичные ошибки

- **`baseNode` не SHAPE** — образец материала не считается; запись отклоняется.
- **`name` = имя материала i3d** по ошибке — `name` это логическое индекс-имя (ссылка из конфигов), не
  обязано совпадать с именем материала i3d.
- **Финиш задан 4-м числом в `value` без `material`** — перекрывается запечённым `w`; использовать
  атрибут `material`.
- **Меш не реагирует на цвет** — у его материала i3d не объявлен нужный `colorMatN` (задаётся в редакторе).
- **Расчёт на `<baseMaterial>` в FS25** — устарел; там шаблоны материалов (`colorScale`).

---

## 7. Примечания

- `<baseMaterial>`/`<material>` (`vehicle.baseMaterial.material`) — отдельно от блоков конфигурации цвета
  (`vehicle.baseMaterialConfigurations`).
- `colorMatN` — VEC4: RGB + индекс типа краски (`value[4]`); слоты `colorMat0..3` (базовый/дизайн/декали/доп).
- Один `<material>` перекрашивает все вхождения материала-образца по технике.
- FS25 заменил `colorMatN`/индекс на шаблоны материалов (`colorScale` + PBR), `<baseMaterial>` устарел.
- Механика подтверждена по исходникам FS22 (`MaterialUtil.lua`, `BaseMaterial.lua`, `BrandColorManager.lua`,
  `ConfigurationUtil.lua`) и FS25 (`VehicleMaterial.lua`, `VehicleConfigurationItemColor.lua`).

---

## Глоссарий

[^string]: STRING — строковый тип значения. <https://en.wikipedia.org/wiki/String_(computer_science)>
[^int]: INT — целочисленный тип. <https://en.wikipedia.org/wiki/Integer_(computer_science)>
[^color]: COLOR — цвет RGB(A), компоненты 0..1. <https://en.wikipedia.org/wiki/RGB_color_model>
[^node]: NODE — ссылка на узел i3d (имя i3d-маппинга или путь `компонент>ребёнок|ребёнок`). <https://en.wikipedia.org/wiki/Scene_graph>
