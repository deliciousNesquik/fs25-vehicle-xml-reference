---
title: "Блок <movingTool> — управляемые узлы"
description: "Узлы под управлением игрока и ИИ: поворот, трансляция, анимация, оси ввода, пределы хода и гейтинг."
sidebar:
  label: "movingTool"
---

```xml
<movingTools>
    <movingTool node="armPivot" playSound="true">
        <rotation rotationAxis="1" rotSpeed="15" rotAcceleration="60" rotMin="-5" rotMax="45" startRot="0"/>
        <controls axis="AXIS_FRONTLOADER_ARM" iconName="ARM_UPDOWN" groupIndex="1" mouseSpeedFactor="1"/>
        <dependentPart node="cylinder01"/>
    </movingTool>
</movingTools>
```

`<movingTool>` — узел, которым **управляют**: игрок осью ввода, помощник или другой инструмент.
Инструмент задаёт, что именно меняется (поворот, положение или время анимации), с какой скоростью и
в каких пределах. Всё, что должно двигаться вслед за ним, описывается отдельно как
[`<movingPart>`](moving-parts.md) и подключается через `<dependentPart>`.

> Расположение: блок `vehicle.cylindered.movingTools`. Раздел справочника — Specializations.
>
> Источник схемы: `Cylindered.registerMovingToolXMLPaths` (FS25).

---

## 1. Три способа движения

У инструмента ровно один «двигатель» — тот под-элемент, который вы укажете:

| Под-элемент | Что меняет | Когда применяют |
|---|---|---|
| `<rotation>` | угол узла вокруг выбранной оси | шарниры стрелы, поворот отвала, наклон ковша |
| `<translation>` | положение узла вдоль оси | телескопы, выдвижные опоры |
| `<animation>` | время именованной анимации | сложное составное движение, описанное анимацией |

Общий у всех — `#node`, узел i3d[^node], которым движок и крутит.

---

## 2. `<rotation>` — поворот

| Путь | Тип | По умолчанию | Описание |
|---|---|---|---|
| `#rotationAxis` | INT[^int] | `1` | Ось вращения: `1` — X, `2` — Y, `3` — Z. |
| `#rotSpeed` | ANGLE[^angle] | — | Скорость поворота (град/с в XML). |
| `#rotAcceleration` | ANGLE | — | Ускорение; без него движение начинается сразу на полной скорости. |
| `#rotMin` / `#rotMax` | ANGLE | — | Пределы хода. |
| `#startRot` | ANGLE | — | Угол при спавне техники. |
| `#attachRotMin` / `#attachRotMax` | ANGLE | — | Пределы, выставляемые в момент прицепки. |
| `#detachingRotMinLimit` / `#detachingRotMaxLimit` | ANGLE | — | Диапазон, в котором разрешена отцепка. |
| `#syncMinRotLimits` / `#syncMaxRotLimits` | BOOL[^bool] | `false` | Синхронизировать пределы в мультиплеере. |
| `#rotSendNumBits` | INT | по диапазону поворота | Бит на синхронизацию угла. |

---

## 3. `<translation>` — трансляция

| Путь | Тип | По умолчанию | Описание |
|---|---|---|---|
| `#translationAxis` | INT | — | Ось перемещения: `1` — X, `2` — Y, `3` — Z. |
| `#transSpeed` | FLOAT[^float] | — | Скорость, м/с. |
| `#transAcceleration` | FLOAT | — | Ускорение. |
| `#transMin` / `#transMax` | FLOAT | — | Пределы хода, м. |
| `#startTrans` | FLOAT | — | Положение при спавне. |
| `#attachTransMin` / `#attachTransMax` | FLOAT | — | Пределы в момент прицепки. |
| `#detachingTransMinLimit` / `#detachingTransMaxLimit` | FLOAT | — | Диапазон, в котором разрешена отцепка. |

---

## 4. `<animation>` — движение анимацией

| Путь | Тип | По умолчанию | Описание |
|---|---|---|---|
| `#animName` | STRING[^string] | — | Имя анимации техники. |
| `#animSpeed` | FLOAT | — | Скорость проигрывания. |
| `#animAcceleration` | FLOAT | — | Ускорение. |
| `#animMinTime` / `#animMaxTime` | FLOAT | `0` / `1` | Диапазон времени анимации. |
| `#animStartTime` | FLOAT | — | Время при спавне. |
| `#animSendNumBits` | INT | `8` | Бит на синхронизацию времени. |

---

## 5. `<controls>` — управление игроком

```xml
<controls axis="AXIS_FRONTLOADER_ARM" iconName="ARM_UPDOWN" groupIndex="1" invertAxis="false"/>
```

| Путь | Тип | По умолчанию | Описание |
|---|---|---|---|
| `#axis` | STRING | — | Имя действия ввода (`InputAction`), которым узел управляется. Без него инструмент игроку недоступен. |
| `#iconName` | STRING | — | Значок оси в подсказке управления; список — `$dataS/axisIcons.xml`. |
| `#groupIndex` | INT | `0` | Номер группы управления; `0` — вне групп. Группы объявляются в [`<cylindered>`](cylindered.md). |
| `#invertAxis` | BOOL | `false` | Инвертировать направление оси. |
| `#mouseSpeedFactor` | FLOAT | `1` | Множитель скорости при управлении мышью. |

