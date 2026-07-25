# Farming Simulator 2025
## Элемент `<placeableSpecializations>`

```xml
<placeableSpecializations>
    <specialization name="bigDisplay"
                    className="BigDisplaySpecialization"
                    filename="scripts/bigDisplaySpecialization.lua"/>
</placeableSpecializations>
```

Регистрирует **кастомные спецификации размещаемых объектов** (placeable — статичные объекты мира:
постройки, силосы, навесы, загоны, производства, декор) — Lua-скрипты, добавляющие объекту новое
поведение. Полный аналог `<specializations>`, но для класса `Placeable` вместо `Vehicle`. Блок только
объявляет спеку движку; чтобы она заработала, её отдельно добавляют к типу объекта (см. раздел 6 и
страницу [placeableTypes](placeable-types.md)).

> Расположение: дочерний элемент `<modDesc>`. Раздел справочника — modDesc.

---

## 1. Что это

Спецификация (specialization) — модуль поведения объекта в FS. `<placeableSpecializations>`
перечисляет собственные спеки мода для размещаемых объектов: даёт каждой имя, указывает её класс и файл.
При загрузке мода движок регистрирует эти спеки и делает их доступными для добавления к типам placeable.

Движок использует для этого тот же общий менеджер спецификаций, что и для техники
(`SpecializationManager`), только для домена «placeable» — синглтон `g_placeableSpecializationManager`.
Отличается только домен; сам механизм регистрации идентичен `<specializations>`.

---

## 2. Атрибуты `<specialization>`

Все три обязательны.

| Атрибут | Тип | Обязателен | Описание |
|---|---|---|---|
| `name` | STRING[^string] | да | Имя спеки. Регистрируется с префиксом мода: `<modName>.<name>`. |
| `className` | STRING | да | Имя глобальной Lua-таблицы (класса) спеки. Регистрируется как `<modName>.<className>`. |
| `filename` | STRING | да | Путь к `.lua`-файлу спеки, относительно корня мода. |

`<placeableSpecializations>` необязателен (`minOccurs="0"`), один; `<specialization>` внутри может быть
несколько.

---

## 3. Что задаёт каждый атрибут

- **`name`** — короткое имя спеки. Движок регистрирует её под именем с префиксом мода:
  `<modName>.<name>`. По этому имени спеку добавляют к типам объектов, а внутри объекта её данные
  лежат в таблице `self["spec_<modName>.<name>"]`.
- **`className`** — имя **глобальной таблицы** Lua, объявленной в файле спеки. Поскольку файл лежит в
  моде, класс регистрируется с префиксом окружения мода: `<modName>.<className>`.
- **`filename`** — путь к файлу скрипта от корня мода. Файл загружается при регистрации.

---

## 4. Что происходит при загрузке

При загрузке мода движок для каждого `<specialization>`:

1. Загружает файл `filename` (в нём должна появиться глобальная таблица `className`).
2. Регистрирует спеку под именем `<modName>.<name>` в `g_placeableSpecializationManager`.

После этого спека **доступна**, но ещё ни к какому типу объектов не привязана.

---

## 5. Что содержит класс спеки

Таблица `className` реализует стандартный интерфейс спецификации FS (детали — уже область
скриптинга): проверку предпосылок (`prerequisitesPresent`), регистрацию слушателей событий
(`registerEventListeners`), при необходимости — регистрацию функций и перезаписей
(`registerFunctions`, `registerOverwrittenFunctions`), регистрацию путей XML
(`registerXMLPaths` — под общей схемой `placeable`), инициализацию (`initSpecialization`), и сами
обработчики (`onLoad`, `onFinalizePlacement`, `onDelete` и т.п.). Данные экземпляра спека хранит в
`self["spec_<modName>.<name>"]`.

---

## 6. Регистрация ≠ использование

Объявление в `<placeableSpecializations>` только **регистрирует** спеку. Чтобы она реально применилась
к объекту, её надо **добавить к типу** одним из способов:

