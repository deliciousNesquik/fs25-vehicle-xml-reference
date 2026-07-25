# Farming Simulator 2025
## Элементы `<placeableSpecializations>` и `<placeableTypes>`

```xml
<placeableSpecializations>
    <specialization name="bigDisplay" className="BigDisplaySpecialization" filename="scripts/bigDisplaySpecialization.lua"/>
</placeableSpecializations>

<placeableTypes>
    <type name="bigDisplayType" parent="simplePlaceable" filename="$dataS/scripts/placeables/Placeable.lua">
        <specialization name="bigDisplay"/>
        <specialization name="infoTrigger"/>
    </type>
</placeableTypes>
```

Пара блоков для **размещаемых объектов** (placeable — статичные объекты мира: постройки, силосы, навесы,
загоны, производства, декор). Полностью повторяют логику `<specializations>`/`<vehicleTypes>`, но для
класса `Placeable` вместо `Vehicle`: `<placeableSpecializations>` регистрирует свои спеки, `<placeableTypes>`
собирает из них (и базовых) типы, на которые ссылается объект в своём XML атрибутом `type=`.

> Расположение: дочерние элементы `<modDesc>`. Раздел справочника — modDesc.

---

## 1. Что это

Размещаемый объект (placeable) — статичный объект мира, который игрок ставит через меню строительства.
Как и техника, он собирается из **типа** (базовый класс + набор спецификаций). Движок использует для
этого те же общие менеджеры, что и для техники (`TypeManager` и `SpecializationManager`), только для
домена «placeable»: синглтоны `g_placeableTypeManager` и `g_placeableSpecializationManager`.

Полная связка (аналог техники): `<placeableSpecializations>` (регистрирует спеку) → `<placeableTypes>`
(собирает тип из спек) → `placeable.xml` (`type="..."` ссылается на тип).

Существенное отличие от техники: **все базовые типы placeable используют один и тот же класс `Placeable`
и один файл `Placeable.lua`** — типы различаются только списком спецификаций. Классы вроде `PlaceableSilo`,
`PlaceableHusbandry`, `PlaceableProductionPoint` — это **спеки**, а не отдельные базовые классы типов.

---

## 2. `<placeableSpecializations>` — регистрация своих спек

Идентичен `<specializations>`, но регистрирует спеки размещаемых объектов. Все три атрибута обязательны.

| Атрибут | Тип | Обязателен | Описание |
|---|---|---|---|
| `name` | STRING[^string] | да | Имя спеки. Регистрируется с префиксом мода: `<modName>.<name>`. |
| `className` | STRING | да | Имя глобальной Lua-таблицы (класса) спеки. Регистрируется как `<modName>.<className>`. |
| `filename` | STRING | да | Путь к `.lua`-файлу спеки от корня мода. |

`<placeableSpecializations>` необязателен (`minOccurs="0"`), один; `<specialization>` внутри может быть
несколько. Мод может регистрировать спеки и **не объявлять** своих типов — тогда спеки внедряются в
существующие типы кодом (или предлагаются другим модам как переиспользуемые).

---

## 3. `<placeableTypes>` — сборка типов

Идентичен `<vehicleTypes>`. Атрибуты `<type>`:

| Атрибут | Тип | Обязателен | Описание |
|---|---|---|---|
| `name` | STRING | да | Имя типа. Регистрируется с префиксом мода: `<modName>.<name>`. |
| `filename` | STRING | да (в схеме) | Путь к Lua-файлу класса типа. Для placeable — всегда `$dataS/scripts/placeables/Placeable.lua`. |
| `className` | STRING | нет | Имя класса типа. Для placeable — `Placeable`; при `parent` наследуется. |
| `parent` | STRING | нет | Имя типа-родителя, от которого наследуются класс и все спеки. |

`<placeableTypes>` необязателен (`minOccurs="0"`), один; `<type>` внутри может быть несколько.
Дочерний `<specialization name="...">` добавляет спеку в тип.

Поскольку базовым классом всегда служит `Placeable`, реальные моды пишут у `<type>` неизменно
`filename="$dataS/scripts/placeables/Placeable.lua"`; `className="Placeable"` указывают опционально
(значение совпадает с базовым, поведение не меняется).

---

## 4. Имена спек в `<specialization name="...">`

Каждый добавляет спеку в тип. Имя спеки:

- **Базовые спеки игры** — коротким именем. Имя спеки образуется от имени класса: префикс `Placeable`
  отбрасывается, первая буква строчная (`PlaceableSilo` → `silo`, `PlaceableSellingStation` →
  `sellingStation`, `PlaceableBuyingStation` → `buyingStation`). Подтверждённые реальными модами имена:
  `silo`, `buyingStation`, `sellingStation`, `infoTrigger`, `colorable`.
- **Своя спека мода** — полным неймспейсом `<modName>.<specName>`.
- **Спека из другого мода** — полным именем с окружением этого мода: `<modEnvName>.<specName>`
  (например `FS25_0_PlaceableMaterialDischarge.materialDischargeable`). Так один мод подключает спеку,
  зарегистрированную другим.

Движок резолвит имя сначала как есть, затем — с префиксом мода. Поэтому в одном типе допустимо смешивать
базовые спеки (короткое имя) и свои/чужие (полное имя).

---

## 5. Наследование через `parent`

`parent` указывает имя существующего типа. Дочерний тип получает **все спеки родителя**, затем к ним
добавляются перечисленные `<specialization>` — родительские идут первыми, добавленные после (важно для
`registerOverwrittenFunction`: мод-спека корректно оборачивает базовые реализации).

Подтверждённые реальными модами базовые типы для `parent`:

