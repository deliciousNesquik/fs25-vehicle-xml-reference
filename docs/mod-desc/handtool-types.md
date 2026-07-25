# Farming Simulator 2025
## Элемент `<handToolTypes>`

```xml
<handToolTypes>
    <type name="myTool" parent="chainsaw" filename="$dataS/scripts/handTools/HandTool.lua">
        <specialization name="myMod.myTool"/>
    </type>
</handToolTypes>
```

Объявляет **кастомные типы ручных инструментов** (hand tool — переносимые игроком инструменты:
бензопила, фонарь, мойка высокого давления, щётка, баллончик и т.п.) — наборы спецификаций. Полный
аналог `<vehicleTypes>`, но для класса `HandTool` вместо `Vehicle`. Тип собирает базовый класс + список
спек; инструмент ссылается на тип атрибутом `type=` в своём XML. Пара к
[`<handToolSpecializations>`](handtool-specializations.md): там спека регистрируется, здесь — включается
в тип.

> Расположение: дочерний элемент `<modDesc>`. Раздел справочника — modDesc.
>
> Механизм появился в **FS25**. В FS22 типы инструментов жёстко регистрировались кодом
> (`registerHandTool`), modDesc их не задавал (см. раздел 8).

---

## 1. Что это

Тип ручного инструмента = базовый класс `HandTool` + набор спецификаций, определяющих поведение. Через
`<handToolTypes>` мод создаёт свой тип: берёт существующий как основу (`parent`) и добавляет нужные
спеки (в т.ч. собственную). Файл инструмента затем указывает этот тип в корне `<handTool type="...">`.

Полная связка: [`<handToolSpecializations>`](handtool-specializations.md) (регистрирует спеку) →
`<handToolTypes>` (собирает тип из спек) → `handTool.xml` (`type="..."` ссылается на тип).

Движок использует те же общие менеджеры типов, что и техника и placeable (`TypeManager`), синглтон
`g_handToolTypeManager`. Базовый класс инструмента — `HandTool` (наследник `Object`, не `Vehicle`);
корневой элемент XML инструмента — `<handTool>`.

---

## 2. Атрибуты `<type>`

| Атрибут | Тип | Обязателен | Описание |
|---|---|---|---|
| `name` | STRING[^string] | да | Имя типа. Регистрируется с префиксом мода: `<modName>.<name>`. |
| `filename` | STRING | да (в схеме) | Путь к Lua-файлу класса типа. Для инструмента — `$dataS/scripts/handTools/HandTool.lua`. |
| `className` | STRING | нет | Имя класса типа. Для инструмента — `HandTool`; при `parent` наследуется. |
| `parent` | STRING | нет | Имя типа-родителя, от которого наследуются класс и все спеки. |

`<handToolTypes>` необязателен (`minOccurs="0"`), один; `<type>` внутри может быть несколько.
Дочерний `<specialization name="...">` добавляет спеку в тип.

---

## 3. Дочерние `<specialization name="...">`

Каждый добавляет спеку в тип. Имя спеки:

- **Базовые спеки игры** — коротким именем. FS25 поставляет **9 спек** (имя → класс):

| Имя спеки | Класс | Требует (prerequisite) |
|---|---|---|
| `chainsaw` | `HandToolChainsaw` | `motorized` |
| `highPressureWasherLance` | `HandToolHPWLance` | `tethered` |
| `tethered` | `HandToolTethered` | `storable` |
| `motorized` | `HandToolMotorized` | — |
| `storable` | `HandToolStorable` | — |
| `flashlight` | `HandToolFlashlight` | — |
| `sprayCan` | `HandToolSprayCan` | — |
| `horseBrush` | `HandToolHorseBrush` | — |
| `hands` | `HandToolHands` | — |

- **Своя спека мода** — полным неймспейсом `<modName>.<specName>` (короткое имя тоже резолвится:
  движок при промахе добавляет префикс мода).

Часть спек зависят друг от друга (`prerequisitesPresent`): если тип содержит `chainsaw`, в нём должна
присутствовать и `motorized` (обычно наследуется от родителя-бензопилы), иначе тип отбраковывается.

---

## 4. Наследование через `parent`

`parent` указывает имя существующего типа. Дочерний тип получает **все спеки родителя**, затем к ним
добавляются перечисленные `<specialization>` — родительские идут первыми, добавленные после (важно для
`registerOverwrittenFunction`: мод-спека корректно оборачивает базовые реализации).

