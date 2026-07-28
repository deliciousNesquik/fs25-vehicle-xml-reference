# Farming Simulator 2025
## Элемент `<baseColorConfigurations>`

```xml
<baseColorConfigurations title="$l10n_configuration_baseColor"
                         useDefaultColors="true"
                         defaultColorMaterialTemplateName="calibratedPaint"
                         price="150">
    <baseColorConfiguration name="$l10n_color_green" materialTemplateName="myBrandGreen" isDefault="true" price="0"/>
    <baseColorConfiguration name="$l10n_ui_colorBlack" color="0.02 0.02 0.02" price="250"/>

    <material materialSlotName="chassisPaint" targetMaterialSlotName="chassisPaint"/>
</baseColorConfigurations>
```

Блок выбора **основного цвета** техники в магазине. Содержит список выбираемых цветов
(`<baseColorConfiguration>`, каждый ссылается на шаблон материала или задаёт RGB) и список
материалов-подписчиков (`<material>`), которым выбранный цвет/финиш применяется по имени слота.

> Расположение: блок техники `<vehicle.baseColorConfigurations>`. Раздел справочника — Base.
>
> Загрузчик — класс `VehicleConfigurationItemColor`; та же структура у `designColorConfigurations`,
> `designColor2…designColor16Configurations`, `rimColorConfigurations`, `wrappingColorConfigurations`.

---

## 1. Что это

Путь блока — `vehicle.baseColorConfigurations`, элементы цвета —
`vehicle.baseColorConfigurations.baseColorConfiguration`, подписчики —
`vehicle.baseColorConfigurations.material`. При выборе цвета в магазине движок берёт шаблон материала
(или RGB) выбранного `<baseColorConfiguration>` и применяет его через список `<material>` к материалам с
соответствующим `materialSlotName` (механику покраски см. [материалы и покраска](materials-paint.md)).

---

## 2. Атрибуты контейнера

| Атрибут | Тип | По умолчанию | Описание |
|---|---|---|---|
| `title` | L10N[^l10n] | — | Название конфигурации в магазине. |
| `useDefaultColors` | BOOL[^bool] | `false` | `true` — добавить к перечисленным ещё и **стандартную палитру брендовых цветов** + свободный RGB-пикер. |
| `defaultColorMaterialTemplateName` | STRING[^string] | `calibratedPaint` | Базовый шаблон для дефолтных цветов и для элементов, у которых задан только `color`. |
| `defaultColorIndex` | INT[^int] | — | Индекс предвыбранного цвета на старте. |
| `price` | INT | `0` | Цена дефолтных цветов. |
| `isYesNoOption` | BOOL | `false` | Показать в магазине как переключатель да/нет. |
| `postLoadObjectChange` | BOOL | `false` | Применять `objectChange`-переходы после `postLoad`. |

---

## 3. `<baseColorConfiguration>` — выбираемый цвет

| Атрибут | Тип | По умолчанию | Описание |
|---|---|---|---|
| `name` | L10N | — | Подпись цвета в UI. |
| `materialTemplateName` | STRING | — | Имя [шаблона материала](materials-paint.md) (цвет + PBR-финиш). |
| `color` | STRING | `1 1 1 1` | Либо имя шаблона материала, либо литеральный RGB(A). |
| `uiColor` | COLOR[^color] | `1 1 1 1` | Цвет образца-плитки в магазине. |
| `isDefault` | BOOL | `false` | Выбран по умолчанию. |
| `isSelectable` | BOOL | `true` | Доступен для выбора в магазине. |
| `isMetallic` | BOOL | `false` | UI-флаг «металлик» (для фильтра/подписи). |
| `isMat` | BOOL | `false` | UI-флаг «матовый». |
| `price` | FLOAT[^float] | `0` | Цена этого цвета. |
| `saveId` | STRING | (номер) | Свой идентификатор для сейва. |

`color` и `materialTemplateName` **двойственны**: значение сначала ищется как имя шаблона материала
(`getMaterialTemplateColorAndTitleByName`); если шаблон найден — берутся его цвет/название, иначе строка
разбирается как RGB. Имя шаблона со словами `chrome`/`silver` автоматически проставляет
`isMetallic`/`uiColor`.

---

## 4. `<material>` — список подписчиков

Привязывает выбранный цвет/шаблон к конкретной геометрии по имени слота материала i3d:

| Атрибут | Тип | По умолчанию | Описание |
|---|---|---|---|
| `materialSlotName` | STRING | — | Имя слота материала в i3d, на который действует. |
| `materialTemplateName` | STRING | — | Шаблон для применения (автодополняется из `data/shared/brandMaterialTemplates.xml`). |
| `materialTemplateUseColorOnly` | BOOL | `false` | Взять из шаблона только цвет, финиш оставить из i3d. |
| `sourceMaterialSlotName` / `targetMaterialSlotName` | STRING | — | Заменить материал слота `target` материалом слота `source`. |
| `node` | NODE[^node] | — | Ограничить замену одним узлом. |
| `useBaseColor` / `useRimColor` | BOOL | `false` | Переиспользовать базовый / цвет дисков. |
| `useDesignColorIndex` | INT | — | Переиспользовать дизайн-цвет (индекс 1–16). |
| `useContrastColor` | BOOL | `false` | Записать контрастный цвет по яркости (текст/логотипы). |
| `contrastColorBright` / `contrastColorDark` | COLOR | `0.9 0.9 0.9` / `0 0 0` | Светлый/тёмный контраст. |
| `contrastThreshold` | FLOAT | `0.5` | Порог яркости для выбора контраста. |

Внутри `<material>` допустимы дочерние `<colorScale value>`, `<smoothness value>`, `<metalness value>`,
`<clearCoat intensity/smoothness>`, `<detail diffuse/normal/specular>`, `<textures diffuse/normal/specular>`
— точечные переопределения параметров/текстур.

В `onPostLoad` движок для каждого `<material>` строит объект `VehicleMaterial`, ставит шаблон/цвет и
применяет по `targetMaterialSlotName`. Без `<material>` (или без имени слота) цвет выбирается, но красить
нечего — в лог идёт предупреждение «Missing material slot name».

---

## 5. Аналогичные блоки

Через тот же класс `VehicleConfigurationItemColor` и с той же структурой:

- `designColorConfigurations` → `designColorConfiguration` (дизайн-цвет);
- `designColor2Configurations` … `designColor16Configurations` (доп. дизайн-цвета 2–16);
- `rimColorConfigurations` → `rimColorConfiguration` (диски);
- `wrappingColorConfigurations` → `wrappingColorConfiguration` (обмотка тюков).

---

## 6. Типичные ошибки

- **Нет `<material>`** — цвета выбираются, но красить нечего (не заданы подписчики слотов).
- **`materialSlotName` не совпадает** с именем слота в i3d — материал не находится (предупреждение в лог).
- **Расчёт, что `useDefaultColors="false"` добавит палитру** — наоборот, `false` показывает только
  перечисленные цвета.
- **RGB вместо шаблона** — литеральный `color` наследует финиш из `defaultColorMaterialTemplateName`;
  для нужного финиша задавать `materialTemplateName`.

---

## 7. Примечания

- Контейнер: `title`/`useDefaultColors`/`defaultColorMaterialTemplateName`/`defaultColorIndex`/`price`.
  Элементы: `<baseColorConfiguration>` (цвет/шаблон) и `<material>` (подписка слота материала).
- `color`/`materialTemplateName` — сначала как имя шаблона, иначе как RGB.
- Привязка к геометрии — по `materialSlotName`, финиш — из шаблона материала (`colorScale` + PBR).
- Одинаковая форма у `design*`/`rim*`/`wrapping*ColorConfigurations` (класс `VehicleConfigurationItemColor`).
- Поведение — по официальной схеме FS25 (`vehicle.xsd`) и движку (`VehicleConfigurationItemColor`,
  `VehicleMaterial`).

---

## Глоссарий

[^string]: STRING — строковый тип значения. <https://en.wikipedia.org/wiki/String_(computer_science)>
[^int]: INT — целочисленный тип. <https://en.wikipedia.org/wiki/Integer_(computer_science)>
[^bool]: BOOL — логический тип (`true`/`false`). <https://en.wikipedia.org/wiki/Boolean_data_type>
[^float]: FLOAT — число с плавающей точкой. <https://en.wikipedia.org/wiki/Floating-point_arithmetic>
[^color]: COLOR — цвет RGB(A), компоненты 0..1. <https://en.wikipedia.org/wiki/RGB_color_model>
[^node]: NODE — ссылка на узел i3d (имя i3d-маппинга или путь). <https://en.wikipedia.org/wiki/Scene_graph>
[^l10n]: L10N — ключ локализации (`$l10n_<ключ>`), заменяется переведённой строкой. <https://en.wikipedia.org/wiki/Internationalization_and_localization>