Имена действий регистрируются в [`<actions>`](../mod-desc/actions.md) modDesc, а раскладка по
умолчанию — в [`<inputBinding>`](../mod-desc/input-binding.md).

---

## 6. Когда инструмент двигаться не должен

| Путь | Тип | По умолчанию | Описание |
|---|---|---|---|
| `#foldMinLimit` / `#foldMaxLimit` | FLOAT | `0` / `1` | Диапазон состояния складывания, в котором инструмент активен. См. [`<foldable>`](foldable.md). |
| `#fillUnitIndex` | INT | — | Ёмкость, от уровня которой зависит доступность. |
| `#minFillLevel` / `#maxFillLevel` | FLOAT | — | Диапазон уровня груза, в котором инструмент работает. См. [`<fillUnit>`](fill-unit.md). |
| `#aiActivePosition` | FLOAT | — | Положение `0…1`, в которое инструмент принудительно ставится при запуске помощника. |
| `#allowSaving` | BOOL | `true` | Сохранять ли положение в сейв. |

---

## 7. Прочие атрибуты

| Путь | Тип | По умолчанию | Описание |
|---|---|---|---|
| `#playSound` | BOOL | `false` | Проигрывать гидравлический звук при движении. |
| `#isConsumingPower` | BOOL | `false` | Пока узел движется, потребитель мощности считается активным. |
| `#isEasyControlTarget` | BOOL | `false` | Узел участвует в схеме Easy Arm Control. |
| `#isIntitialDirty` | BOOL | `true` | Пересчитать узел сразу после загрузки. Имя атрибута в движке именно с такой опечаткой. |
| `#delayedNode` | NODE | — | Узел, обновляемый с задержкой. |
| `#delayedFrames` | INT | `3` | Величина задержки в кадрах. |

Связи с остальной техникой — `<dependentPart>`, `<componentJoint>`, `<dependentAnimation>`,
`<dependentMovingTool>`, `<attacherJoint>`, `#wheelIndices` — общие для инструментов и частей и
описаны в [`<cylindered>`](cylindered.md).

---

## 8. Примеры

Стрела фронтального погрузчика с зависимым цилиндром:

```xml
<movingTool node="armPivot" playSound="true" isConsumingPower="true">
    <rotation rotationAxis="1" rotSpeed="15" rotAcceleration="60" rotMin="-5" rotMax="45" startRot="0"/>
    <controls axis="AXIS_FRONTLOADER_ARM" iconName="ARM_UPDOWN" groupIndex="1"/>
    <dependentPart node="armCylinderPart"/>
</movingTool>
```

Телескоп с ограничением по складыванию:

```xml
<movingTool node="telescopeNode" foldMinLimit="0.99" foldMaxLimit="1">
    <translation translationAxis="3" transSpeed="0.6" transMin="0" transMax="2.4" startTrans="0"/>
    <controls axis="AXIS_FRONTLOADER_TOOL2" groupIndex="1"/>
</movingTool>
```

Задний борт анимацией, доступный только на пустом кузове:

```xml
<movingTool node="tailgateNode" fillUnitIndex="1" maxFillLevel="0.01" allowSaving="false">
    <animation animName="openTailgate" animSpeed="0.5" animMinTime="0" animMaxTime="1"/>
    <controls axis="AXIS_TAILGATE"/>
</movingTool>
```

---

## 9. Типичные ошибки

- **Нет `<controls#axis>`** — узел объявлен, но игроку недоступен: осью его никто не двигает.
- **Не заданы пределы** (`rotMin`/`rotMax`, `transMin`/`transMax`) — узел уходит в бесконечность
  или дёргается на границе.
- **`#startRot` вне диапазона** — при спавне узел сразу упирается в предел.
- **Цилиндры описаны инструментами** — каждый шток становится отдельной осью управления; штоки
  должны быть [`<movingPart>`](moving-parts.md) в `<dependentPart>`.
- **Ось вращения не совпадает с осью узла в i3d** — узел крутится не в той плоскости; правится
  ориентацией transform group, а не подбором `#rotationAxis`.
- **`#allowSaving` забыт у служебных узлов** — после перезагрузки техника оказывается в неожиданном
  положении.

---

## 10. Примечания

- Положение инструмента пишется в сейв (`#translation`, `#rotation`, `#animationTime`).
- Один инструмент может ограничивать другой через `<dependentMovingTool>` — так делают, когда
  ковш нельзя завалить при поднятой стреле.
- Схема `movingTool` переиспользуется блоками захватов: `logGrab…claw.movingTool`,
  `baleGrab.grab.movingTool`.
- Поведение — по движку FS25 (`vehicles/specializations/Cylindered.lua`).

---

## Глоссарий

[^bool]: BOOL — логический тип (`true`/`false`). <https://en.wikipedia.org/wiki/Boolean_data_type>
[^int]: INT — целочисленный тип. <https://en.wikipedia.org/wiki/Integer_(computer_science)>
[^float]: FLOAT — число с плавающей точкой. <https://en.wikipedia.org/wiki/Floating-point_arithmetic>
[^angle]: ANGLE — угол; в XML записывается в градусах, движок хранит в радианах. <https://en.wikipedia.org/wiki/Radian>
[^string]: STRING — строковый тип значения. <https://en.wikipedia.org/wiki/String_(computer_science)>
[^node]: NODE — ссылка на узел i3d (имя i3d-маппинга или путь `компонент>ребёнок|ребёнок`). <https://en.wikipedia.org/wiki/Scene_graph>