| Тип-родитель | Назначение |
|---|---|
| `simplePlaceable` | Минимальный базовый тип placeable — основа для большинства кастомных типов. |
| `decoObject` | Декоративный объект. |

Имена базовых типов placeable **описательные** и не выводятся из имён спек. Полный их перечень задан в
игровом файле данных `dataS/placeableTypes.xml`, который не входит в открытые исходники, поэтому здесь
приведены только имена, подтверждённые реальными модами. Кроме базовых, `parent` может ссылаться на тип
другого мода полным именем `<modName>.<typeName>`.

---

## 6. Как объект ссылается на тип

В корне файла размещаемого объекта — атрибут `type`:

```xml
<placeable type="bigDisplayType">
    ...
</placeable>
```

Указывать можно **голое** имя (`bigDisplayType`) — движок сначала ищет тип по нему, а если не нашёл,
подставляет префикс мода и находит `<modName>.bigDisplayType`. Реальные моды ссылаются на свой тип
голым именем; полная форма тоже валидна. Дотовую форму `<modName>.<name>` применяют, когда ссылаются на
тип или спеку **другого** мода.

---

## 7. Примеры

Свои спека + тип (FS22_BigDisplay): тип наследует `simplePlaceable`, смешивает свою спеку и базовую:

```xml
<placeableSpecializations>
    <specialization name="bigDisplay" className="BigDisplaySpecialization" filename="scripts/bigDisplaySpecialization.lua"/>
</placeableSpecializations>

<placeableTypes>
    <type name="bigDisplayType" parent="simplePlaceable" filename="$dataS/scripts/placeables/Placeable.lua">
        <specialization name="bigDisplay"/>
        <specialization name="infoTrigger"/>
    </type>
    <type name="colorDecoObject" parent="decoObject" filename="$dataS/scripts/placeables/Placeable.lua">
        <specialization name="colorable"/>
    </type>
</placeableTypes>
```

Только типы из базовых спек, с явным `className` (FS25_FarmFillStations):

```xml
<placeableTypes>
    <type name="buyingStationConfigurable" parent="simplePlaceable" className="Placeable" filename="$dataS/scripts/placeables/Placeable.lua">
        <specialization name="buyingStation"/>
        <specialization name="sellingStation"/>
    </type>
    <type name="siloConfigurable" parent="simplePlaceable" className="Placeable" filename="$dataS/scripts/placeables/Placeable.lua">
        <specialization name="silo"/>
    </type>
</placeableTypes>
```

Подключение спеки из другого мода (полное имя с окружением):

```xml
<placeableTypes>
    <type name="customPlaceable" parent="simplePlaceable" filename="$dataS/scripts/placeables/Placeable.lua">
        <specialization name="FS25_0_PlaceableMaterialDischarge.materialDischargeable"/>
    </type>
</placeableTypes>
```

Только регистрация спек, без своих типов (спека внедряется в существующие типы кодом или предлагается
другим модам — manureSystem регистрирует так десяток спек):

```xml
<placeableSpecializations>
    <specialization name="materialDischargeable" className="PlaceableMaterialDischargeable" filename="scripts/placeableSpecializations/PlaceableMaterialDischargeable.lua"/>
    <specialization name="productionDischargeable" className="PlaceableProductionDischargeable" filename="scripts/placeableSpecializations/PlaceableProductionDischargeable.lua"/>
</placeableSpecializations>
```

---

## 8. Типичные ошибки

- **`parent` указывает на несуществующий тип** — тип не создастся. Подтверждённые базовые родители —
  `simplePlaceable`, `decoObject`; произвольные имена по имени спеки не гарантированы.
- **Короткое имя своей или чужой спеки** — подцепится не та спека либо ничего; для своих использовать
  `<modName>.<specName>`, для чужих — `<modEnvName>.<specName>`.
- **Нет `filename`** — схема требует его у `<type>`; для placeable это `$dataS/scripts/placeables/Placeable.lua`.
- **Свой класс типа вместо `Placeable`** — у placeable все типы используют `Placeable`; отдельного
  класса-типа под каждый вид объекта нет (различия задаются спеками).
- **Забыт `type=` в файле объекта** или указан несуществующий тип — объект не загрузится.
- **Путаница `<placeableSpecializations>` и `<placeableTypes>`** — первый регистрирует спеку, второй
  собирает из спек тип; регистрация без включения в тип ничего не применяет.

---

## 9. Примечания

- Placeable и техника используют **один и тот же** движковый механизм типов/спек (`TypeManager`,
  `SpecializationManager`) — различаются только домен и базовый класс.
- Базовый класс — `Placeable` (наследник `Object`), файл `$dataS/scripts/placeables/Placeable.lua`.
  Все базовые типы placeable используют этот класс; тип определяется списком спек.
- Тип регистрируется как `<modName>.<name>`; спека — как `<modName>.<name>` (класс `<modName>.<className>`).
- Данные экземпляра спеки — в `self["spec_<modName>.<name>"]`; функции регистрируются на таблице типа и
  копируются на экземпляр — как у техники.
- Реализация классов/спек — скриптинг Lua; справочник описывает XML-объявление.
- Механика подтверждена по общему движку FS22/FS25 (`TypeManager`, `SpecializationManager`, `Placeable`,
  `PlaceableUtil`) и реальными модами (FS22_BigDisplay, FS25_FarmFillStations, FS25_PlaceableMaterialDischarge,
  manureSystem). Полный список базовых типов задан в `dataS/placeableTypes.xml` (в открытые исходники не входит).

---

## Глоссарий

[^string]: STRING — строковый тип значения. <https://en.wikipedia.org/wiki/String_(computer_science)>
