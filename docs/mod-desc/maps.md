# Farming Simulator 2025
## Элемент `<maps>`

```xml
<maps>
    <map id="myMap" configFilename="maps/map.xml"
         defaultVehiclesXMLFilename="maps/defaultVehicles.xml"
         defaultPlaceablesXMLFilename="maps/defaultItems.xml"
         defaultItemsXMLFilename="maps/defaultItems.xml">
        <title>
            <en>My Map</en>
            <ru>Моя карта</ru>
        </title>
        <iconFilename>maps/mapIcon.dds</iconFilename>
    </map>
</maps>
```

Регистрирует **играбельную карту**, которую добавляет мод: она появляется в списке выбора карты при
создании новой игры. Каждый `<map>` задаёт идентификатор, конфиг карты, стартовый контент новой игры и
локализованные название/описание с иконкой-превью.

> Расположение: дочерний элемент `<modDesc>`. Раздел справочника — modDesc.

---

## 1. Что это

Карта — это отдельный мир (террейн, поля, окружение). `<maps>` перечисляет карты мода: движок при
загрузке modDesc регистрирует их в `g_mapManager`, и они появляются в экране выбора карты (создание
сейва). Один `<maps>`, внутри может быть несколько `<map>` (пак карт).

Читается у **всех** модов (не только DLC). Повторный `id` игнорируется с предупреждением.

---

## 2. Атрибуты и дочерние элементы `<map>`

| Атрибут/элемент | Тип | Обязателен | Описание |
|---|---|---|---|
| `id` | STRING[^string] | **да** | Уникальный идентификатор карты. У мода неймспейсится: `<modName>.<id>`. |
| `configFilename` | STRING | практически да | Путь к конфиг-XML карты (тот самый `<map>`-файл с i3d/террейном/окружением) — грузится при игре. Схемой как обязательный не проверяется, но без него играть нечем. |
| `defaultVehiclesXMLFilename` | STRING | **да** | Стартовая техника новой игры. |
| `defaultPlaceablesXMLFilename` | STRING | **да** | Стартовые размещаемые объекты новой игры. |
| `defaultItemsXMLFilename` | STRING | **да** | Стартовые предметы новой игры. |
| `defaultHandToolsXMLFilename` | STRING | нет | Стартовые ручные инструменты (добавлено в FS25). |
| `filename` | STRING | нет | Lua-файл класса миссии/карты. По умолчанию `$dataS/scripts/missions/mission00.lua`. |
| `className` | STRING | нет | Класс миссии/карты. По умолчанию `Mission00`. |
| `<title>` | L10N[^l10n] | **да** | Название карты в списке выбора (языковые дочерние). |
| `<description>` | L10N | нет | Описание карты. |
| `<iconFilename>` | STRING | **да** | Путь к иконке-превью карты (можно локализовать). |

**Обязательны** (иначе карта отбраковывается): `id`, `<title>`, `<iconFilename>`,
`defaultVehiclesXMLFilename`, `defaultPlaceablesXMLFilename`, `defaultItemsXMLFilename`. `configFilename`
нужен практически (грузится при игре), но жёсткой проверки на пустоту нет. `filename`/`className` —
единственные по-настоящему необязательные (есть дефолты).

---

## 3. Как загружается и появляется в игре

- При старте movDesc-скан читает `modDesc.maps.map` → `g_mapManager:loadMapFromXML(...)` → регистрация в
  `MapManager` (`self.maps` + индекс по `id`).
- Экран выбора карты (`MapSelectionScreen`) перечисляет зарегистрированные карты (базовые + модовые), где
  `isSelectable` истинно; выбор задаёт `mapId`, дальше — экран новой игры.
- Базовые карты грузятся из `dataS/maps.xml` (не из модов); подтверждённый базовый id — `MapUS`
  (Elmcreek). Остальные базовые id — в `dataS/maps.xml` (в открытые исходники не входит).

---

## 4. `id` и неймспейс

