---
title: "Объявить свой тип техники"
description: "Задача целиком: зарегистрировать спецификацию, собрать из неё тип техники и сослаться на тип из vehicle.xml."
sidebar:
  label: "Свой тип техники"
---

```xml
<!-- modDesc.xml -->
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

Своё поведение техники добавляется не в файл машины, а в **тип**: сначала спека регистрируется,
потом включается в тип, и только потом техника ссылается на этот тип. Рецепт проходит все три шага
и показывает, где обычно ломается связка. Реализация самого Lua-класса — вне объёма справочника;
готовый рабочий пример скрипта есть в рецепте [кастомной покраски](custom-paint.md).

---

## 1. Из чего состоит связка

```text
<specializations>   регистрирует спеку   → <modName>.<name>
<vehicleTypes>      собирает тип из спек → <modName>.<name>
vehicle.xml         type="..."           → ссылается на тип
```

Тип техники = базовый класс (обычно `Vehicle`) + набор спецификаций. Пропущенное звено даёт
понятный симптом: спека без типа просто не подключится, тип без ссылки из `vehicle.xml` не
применится.

---

## 2. Шаг 1 — зарегистрировать спеку

```xml
<specializations>
    <specialization name="cutterMower" className="CutterMower" filename="scripts/CutterMower.lua"/>
</specializations>
```

Все три атрибута обязательны: `name` — короткое имя, `className` — имя **глобальной таблицы** Lua,
объявленной в файле, `filename` — путь к `.lua` от корня мода.

Движок регистрирует спеку под именем с префиксом мода: `<modName>.<name>` (в примере —
`FS25_CutterMower.cutterMower`). По этому полному имени спека дальше добавляется в тип. Подробности —
на странице [`<specializations>`](../mod-desc/specializations.md).

---

## 3. Шаг 2 — собрать тип

```xml
<vehicleTypes>
    <type name="cutterMower" parent="cutter" filename="$dataS/scripts/vehicles/Vehicle.lua">
        <specialization name="mower"/>
        <specialization name="FS25_CutterMower.cutterMower"/>
    </type>
</vehicleTypes>
```

| Атрибут | Что писать |
|---|---|
| `name` | имя типа; регистрируется как `<modName>.<name>` |
| `parent` | имя существующего типа-родителя (`cutter`, `mower`, `trailer`, …) — даёт **все** его спеки |
| `filename` | путь к Lua базового класса; схема требует его даже при `parent` |
| `className` | нужен, если `parent` не указан (для обычной техники — `Vehicle`) |

Имена спек внутри `<type>`: базовые — коротко (`mower`, `fillUnit`, `foldable`, `cylindered`), свои —
полным неймспейсом `<modName>.<specName>`. Короткая форма своей спеки формально сработает, но при
совпадении имени с базовой подцепится базовая.

**Порядок важен:** спеки родителя идут первыми, добавленные — после. Именно поэтому перезапись
функций в своей спеке корректно оборачивает базовые реализации.

---

## 4. Шаг 3 — сослаться из файла техники

```xml
<vehicle type="cutterMower">
    ...
</vehicle>
```

Достаточно голого имени: движок сначала ищет тип по нему, а если не нашёл — подставляет префикс
мода и находит `<modName>.cutterMower`. Так делают реальные моды, и файл техники остаётся
переносимым. Полная форма `type="FS25_CutterMower.cutterMower"` тоже валидна.

---

## 5. Проверка

1. Лог загрузки мода: ошибка `Parent type '...' is not defined` означает опечатку в `parent` или
   отсутствие родителя.
2. Техника загрузилась и в ней работают функции спеки — значит имя в `<specialization>` разрешилось
   правильно.
3. Данные спеки лежат в таблице `self["spec_<modName>.<name>"]` — удобная проверка того, что
   подключилась именно ваша спека, а не одноимённая базовая.

---

## 6. Типичные ошибки

- **`parent` указывает на несуществующий тип** — тип не создастся вовсе.
- **Короткое имя своей спеки совпало с базовой** — подключится базовая; используйте
  `<modName>.<specName>`.
- **Нет `filename`** у `<type>` — этого требует схема, даже когда класс наследуется от `parent`.
- **`className` без `parent`** — класс нужно указать явно (`Vehicle`).
- **Забыт `type=` в `vehicle.xml`** или указан несуществующий тип — техника не загрузится с этим типом.

---

## Что дальше

- [`<specializations>`](../mod-desc/specializations.md) — регистрация спеки, что делает каждый атрибут.
- [`<vehicleTypes>`](../mod-desc/vehicle-types.md) — полный разбор `<type>` и наследования через `parent`.
- [`<extraSourceFiles>`](../mod-desc/extra-source-files.md) — когда скрипт нужен глобально, а не как спека техники.
- [`<placeableTypes>`](../mod-desc/placeable-types.md) и [`<handToolTypes>`](../mod-desc/handtool-types.md) —
  тот же механизм для размещаемых объектов и ручных инструментов.
- [Кастомная покраска](custom-paint.md) — сквозной пример: спека + тип + действие ввода + сохранение.
