---
title: "Блок <movingPart> — ведомые узлы"
description: "Штоки, тяги и телескопы: выравнивание на точку отсчёта, ограничение осей, translatingPart и режимы обновления."
sidebar:
  label: "movingPart"
---

```xml
<movingParts>
    <movingPart node="cylinderPart" referencePoint="cylinderRef" referenceFrame="armPivot">
        <dependentPart node="pistonPart"/>
    </movingPart>
</movingParts>
```

`<movingPart>` — узел, который **не управляется**, а следует за геометрией: шток цилиндра
поворачивается к своей проушине, тяга держит направление, секция телескопа выдвигается ровно
настолько, насколько разъехались концы. Своей скорости и осей ввода у части нет — она пересчитывается
в тот момент, когда сдвинулся тот, от кого она зависит.

Управляемые узлы — это [`<movingTool>`](moving-tools.md); общая модель цепочек и звук описаны в
[`<cylindered>`](cylindered.md).

> Расположение: блок `vehicle.cylindered.movingParts`. Раздел справочника — Specializations.
>
> Источник схемы: `Cylindered.registerMovingPartXMLPaths` (FS25).

---

## 1. Модель: узел, точка и система отсчёта

| Путь | Тип | По умолчанию | Описание |
|---|---|---|---|
| `#node` | NODE[^node] | — | Сам подвижный узел. Обязателен. |
| `#referencePoint` | NODE | — | Точка, на которую узел «смотрит». |
| `#referencePoints` | NODE-список | — | Несколько точек; берётся их усреднённое положение. |
| `#referenceFrame` | NODE | — | Система отсчёта, относительно которой считается направление. |
| `#moveToReferenceFrame` | BOOL[^bool] | `false` | Не только поворачивать, но и перемещать узел в систему отсчёта. |

Базовый сценарий гидроцилиндра: корпус цилиндра — часть с `referencePoint` на проушине штока,
`referenceFrame` — узел, относительно которого считается разворот. При движении стрелы проушина
уезжает, и часть доворачивается вслед за ней.

Движок предупреждает, если система отсчёта совпадает с самим узлом:
`Reference frame equals moving part node. This can lead to bad behaviours!`.

---

## 2. Режимы выравнивания

Взаимоисключающие способы «как именно доворачивать»:

| Путь | Тип | По умолчанию | Описание |
|---|---|---|---|
| `#doDirectionAlignment` | BOOL | `true` | Направление узла выравнивается на точку отсчёта. Основной режим. |
| `#doRotationAlignment` | BOOL | `false` | Вместо направления копируется поворот; масштабируется через `#rotMultiplier` (`0`). |
| `#doLineAlignment` | BOOL | `false` | Выравнивание на линию (линия — набор узлов `<orientationLine>`). |
| `#doInversedLineAlignment` | BOOL | `false` | Линия внутри самой части, а точка отсчёта фиксирована. |
| `#do3DLineAlignment` | BOOL | `false` | Выравнивание по X и Y на линию ровно из двух узлов. |
| `#alignToWorldY` | BOOL | `false` | Держать узел по мировой вертикали (ковши, платформы). |

Одновременное включение направления и поворота, либо направления и линии, движок считает ошибкой
настройки и пишет предупреждение: `Direction alignment and rotation alignment used at the same
time`, `Direction alignment and line alignment used at the same time`.

Линия задаётся под-элементом `<orientationLine>`: `.lineNode(?)#node` — узлы линии,
`#partLength` (`0.5`) — расстояние от части до линии, `#partLengthNode` — узел для динамического
измерения длины, `#referenceTransNode` — узел, который двигается по линии и служит точкой
направления. Для `#do3DLineAlignment` он обязателен, а узлов линии должно быть ровно два.

---

## 3. Ограничение осей

| Путь | Тип | По умолчанию | Описание |
|---|---|---|---|
| `#limitedAxis` | INT[^int] | — | Ось, вокруг которой разрешён поворот: `1` — X, `2` — Y, `3` — Z. |
| `#minRot` / `#maxRot` | ANGLE[^angle] | — | Пределы поворота по этой оси. |
| `#invertZ` | BOOL | `false` | Инвертировать направление оси Z. |
| `#scaleZ` | BOOL | `false` | Разрешить масштабирование по Z вместо перемещения. |

`#minRot` и `#maxRot` работают **только вместе с** `#limitedAxis`; без него движок пишет
`minRot/maxRot requires the use of limitedAxis`.

---

## 4. Расстояния до точки отсчёта

Эти атрибуты определяют, как далеко часть должна держаться от точки:

| Путь | Тип | По умолчанию | Описание |
|---|---|---|---|
| `#referenceDistance` | FLOAT[^float] | из i3d | Расстояние, которое надо выдерживать, вместо фактического в модели. |
| `#referenceDistancePoint` | NODE | — | Узел, чья Z-трансляция берётся как эталонное расстояние. |
| `#localReferencePoint` | NODE | — | Локальная точка отсчёта внутри части. |
| `#localReferenceDistance` | FLOAT | считается автоматически | Заранее заданное локальное расстояние. |
| `#updateLocalReferenceDistance` | BOOL | `false` | Пересчитывать локальное расстояние каждый раз. |
| `#dynamicLocalReferenceDistance` | BOOL | `false` | Считать локальное расстояние от исходного и направления локальной точки. |
| `#localReferenceTranslate` | BOOL | `false` | Смещать узел к локальной точке отсчёта. |
| `#useLocalOffset` | BOOL | `false` | Учитывать локальное смещение. |

---