`id` обязателен и уникален. У карты **мода** он неймспейсится именем мода: `<modName>.<id>`; базовые карты
— голым id. По `id` карта выбирается и сохраняется в сейве.

---

## 5. `configFilename` — конфиг карты

`configFilename` указывает на **собственный XML карты** (корень `<map>`: ширина/высота, `imageFilename`,
террейн, окружение и т.п.). Именно он грузится, когда карту начинают играть. Директория этого файла
задаёт окружение мода (`customEnvironment`) для разрешения относительных путей ресурсов карты.

---

## 6. `filename` / `className` — свой класс карты

Необязательны. По умолчанию карта использует базовый `Mission00` (`$dataS/scripts/missions/mission00.lua`),
наследник `FSBaseMission`. Свой Lua-класс нужен, только если карта переопределяет логику миссии; тогда
`className` из мода автоматически неймспейсится. Большинство карт их не указывают.

---

## 7. `default*XMLFilename` — стартовый контент новой игры

`defaultVehiclesXMLFilename` / `defaultPlaceablesXMLFilename` / `defaultItemsXMLFilename` (и в FS25 —
`defaultHandToolsXMLFilename`) задают, что стоит на карте при **создании новой игры**. Они применяются
только для нового сейва (существующий сейв грузит своё сохранённое состояние). В FS22 первые три
**обязательны**.

---

## 8. Пример

```xml
<maps>
    <map id="myMap"
         configFilename="maps/map.xml"
         defaultVehiclesXMLFilename="maps/defaultVehicles.xml"
         defaultPlaceablesXMLFilename="maps/defaultItems.xml"
         defaultItemsXMLFilename="maps/defaultItems.xml">
        <title>
            <en>My Map</en>
            <de>Meine Karte</de>
            <ru>Моя карта</ru>
        </title>
        <description>
            <en>A custom map.</en>
            <ru>Пользовательская карта.</ru>
        </description>
        <iconFilename>maps/mapIcon.dds</iconFilename>
    </map>
</maps>
```

---

## 9. Типичные ошибки

- **Нет `id` / `<title>` / `<iconFilename>` / любого из трёх `default*XMLFilename`** — карта отбраковывается
  (в FS22 это жёсткая ошибка).
- **Пустой/неверный `configFilename`** — играть будет нечем (при игре грузится именно он); хотя жёсткой
  проверки на пустоту нет.
- **Повторный `id`** — вторая карта с тем же id игнорируется с предупреждением.
- **Свой `className` без файла/несуществующий класс** — карта не инициализируется; если своя логика не
  нужна, `filename`/`className` не указывать (сработает `Mission00`).
- **`default*` как «текущее состояние»** — это только стартовый набор новой игры; существующий сейв их не
  использует.

---

## 10. Примечания

- `<maps>` регистрирует карту в `g_mapManager`; она появляется в экране выбора карты (новая игра).
- `id` мода неймспейсится (`<modName>.<id>`); `configFilename` — конфиг карты, грузится при игре.
- `filename`/`className` необязательны (дефолт `Mission00`/`FSBaseMission`); нужны только для своей логики.
- `default*XMLFilename` — стартовый контент только для новой игры; FS25 добавил `defaultHandToolsXMLFilename`.
- `<title>`/`<description>`/`<iconFilename>` локализуемы (языковая модель — та же, что у
  [`<title>`](title.md)/[`<description>`](description.md) мода).
- Механика подтверждена по исходникам FS22 (`MapManager.lua`, `mission00.lua`, `MapSelectionScreen.lua`,
  `mods.lua`; движок общий с FS25). `defaultHandToolsXMLFilename` — из схемы FS25 (в FS22 отсутствует).
  Базовые карты — в `dataS/maps.xml` (в открытые исходники не входит; подтверждён id `MapUS`).

---

## Глоссарий

[^string]: STRING — строковый тип значения. <https://en.wikipedia.org/wiki/String_(computer_science)>
[^l10n]: L10N — локализованный текст (языковые дочерние элементы), текущий язык с фолбэком на en. <https://en.wikipedia.org/wiki/Internationalization_and_localization>
