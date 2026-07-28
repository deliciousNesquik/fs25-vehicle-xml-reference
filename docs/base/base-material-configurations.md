# Farming Simulator 2025
## Элемент `<baseMaterialConfigurations>`

```xml
<baseMaterialConfigurations price="100" useDefaultColors="false" defaultColorIndex="1">
    <baseMaterialConfiguration name="$l10n_Green" material="6" color="0.07 0.28 0.18"/>
    <baseMaterialConfiguration name="$l10n_Red"   material="6" color="0.7 0.07 0.05"/>
    <material name="Harrow_mat"  shaderParameter="colorMat0"/>
    <material name="Harrow_mat3" shaderParameter="colorMat0"/>
    <material name="Harrow_mat3" shaderParameter="colorMat1"/>
</baseMaterialConfigurations>
```

Блок выбора **основного цвета** техники в магазине (FS19/FS22-стиль). Содержит список выбираемых цветов
(`<baseMaterialConfiguration>`) и список материалов-подписчиков (`<material>`), которым выбранный цвет
записывается в указанный `colorMatN`.

> Расположение: блок техники `<vehicle.baseMaterialConfigurations>`. Раздел справочника — Base.
>
> Это форма FS22. В FS25 аналог — `<baseColorConfigurations>` с `materialTemplateName` (раздел 6).

---

## 1. Что это

Тип конфигурации — `baseMaterial`; путь блока — `vehicle.baseMaterialConfigurations`. При выборе цвета в
магазине движок берёт RGB и индекс типа краски выбранного `<baseMaterialConfiguration>` и записывает их в
`colorMatN` (см. [материалы и покраска](materials-paint.md)) на всех материалах из списка `<material>`.

---

## 2. Атрибуты контейнера

| Атрибут | Тип | По умолчанию | Описание |
|---|---|---|---|
| `price` | INT[^int] | `1000` | Наценка за каждый цвет (кроме дефолтного). |
| `useDefaultColors` | BOOL[^bool] | `false` | `true` — добавить к перечисленным ещё и **сток-палитру** игры (`g_vehicleColors`); `false` — показывать **только** перечисленные цвета. |
| `defaultColorIndex` | INT | — | Индекс предвыбранного/бесплатного цвета (`isDefault`, цена `0`). |

В FS22 у контейнера **нет** `title` и `defaultColorMaterialTemplateName` (последний — только FS25).

---

## 3. `<baseMaterialConfiguration>` — выбираемый цвет

| Атрибут | Тип | По умолчанию | Описание |
|---|---|---|---|
| `name` | L10N[^l10n] | — | Подпись цвета в UI (`$l10n_<ключ>`). |
| `color` | COLOR[^color] | `1 1 1 1` | RGB цвета → `colorMatN` `value[1..3]`. |
| `material` | INT | — | Индекс типа краски → `colorMatN` `value[4]` (финиш: глянец/мат/металлик…). |
| `uiColor` | COLOR | — | Опц. цвет образца-плитки в магазине (если отличается от `color`). |

Связь ключевая: `material` выбранного цвета становится **4-м компонентом** `colorMatN`, а `color` — его
RGB.

---

## 4. `<material>` — список подписчиков

Определяет, каким материалам i3d и в какой канал писать выбранный цвет:

| Атрибут | Тип | По умолчанию | Описание |
|---|---|---|---|
| `name` | STRING[^string] | — | Логическое имя материала (из [`<baseMaterial>`](materials-paint.md)). |
| `shaderParameter` | STRING | — | Канал записи: `colorMat0` / `colorMat1` / … |
| `color` / `material` | COLOR / INT | — | Опц. переопределение цвета/финиша именно для этого материала. |
| `useContrastColor` | BOOL | `false` | Записать контрастный (чёрный/белый) цвет вместо выбранного — для текста/логотипов. |
| `contrastThreshold` | FLOAT[^float] | `0.5` | Порог яркости для выбора контраста. |

При выборе цвета движок проходит по всем `<material>` и пишет цвет в соответствующий `colorMatN`. Один и
тот же материал может встречаться **несколько раз** с разными `shaderParameter` (например `colorMat0` и
`colorMat1`) — тогда он получает цвет в оба канала.

---

## 5. Аналогичные блоки

- **FS22:** `baseMaterialConfigurations`, `designMaterialConfigurations`, `designMaterial2Configurations`,
  `designMaterial3Configurations`, а также `baseColorConfigurations` (тип `baseColor`) и
  `rimColorConfigurations` (тип `rimColor`).
- **FS25:** `baseColorConfigurations`, `designColorConfigurations`, `designColor2…designColor16Configurations`,
  `rimColor` — все через класс `VehicleConfigurationItemColor` и шаблоны материалов.

---

## 6. FS22 vs FS25

- **FS22 (эта форма):** `<baseMaterialConfiguration>` = RGB + индекс краски (`material`); `<material>` =
  подписка на `colorMatN`. Обрабатывается спекой `BaseMaterial`.
- **FS25:** блок `<baseMaterialConfigurations>` **устаревший** — движок ремапит его на
  `designColorConfigurations`. Актуальные блоки — `<baseColorConfigurations>` /
  `<designColorConfigurations>` c `<baseColorConfiguration materialTemplateName= color=>` и списком
  `<material materialSlotName=>`; красится `colorScale` из шаблона (не `colorMatN`/индекс). Здесь
  `useDefaultColors="true"` дополнительно добавляет брендовые цвета **и свободный RGB-пикер** автоматически.

---

## 7. Типичные ошибки

- **Нет списка `<material>`** — цвета выбираются, но красить нечего (не заданы подписчики каналов).
- **`name` в `<material>` не совпадает** с логическим именем из `<baseMaterial>` — материал не найдётся.
- **Расчёт, что `useDefaultColors="false"` добавит сток-палитру** — наоборот, `false` показывает только
  перечисленные цвета.
- **`baseMaterialConfigurations` в FS25** — устарел; использовать `baseColorConfigurations` +
  `materialTemplateName`.

---

## 8. Примечания

- Контейнер: `price`/`useDefaultColors`/`defaultColorIndex`. Элементы: `<baseMaterialConfiguration>` (цвет
  + индекс краски) и `<material>` (подписка i3d-материала на `colorMatN`).
- `material` цвета → 4-й компонент `colorMatN` (финиш); `color` → RGB.
- Материал может подписаться на несколько каналов (несколько `<material>` с одним `name`).
- Форма FS22; в FS25 — `baseColorConfigurations` + шаблоны материалов (`colorScale`).
- Механика подтверждена по исходникам FS22 (`BaseMaterial.lua`, `ConfigurationUtil.lua`) и FS25
  (`VehicleConfigurationItemColor.lua`).

---

## Глоссарий

[^string]: STRING — строковый тип значения. <https://en.wikipedia.org/wiki/String_(computer_science)>
[^int]: INT — целочисленный тип. <https://en.wikipedia.org/wiki/Integer_(computer_science)>
[^bool]: BOOL — логический тип (`true`/`false`). <https://en.wikipedia.org/wiki/Boolean_data_type>
[^float]: FLOAT — число с плавающей точкой. <https://en.wikipedia.org/wiki/Floating-point_arithmetic>
[^color]: COLOR — цвет RGB(A), компоненты 0..1. <https://en.wikipedia.org/wiki/RGB_color_model>
[^l10n]: L10N — ключ локализации (`$l10n_<ключ>`), заменяется переведённой строкой. <https://en.wikipedia.org/wiki/Internationalization_and_localization>
