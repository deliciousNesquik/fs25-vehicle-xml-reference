---
title: "Элемент <vehicleTypes>"
description: "Кастомные типы техники (набор спек); пара к specializations."
sidebar:
  label: "vehicleTypes"
---
```xml
<vehicleTypes>
    <type name="cutterMower" parent="cutter" filename="$dataS/scripts/vehicles/Vehicle.lua">
        <specialization name="mower"/>
        <specialization name="FS25_CutterMower.cutterMower"/>
    </type>
</vehicleTypes>
```

Объявляет **кастомные типы техники** — наборы спецификаций. Тип собирает базовый класс + список
спек; техника ссылается на тип атрибутом `type=` в своём XML. Пара к `<specializations>`: там спека
регистрируется, здесь — включается в тип.

> Расположение: дочерний элемент `<modDesc>`. Раздел справочника — modDesc.

---

## 1. Что это

Тип техники = базовый класс (обычно `Vehicle`) + набор спецификаций, определяющих поведение.
Через `<vehicleTypes>` мод создаёт свой тип: берёт существующий как основу (`parent`) и добавляет
нужные спеки (в т.ч. собственную). Файл техники затем указывает этот тип в корне
`<vehicle type="...">`.

Полная связка: `<specializations>` (регистрирует спеку) → `<vehicleTypes>` (собирает тип из спек) →
`vehicle.xml` (`type="..."` ссылается на тип).

---

## 2. Атрибуты `<type>`

| Атрибут | Тип | Обязателен | Описание |
|---|---|---|---|
| `name` | STRING[^string] | да | Имя типа. Регистрируется с префиксом мода: `<modName>.<name>`. |
| `filename` | STRING | да (в схеме) | Путь к Lua-файлу базового класса типа. При `parent` наследуется, но в XML указывать нужно. |
| `className` | STRING | нет | Имя класса типа. При `parent` наследуется от родителя. |
| `parent` | STRING | нет | Имя типа-родителя, от которого наследуются класс и все спеки. |

`<vehicleTypes>` необязателен (`minOccurs="0"`), один; `<type>` внутри может быть несколько.

Для стандартной техники `filename="$dataS/scripts/vehicles/Vehicle.lua"`, `className="Vehicle"`.
При наличии `parent` оба берутся у родителя, если не заданы (в XML `filename` всё равно указывают —
этого требует схема).

---

## 3. Дочерние `<specialization name="...">`

Каждый добавляет спеку в тип. Имя спеки:

- **Базовые спеки игры** — коротким именем: `mower`, `cutter`, `fillUnit`, `foldable`, `cylindered` и т.п.
- **Собственная спека мода** — полным неймспейсом `<modName>.<specName>` (например `FS25_CutterMower.cutterMower`).

Короткое имя мод-спеки формально тоже сработает (движок сам добавит префикс мода при поиске), но
полная форма безопаснее: находит спеку сразу и исключает коллизию с базовой спекой того же имени.

---

## 4. Наследование через `parent`

`parent` указывает имя существующего типа (базовые типы игры — `cutter`, `mower`, `trailer` и т.п.).
Дочерний тип получает **все спеки родителя**, а затем к ним добавляются перечисленные
`<specialization>`. Порядок важен: спеки родителя идут первыми, добавленные — после, поэтому
перезаписи функций (`registerOverwrittenFunction`) в мод-спеке корректно оборачивают базовые
реализации.

`parent` резолвится по **голому** имени среди уже зарегистрированных типов; базовые типы доступны
по своим именам (`cutter`, `mower`, …).

---

## 5. Как техника ссылается на тип

В корне файла техники — атрибут `type`:

```xml
<vehicle type="cutterMower">
    ...
</vehicle>
```

Указывать можно **голое** имя (`cutterMower`) — движок сначала ищет тип по нему, а если не нашёл,
подставляет префикс мода (из пути файла) и находит `<modName>.cutterMower`. Так делают реальные
моды, и файл техники остаётся переносимым (имя мода не зашито). Полная форма
`type="FS25_CutterMower.cutterMower"` тоже валидна.

---

## 6. Примеры

Наследование базового типа + своя спека (реальный кейс):

```xml
<specializations>
    <specialization name="cutterMower" className="CutterMower" filename="scripts/CutterMower.lua"/>
</specializations>

<vehicleTypes>
    <type name="cutterMower" parent="cutter" filename="$dataS/scripts/vehicles/Vehicle.lua">
        <specialization name="mower"/>
        <specialization name="FS25_CutterMower.cutterMower"/>
    </type>
</vehicleTypes>
```

Тип без родителя (тогда `className` указывают явно):

```xml
<vehicleTypes>
    <type name="surveyorObject" className="Vehicle" filename="$dataS/scripts/vehicles/Vehicle.lua">
        <specialization name="fillUnit"/>
        <specialization name="FS25_MyMod.surveyor"/>
    </type>
</vehicleTypes>
```

---

## 7. Типичные ошибки

- **`parent` указывает на несуществующий тип** — ошибка `Parent type '...' is not defined`, тип не создастся.
- **Короткое имя мод-спеки, совпадающее с базовой** — подцепится базовая спека; для своих спек
  использовать полное `<modName>.<specName>`.
- **Нет `filename`** — схема требует его у `<type>`.
- **Забыть `type=` в файле техники** или указать несуществующий тип — техника не загрузится с этим типом.
- **`className` без `parent`** — если родителя нет, класс нужно указать явно (`Vehicle`).

---

## 8. Примечания

- Тип регистрируется как `<modName>.<name>`; в файле техники ссылаются обычно голым именем.
- `parent` даёт весь набор спек родителя, добавленные спеки идут после (важно для перезаписей).
- Реализация классов/спек — скриптинг Lua; справочник описывает XML-объявление типа.
- Поведение — по официальной схеме FS25 (`modDesc.xsd`) и движку игры. Базовые типы (`cutter`, `mower`, …)
  заданы в данных игры.

---

## Глоссарий

[^string]: STRING — строковый тип значения. <https://en.wikipedia.org/wiki/String_(computer_science)>
