---
title: "Спецификация <cylindered> — гидравлика и подвижные узлы"
description: "Общая модель блока: управляемые movingTools, ведомые movingParts, цепочки зависимых частей и группы управления."
sidebar:
  label: "cylindered"
---

```xml
<cylindered>
    <movingTools>
        <movingTool node="armPivot">
            <rotation rotSpeed="15" rotMax="45" rotMin="-5" startRot="0" rotationAxis="1"/>
            <controls axis="AXIS_FRONTLOADER_ARM" iconName="ARM_UPDOWN" groupIndex="1"/>
            <dependentPart node="cylinderPart"/>
        </movingTool>
    </movingTools>
    <movingParts>
        <movingPart node="cylinderPart" referencePoint="cylinderRef" referenceFrame="armPivot"/>
    </movingParts>
</cylindered>
```

`<cylindered>` — спека **подвижной механики** техники: гидроцилиндры, стрелы, телескопы, отвалы,
задние борта. Внутри неё два принципиально разных списка:

- [`<movingTools>`](moving-tools.md) — узлы, которыми **управляют**: игрок осью ввода, ИИ или
  скрипт. У них есть скорость, ускорение и пределы хода.
- [`<movingParts>`](moving-parts.md) — узлы, которые **следуют** за другими: шток тянется к
  проушине, телескоп выдвигается, тяга держит направление. Своего управления у них нет.

Правило простое: то, что двигает игрок, — инструмент; то, что двигается «само собой» вслед за
ним, — часть.

> Расположение: блок `vehicle.cylindered`. Раздел справочника — Specializations.
>
> Источник схемы: `Cylindered.initSpecialization`, `Cylindered:onLoad` (FS25), официальная
> `vehicle.xsd`.

---

## 1. Два пути записи

В отличие от [`<fillUnit>`](fill-unit.md), у этой спеки работают **обе** формы:

```text
vehicle.cylindered.movingTools.movingTool(?)
vehicle.cylindered.movingParts.movingPart(?)

vehicle.cylindered.cylinderedConfigurations.cylinderedConfiguration(?).movingTools.movingTool(?)
vehicle.cylindered.cylinderedConfigurations.cylinderedConfiguration(?).movingParts.movingPart(?)
```

При загрузке движок читает **сначала прямой путь, затем путь выбранной конфигурации** и складывает
результат в один список. Поэтому общие для всех вариантов узлы держат в прямом блоке, а
специфичные для конфигурации добавляют внутрь `<cylinderedConfiguration>`.

Устаревшее: `vehicle.movingParts` → `vehicle.cylindered.movingParts`; `vehicle.movingTools` →
`vehicle.cylindered.movingTools`; `vehicle.cylindered.movingParts.sounds` →
`vehicle.cylindered.sounds`.

---

## 2. Цепочка зависимостей

Ключевая идея спеки: движение распространяется по цепочке. Инструмент повернулся → пересчитались
все части, перечисленные у него в `<dependentPart>` → у каждой из них пересчитались свои зависимые
части, и так далее.

```xml
<movingTool node="armPivot">
    <dependentPart node="cylinder01"/>     <!-- шток цилиндра -->
    <dependentPart node="linkage01"/>      <!-- тяга -->
</movingTool>
```

| Путь | Тип | По умолчанию | Описание |
|---|---|---|---|
| `.dependentPart(?)#node` | NODE[^node] | — | Узел зависимой части, которую надо пересчитать. |
| `.dependentPart(?)#maxUpdateDistance` | STRING[^string] | `-` | Максимальное расстояние до корня техники, на котором часть обновляется; `-` — без ограничения. |

Часть, не указанная ни в одном `<dependentPart>`, пересчитывается только если у неё выставлен
`#isActiveDirty` — то есть постоянно, каждый кадр. Это дороже, поэтому обычная схема —
явные цепочки.

---

## 3. Общие под-элементы инструментов и частей

Эти под-элементы одинаково доступны и `<movingTool>`, и `<movingPart>`:

| Элемент | Назначение |
|---|---|
| `.componentJoint(?)#index` | Пересчитать шарнир компонентов при движении. `#anchorActor` — какой актор считается якорем, `#ignoreWarning` (`false`) — молчать, если индекса нет из-за конфигураций. |
| `.dependentAnimation(?)` | Проигрывать анимацию по положению узла: `#name`, `#rotationAxis` / `#translationAxis`, `#minValue`, `#maxValue`, `#invert` (`false`), `#useTranslatingPartIndex`. |
| `.dependentMovingTool(?)` | Связать пределы другого инструмента с положением этого: `#node`, `#axis` (`1`), `#speedScale`, `#requiresMovement` (`false`), пары `#minRotLimits` / `#maxRotLimits`, `#minTransLimits` / `#maxTransLimits` и таблица `.rotationBasedLimits.limit(?)` (`#rotation`, `#rotMin`, `#rotMax`, `#transMin`, `#transMax`). |
| `.attacherJoint#jointIndices` | Пересчитать навеску при движении; `#ignoreWarning` (`false`). |
| `.inputAttacherJoint#value` | Обновлять точку присоединения к трактору. |
| `#wheelIndices` / `#wheelNodes` | Список колёс, которые надо пересчитать вслед за узлом. |

Только у частей есть `.copyLocalDirectionPart(?)` (`#node`, `#dirScale`, `#upScale`) — копирование
локального направления на другой узел, и `.fillVolume` (`#fillVolumeIndex` — по умолчанию `1`,
`#deformerNodeIndices`) — обновление деформеров кучи груза, см.
[`<fillVolume>`](fill-volume.md).

---

## 4. Группы управления

```xml
<movingTools>
    <controlGroups>
        <controlGroup name="$l10n_controlGroup_arm"/>
        <controlGroup name="$l10n_controlGroup_tool"/>
    </controlGroups>
    <movingTool node="armPivot">
        <controls axis="AXIS_FRONTLOADER_ARM" groupIndex="1"/>
    </movingTool>
</movingTools>
```

`<controlGroup(?)#name>` — локализуемое[^l10n] имя группы; инструмент попадает в группу атрибутом
`controls#groupIndex` (по умолчанию `0` — вне групп). Игрок переключает группы, и одни и те же оси
управляют разными узлами: так одному джойстику достаются и стрела, и рабочий инструмент.

---

## 5. Звук и энергопотребление

| Путь | Тип | По умолчанию | Описание |
|---|---|---|---|
| `vehicle.cylindered.movingTools#powerConsumingActiveTimeOffset` | TIME | `5` | Через сколько после остановки инструмента снимается нагрузка потребителя мощности. |
| `vehicle.cylindered.sounds.actionSound(?)#actionNames` | STRING | — | Действия, на которые срабатывает звук. |
| `…actionSound(?)#nodes` | STRING | — | Узлы, активирующие звук этими действиями. |
| `…actionSound(?).pitch#dropOffFactor` | FLOAT[^float] | `1` | Множитель высоты тона в момент затухания. |
| `…actionSound(?).pitch#dropOffTime` | FLOAT | `0` | Через сколько звук отключается. |

Отдельные узлы включают гидравлический звук атрибутом `#playSound` (`false` у обоих типов). Блок
звуков есть и внутри конфигурации: `cylinderedConfiguration(?).sounds`.

---

## 6. Переключение пределов через `<objectChange>`

Конфигурации магазина умеют менять пределы хода инструментов —
[`<objectChange>`](../concepts/vehicle-configurations.md) получает дополнительные атрибуты:

| Атрибут | Что задаёт |
|---|---|
| `#movingToolRotMinActive` / `#movingToolRotMaxActive` | пределы поворота, когда изменение активно |
| `#movingToolRotMinInactive` / `#movingToolRotMaxInactive` | те же пределы в неактивном состоянии |
| `#movingToolStartRotActive` / `#movingToolStartRotInactive` | стартовый угол |
| `#movingToolTransMinActive` / `…MaxActive` и `…Inactive` | пределы хода по трансляции |
| `#movingToolStartTransActive` / `#movingToolStartTransInactive` | стартовое положение |
| `#movingPartUpdateActive` / `#movingPartUpdateInactive` | включена ли ведомая часть |