- **Декларативно** — объявить кастомный тип объекта в [`<placeableTypes>`](placeable-types.md),
  перечислив в нём эту спеку (по имени `<modName>.<name>`), и указывать этот тип в XML объекта
  (`<placeable type="...">`).
- **Кодом** — прикрепить спеку к существующим типам через хук менеджера типов
  (`TypeManager.validateTypes` → `addSpecialization`).

Если этого не сделать, скрипт будет зарегистрирован, но не выполнится ни на одном объекте.

Мод может **и не объявлять** своих типов — тогда спеки либо внедряются в существующие типы кодом, либо
предлагаются другим модам как переиспользуемые (тогда сторонний мод подключает спеку в своём
`<placeableTypes>` полным именем `<modEnvName>.<specName>`).

---

## 7. Примеры

Одна своя спека (регистрируется в моде, затем включается в собственный тип):

```xml
<placeableSpecializations>
    <specialization name="bigDisplay" className="BigDisplaySpecialization" filename="scripts/bigDisplaySpecialization.lua"/>
</placeableSpecializations>
```

Набор спек без собственных типов (спеки внедряются в существующие типы кодом либо предлагаются другим
модам — так manureSystem регистрирует десяток спек; здесь фрагмент):

```xml
<placeableSpecializations>
    <specialization name="manureSystemPlaceableSilo" className="ManureSystemPlaceableSilo" filename="src/placeables/specializations/ManureSystemPlaceableSilo.lua"/>
    <specialization name="manureSystemPlaceableHusbandry" className="ManureSystemPlaceableHusbandry" filename="src/placeables/specializations/ManureSystemPlaceableHusbandry.lua"/>
    <specialization name="manureSystemPlaceableProductionPoint" className="ManureSystemPlaceableProductionPoint" filename="src/placeables/specializations/ManureSystemPlaceableProductionPoint.lua"/>
</placeableSpecializations>
```

Спека-провайдер для других модов (FS25_PlaceableMaterialDischarge регистрирует переиспользуемые спеки,
своих типов не объявляет):

```xml
<placeableSpecializations>
    <specialization name="materialDischargeable" className="PlaceableMaterialDischargeable" filename="scripts/placeableSpecializations/PlaceableMaterialDischargeable.lua"/>
    <specialization name="productionDischargeable" className="PlaceableProductionDischargeable" filename="scripts/placeableSpecializations/PlaceableProductionDischargeable.lua"/>
</placeableSpecializations>
```

---

## 8. Типичные ошибки

- **`className` не совпадает** с именем глобальной таблицы в файле — движок не найдёт функции спеки.
- **Неверный `filename`** (путь/регистр) — файл не загрузится.
- **Забыли добавить спеку к типу объекта** (раздел 6) — спека зарегистрирована, но не работает.
- **Путаница `name` и `className`** — `name` это имя спеки (для привязки к типам), `className` это
  Lua-таблица.
- **Путаница с `<placeableTypes>`** — здесь спека только регистрируется; собирает из спек тип другой
  блок.

---

## 9. Примечания

- Имя спеки всегда неймспейсится модом: `<modName>.<name>`, класс — `<modName>.<className>`.
- Данные спеки на объекте — в `self["spec_<modName>.<name>"]`; функции регистрируются на таблице типа
  и копируются на экземпляр — как у техники.
- Placeable и техника используют один и тот же движковый механизм спек (`SpecializationManager`),
  различается только домен и базовый класс (`Placeable`).
- Внутренняя реализация класса спеки — скриптинг Lua; данный справочник описывает только XML-объявление.
- Механика подтверждена по общему движку FS22/FS25 и реальными модами (manureSystem,
  FS25_PlaceableMaterialDischarge, FS22_BigDisplay).

---

## Глоссарий

[^string]: STRING — строковый тип значения. <https://en.wikipedia.org/wiki/String_(computer_science)>