## 5. Телескопы: `<translatingPart>`

```xml
<movingPart node="boomBase" referencePoint="boomTip" divideTranslatingDistance="true">
    <translatingPart node="section01" minZTrans="0" maxZTrans="1.2"/>
    <translatingPart node="section02" minZTrans="0" maxZTrans="1.2"/>
</movingPart>
```

| Путь | Тип | По умолчанию | Описание |
|---|---|---|---|
| `.translatingPart(?)#node` | NODE | — | Выдвигающаяся секция. |
| `.translatingPart(?)#referenceDistance` | FLOAT | — | Эталонное расстояние для секции. |
| `.translatingPart(?)#minZTrans` / `#maxZTrans` | FLOAT | — | Пределы хода секции по Z. |
| `#divideTranslatingDistance` | BOOL | `true` | `true` — все секции едут одновременно, деля общий ход; `false` — по очереди, в порядке XML. |
| `.translatingPart(?)#divideTranslatingDistance` | BOOL | значение части | Своё правило для конкретной секции: например первая выдвигается целиком, а остальные потом синхронно. |

---

## 6. Когда часть пересчитывается

| Путь | Тип | По умолчанию | Описание |
|---|---|---|---|
| `#isActiveDirty` | BOOL | `false` | Пересчитывать постоянно, а не только по цепочке зависимостей. |
| `#maxUpdateDistance` | STRING[^string] | — | Ограничение расстояния до корня техники при `#isActiveDirty`; `-` — без ограничения. |
| `#referenceDistanceThreshold` | FLOAT | `0.0001` | Порог изменения расстояния, ниже которого пересчёт пропускается. |
| `#directionThreshold` | FLOAT | `0.0001` | Порог изменения направления для неактивной техники. |
| `#directionThresholdActive` | FLOAT | `0.0001` | То же для активной. |
| `#smoothedDirectionScale` | BOOL | `false` | При отключении части (например по пределам складывания) плавно возвращать направление к исходному. |
| `#smoothedDirectionTime` | TIME | `2` | За сколько секунд происходит возврат. |
| `#playSound` | BOOL | `false` | Гидравлический звук при движении. |
| `#debug` | BOOL | `false` | Отладочная отрисовка этой части. |

Постоянный пересчёт стоит дорого: `#isActiveDirty` включают только там, где часть должна следить за
внешней геометрией (прицепленное орудие, колесо, рельеф), и всегда вместе с `#maxUpdateDistance`.
Коллизия среди детей такой части — ошибка: техника перестанет засыпать физически.

---

## 7. Связи с остальной техникой

Помимо общих `<dependentPart>`, `<componentJoint>`, `<dependentAnimation>` и `<dependentMovingTool>`
(см. [`<cylindered>`](cylindered.md)), у частей есть свои:

| Путь | Описание |
|---|---|
| `.copyLocalDirectionPart(?)#node` | Скопировать локальное направление на другой узел; `#dirScale` и `#upScale` масштабируют направление и вектор «вверх». |
| `#inputAttacherJointIndex` | Индекс входной навески `[1..n]`, к которой привязана часть. |
| `.fillVolume#fillVolumeIndex` / `#deformerNodeIndices` | Обновлять деформеры кучи груза — см. [`<fillVolume>`](fill-volume.md). |
| `#wheelIndices` / `#wheelNodes` | Колёса, пересчитываемые вслед за частью. |

---

## 8. Типичные ошибки

- **`minRot`/`maxRot` без `#limitedAxis`** — пределы игнорируются, предупреждение в логе.
- **Два режима выравнивания сразу** — направление плюс поворот или направление плюс линия;
  движок предупреждает, поведение непредсказуемо.
- **`#referenceFrame` совпадает с `#node`** — предупреждение и странное поведение части.
- **Дубликат узла в двух частях** — `Moving part with node '…' already exists!`.
- **`#isActiveDirty` без `#maxUpdateDistance`** — часть считается всегда и на любом расстоянии.
- **Коллизия внутри `#isActiveDirty`-части** — ошибка в логе, техника не засыпает.
- **Узел линии в отрицательном Z** — `Local orientation line node … is in negative Z direction to
  the movingPart node. This is not allowed!`.
- **Часть не подключена** — не указана ни в одном `<dependentPart>` и не помечена
  `#isActiveDirty`: не двигается вовсе.

---

## 9. Примечания

- Порядок частей в XML важен: цепочка пересчитывается сверху вниз, поэтому зависимая часть должна
  идти после той, от которой берёт геометрию.
- `#do3DLineAlignment` требует ровно двух узлов линии и заданного `#referenceTransNode` — иначе
  режим не загрузится.
- Поведение — по движку FS25 (`vehicles/specializations/Cylindered.lua`).

---

## Глоссарий

[^bool]: BOOL — логический тип (`true`/`false`). <https://en.wikipedia.org/wiki/Boolean_data_type>
[^int]: INT — целочисленный тип. <https://en.wikipedia.org/wiki/Integer_(computer_science)>
[^float]: FLOAT — число с плавающей точкой. <https://en.wikipedia.org/wiki/Floating-point_arithmetic>
[^angle]: ANGLE — угол; в XML записывается в градусах, движок хранит в радианах. <https://en.wikipedia.org/wiki/Radian>
[^string]: STRING — строковый тип значения. <https://en.wikipedia.org/wiki/String_(computer_science)>
[^node]: NODE — ссылка на узел i3d (имя i3d-маппинга или путь `компонент>ребёнок|ребёнок`). <https://en.wikipedia.org/wiki/Scene_graph>
