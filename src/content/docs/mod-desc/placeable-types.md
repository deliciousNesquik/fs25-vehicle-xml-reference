---
title: "Элемент <placeableTypes>"
description: "Кастомные типы размещаемых объектов (набор спек); пара к placeableSpecializations."
sidebar:
  label: "placeableTypes"
---
```xml
<placeableTypes>
    <type name="bigDisplayType" parent="simplePlaceable" filename="$dataS/scripts/placeables/Placeable.lua">
        <specialization name="bigDisplay"/>
        <specialization name="infoTrigger"/>
    </type>
</placeableTypes>
```

Объявляет **кастомные типы размещаемых объектов** (placeable — статичные объекты мира: постройки,
силосы, навесы, загоны, производства, декор) — наборы спецификаций. Полный аналог `<vehicleTypes>`, но
для класса `Placeable` вместо `Vehicle`. Тип собирает базовый класс + список спек; объект ссылается на
тип атрибутом `type=` в своём XML. Пара к [`<placeableSpecializations>`](placeable-specializations.md):
там спека регистрируется, здесь — включается в тип.

> Расположение: дочерний элемент `<modDesc>`. Раздел справочника — modDesc.

---

## 1. Что это

Тип размещаемого объекта = базовый класс + набор спецификаций, определяющих поведение. Через
`<placeableTypes>` мод создаёт свой тип: берёт существующий как основу (`parent`) и добавляет нужные
спеки (в т.ч. собственную). Файл объекта затем указывает этот тип в корне `<placeable type="...">`.

Полная связка: [`<placeableSpecializations>`](placeable-specializations.md) (регистрирует спеку) →
`<placeableTypes>` (собирает тип из спек) → `placeable.xml` (`type="..."` ссылается на тип).

Существенное отличие от техники: **все базовые типы placeable используют один и тот же класс `Placeable`
и один файл `Placeable.lua`** — типы различаются только списком спецификаций. Классы вроде `PlaceableSilo`,
`PlaceableHusbandry`, `PlaceableProductionPoint` — это **спеки**, а не отдельные базовые классы типов.
Движок использует те же общие менеджеры типов, что и техника (`TypeManager`), синглтон
`g_placeableTypeManager`.

---

## 2. Атрибуты `<type>`

| Атрибут | Тип | Обязателен | Описание |
|---|---|---|---|
| `name` | STRING[^string] | да | Имя типа. Регистрируется с префиксом мода: `<modName>.<name>`. |
| `filename` | STRING | да (в схеме) | Путь к Lua-файлу класса типа. Для placeable — `$dataS/scripts/placeables/Placeable.lua`. |
| `className` | STRING | нет | Имя класса типа. Для placeable — `Placeable`; при `parent` наследуется. |
| `parent` | STRING | нет | Имя типа-родителя, от которого наследуются класс и все спеки. |

`<placeableTypes>` необязателен (`minOccurs="0"`), один; `<type>` внутри может быть несколько.
Дочерний `<specialization name="...">` добавляет спеку в тип.

Поскольку базовым классом всегда служит `Placeable`, реальные моды пишут у `<type>` неизменно
`filename="$dataS/scripts/placeables/Placeable.lua"`; `className="Placeable"` указывают опционально
(значение совпадает с базовым, поведение не меняется).

---

## 3. Дочерние `<specialization name="...">`

Каждый добавляет спеку в тип. Имя спеки:

- **Базовые спеки игры** — коротким именем. Имя спеки образуется от имени класса: префикс `Placeable`
  отбрасывается, первая буква строчная (`PlaceableSilo` → `silo`, `PlaceableSellingStation` →
  `sellingStation`, `PlaceableBuyingStation` → `buyingStation`). Подтверждённые реальными модами имена:
  `silo`, `buyingStation`, `sellingStation`, `infoTrigger`, `colorable`.
- **Своя спека мода** — полным неймспейсом `<modName>.<specName>`.
- **Спека из другого мода** — полным именем с окружением этого мода: `<modEnvName>.<specName>`
  (например `FS25_0_PlaceableMaterialDischarge.materialDischargeable`).

Движок резолвит имя сначала как есть, затем — с префиксом мода. Поэтому в одном типе допустимо смешивать
базовые спеки (короткое имя) и свои/чужие (полное имя).

---

## 4. Наследование через `parent`

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

## 5. Как объект ссылается на тип

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

## 6. Примеры

Свой тип с наследованием и смешением своей спеки с базовой:

```xml
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

Типы из базовых спек, с явным `className` (FS25_FarmFillStations):

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

---

## 7. Типичные ошибки

- **`parent` указывает на несуществующий тип** — тип не создастся. Подтверждённые базовые родители —
  `simplePlaceable`, `decoObject`; произвольные имена по имени спеки не гарантированы.
- **Короткое имя своей или чужой спеки** — подцепится не та спека либо ничего; для своих использовать
  `<modName>.<specName>`, для чужих — `<modEnvName>.<specName>`.
- **Нет `filename`** — схема требует его у `<type>`; для placeable это `$dataS/scripts/placeables/Placeable.lua`.
- **Свой класс типа вместо `Placeable`** — у placeable все типы используют `Placeable`; отдельного
  класса-типа под каждый вид объекта нет (различия задаются спеками).
- **Забыт `type=` в файле объекта** или указан несуществующий тип — объект не загрузится.

---

## 8. Примечания

- Placeable и техника используют **один и тот же** движковый механизм типов (`TypeManager`) —
  различаются только домен (`g_placeableTypeManager`) и базовый класс.
- Базовый класс — `Placeable` (наследник `Object`), файл `$dataS/scripts/placeables/Placeable.lua`.
  Все базовые типы placeable используют этот класс; тип определяется списком спек.
- Тип регистрируется как `<modName>.<name>`; в файле объекта ссылаются обычно голым именем.
- `parent` даёт весь набор спек родителя, добавленные спеки идут после (важно для перезаписей).
- Реализация классов/спек — скриптинг Lua; справочник описывает XML-объявление типа.
- Поведение — по официальной схеме FS25 (`modDesc.xsd`) и движку игры.
  Полный список базовых типов задан в `dataS/placeableTypes.xml` (в открытые исходники не входит).

---

## Глоссарий

[^string]: STRING — строковый тип значения. <https://en.wikipedia.org/wiki/String_(computer_science)>