---

## 7. Easy Arm Control

`vehicle.cylindered.movingTools.easyArmControl` — упрощённое управление стрелой, когда игрок ведёт
не каждый цилиндр, а точку в пространстве. Требует `#rootNode`, `#node`, `#targetNodeZ`, `#refNode`,
две ноды поворота по X (`.xRotationNodes.xRotationNode1` и `…2`) и список
`.zTranslationNodes.zTranslationNode(?)`. Соотношение «поворот против выдвижения» настраивается
через `#minMoveRatio` (`0.2`) и `#maxMoveRatio` (`0.8`), скорость цели — `.targetMovement#speed`
(`1`) и `#acceleration` (`50`).

Инструменты, участвующие в схеме, помечаются `movingTool#isEasyControlTarget="true"`. Движок
проверяет геометрию при загрузке и ругается, если узлы стоят неправильно: например
`Easy arm control requires two x rotation nodes!` или `Distance between easyArmControl rootNode and
xRotationNode1 is to big`.

---

## 8. Сохранение состояния

Положение инструментов пишется в сейв:

```text
vehicles.vehicle(?).cylindered.movingTool(?)#translation | #rotation | #animationTime
```

Инструмент исключается из сохранения атрибутом `#allowSaving="false"` — так поступают с узлами,
которые должны стартовать в фиксированном положении.

---

## 9. Устройство в GIANTS Editor

- Каждый подвижный узел — отдельный transform group с осью вращения, направленной правильно:
  для `rotationAxis="1"` вращение идёт вокруг **X**, `2` — вокруг Y, `3` — вокруг Z.
- Шток цилиндра и его проушина — разные узлы: шток описывается как `<movingPart>`, а точка, к
  которой он тянется, — обычный пустой узел-референс.
- Отладка: `movingPart#debug="true"` включает отрисовку для конкретной части (при загрузке в лог
  уходит предупреждение, что отладка включена — его специально видно).
- Коллизии не должны висеть детьми у части с `#isActiveDirty`: движок пишет ошибку
  `This can cause the vehicle to never sleep!` — техника перестанет засыпать физически.

---

## 10. Типичные ошибки

- **Инструмент вместо части (и наоборот)** — если узел должен двигаться сам за другим, это
  `<movingPart>`; ось ввода ему не нужна.
- **Часть не в цепочке** — узел не указан ни в одном `<dependentPart>` и не помечен
  `#isActiveDirty`: он просто не будет пересчитываться.
- **`#isActiveDirty` без `#maxUpdateDistance`** — предупреждение
  `No max. update distance set for isActiveDirty moving part!`; такие части считаются всегда и
  дорого.
- **Дубликат узла** — один и тот же `#node` в двух частях: `Moving part with node '…' already
  exists!`.
- **Старый корневой путь** `vehicle.movingParts` вместо `vehicle.cylindered.movingParts`.

---

## 11. Примечания

- `cylindered` зарегистрирован как тип конфигурации магазина — набор подвижных узлов можно менять
  вариантом техники.
- Схема `movingTool` переиспользуется и другими блоками: `vehicle.logGrab…claw.movingTool`,
  `vehicle.baleGrab.grab.movingTool`.
- Приборы (`dashboard`) умеют показывать положение инструмента: тип `movingTool` плюс `#axis`,
  `#attacherJointIndex`, `#attacherJointNode(s)`.
- Поведение — по движку FS25 (`vehicles/specializations/Cylindered.lua`) и официальной схеме
  `vehicle.xsd`.

---

## Глоссарий

[^float]: FLOAT — число с плавающей точкой. <https://en.wikipedia.org/wiki/Floating-point_arithmetic>
[^string]: STRING — строковый тип значения. <https://en.wikipedia.org/wiki/String_(computer_science)>
[^node]: NODE — ссылка на узел i3d (имя i3d-маппинга или путь `компонент>ребёнок|ребёнок`). <https://en.wikipedia.org/wiki/Scene_graph>
[^l10n]: L10N — ключ локализации (`$l10n_<ключ>`), подставляется переводом. <https://en.wikipedia.org/wiki/Internationalization_and_localization>