**Важное отличие `parent` от `<specialization name>` и `type=`:** у `parent` **нет** фолбэка по имени
мода. Движок ищет родителя строго по указанному имени (`self.types[parent]`) и при промахе выдаёт
`Parent ... type is not defined`. Значит:

- на **базовый** тип игры ссылаются **голым** именем;
- на тип, объявленный **тем же модом** ранее, — **полным** именем `<modName>.<name>` (свои типы
  хранятся неймспейсно, а автоподстановки префикса для `parent` нет).

Имена базовых типов инструментов заданы в игровом файле данных `$dataS/handToolTypes.xml`, который не
входит в открытые исходники. Из FS22 достоверно известны идентификаторы `chainsaw` и
`highPressureWasherLance`; точные строки базовых типов FS25 первоисточником здесь не подтверждаются
(перечень спек — подтверждён, см. раздел 3).

---

## 5. Как инструмент ссылается на тип

В корне файла инструмента — атрибут `type`:

```xml
<handTool type="myTool">
    ...
</handTool>
```

Указывать можно **голое** имя (`myTool`) — движок сначала ищет тип по нему, а если не нашёл, подставляет
префикс мода и находит `<modName>.myTool`. Так же ссылаются на базовый тип (`type="chainsaw"`). В отличие
от FS22, где тип задавался дочерним элементом `<handToolType>`, в FS25 это **атрибут корня** `<handTool>`.

---

## 6. Примеры

Свой тип на основе базового + своя спека:

```xml
<handToolSpecializations>
    <specialization name="myTool" className="HandToolMyTool" filename="scripts/HandToolMyTool.lua"/>
</handToolSpecializations>

<handToolTypes>
    <type name="myTool" parent="chainsaw" filename="$dataS/scripts/handTools/HandTool.lua">
        <specialization name="myTool"/>
    </type>
</handToolTypes>
```

Форма блока из схемы (шаблонные значения, показывает набор атрибутов):

```xml
<handToolTypes>
    <type parent="string" name="string" filename="string">
        <specialization name="string"/>
    </type>
</handToolTypes>
```

---

## 7. Типичные ошибки

- **`parent` на несуществующий тип** — `Parent ... type is not defined`, тип не создастся. У `parent`
  нет фолбэка по моду: свой тип-родитель указывать полным `<modName>.<name>`.
- **Пропущена зависимая спека** — напр. `chainsaw` без `motorized`: `prerequisitesPresent` не пройдёт,
  тип отбракуется.
- **Нет `filename`** — схема требует его у `<type>`; для инструмента это `$dataS/scripts/handTools/HandTool.lua`.
- **Тип в дочернем элементе, как в FS22** — в FS25 тип задаётся атрибутом корня `<handTool type="...">`,
  а не элементом `<handToolType>`.
- **Забыт `type=` в файле инструмента** или указан несуществующий тип — инструмент не загрузится.

---

## 8. Отличие FS25 от FS22

В FS22 инструментов было два, и они регистрировались **кодом** (`registerHandTool("chainsaw", …)`,
`registerHandTool("highPressureWasherLance", …)`); `g_handToolTypeManager` и блоки `<handToolTypes>` /
`<handToolSpecializations>` отсутствовали. Тип инструмента в FS22 задавался дочерним элементом
`handTool.handToolType`. В FS25 инструменты переведены на общий фреймворк типов/спек, и оба modDesc-блока
стали доступны; тип указывается атрибутом корня `<handTool type="…">`.

---

## 9. Примечания

- Ручной инструмент, техника и placeable используют **один и тот же** движковый механизм типов
  (`TypeManager`) — различаются домен (`g_handToolTypeManager`) и базовый класс.
- Базовый класс — `HandTool` (наследник `Object`); стандартный `filename="$dataS/scripts/handTools/HandTool.lua"`,
  `className="HandTool"`.
- Тип регистрируется как `<modName>.<name>`; в файле инструмента ссылаются обычно голым именем.
- Инструмент не «занимается» как техника: его подбирает `HandToolHolder` и несёт игрок.
- Реализация классов/спек — скриптинг Lua; справочник описывает XML-объявление типа.
- Механика подтверждена по исходникам FS25 (`HandTool.lua`, `TypeManager`, `handTools/specializations/*`)
  и XSD; FS22-часть — по `main.lua`/`HandTool.lua` FS22. Список базовых **типов** задан в
  `$dataS/handToolTypes.xml` (в открытые исходники не входит); публичного мода с реальным блоком найти
  не удалось — примеры построены по подтверждённой механике.

---

## Глоссарий

[^string]: STRING — строковый тип значения. <https://en.wikipedia.org/wiki/String_(computer_science)>
