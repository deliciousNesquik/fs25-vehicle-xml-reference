# Farming Simulator 2025
## Блок `<ai>` в XML техники/оборудования

Настройки автопомощника (AI worker, наёмный работник): габариты машины для навигатора[^pathfinder],
рулевые колёса, зона обнаружения препятствий, рабочая ширина и параметры разворотов на поле.

Источник схемы: спецификации `AIDrivable` (`AIDrivable.lua`), `AIImplement` (`AIImplement.lua`),
`AIVehicle` (`AIVehicle.lua`), `FS25`. Ключи `vehicle.ai.agent`, `vehicle.ai.collisionTrigger` и др.

> Расположение: `<ai>` — дочерний элемент корня `<vehicle>`. Раздел справочника — `specializations`.

---

## 1. Что это

`<ai>` описывает всё, что нужно наёмному работнику, чтобы вести технику самостоятельно:
- **`<agent>`** — габаритная коробка[^bbox] и рулевая геометрия всей машины для навигатора;
- **`<collisionTrigger>`** — коробка обнаружения препятствий впереди (и сзади) техники;
- **`<areaMarkers>` / `<sizeMarkers>`** — рабочая ширина и границы захвата на поле;
- параметры разворотов: `minTurningRadius`, `turningRadiusLimitation`, `allowTurnBackward`,
  `toolReverserDirectionNode` и другие.

Блок читают разные спецификации: самоходную технику (комбайны, тракторы) обслуживает
`AIDrivable` (`<agent>`), навесное/прицепное оборудование — `AIImplement` (маркеры, триггер,
развороты). Поэтому под-элементы `<ai>` — «братья» друг другу, порядок не важен.

Ваш пример корректен:

```xml
<ai>
    <agent frontWheelNodes="wheelFrontLeft wheelFrontRight"/>
    <collisionTrigger useSize="true"/>
</ai>
```

- `agent` — задаёт передние (рулевые) колёса по узлам i3d; остальные габариты движок
  берёт из блока `<size>`.
- `collisionTrigger useSize="true"` — коробку обнаружения препятствий строит из `<size>`
  автоматически, ставит её перед машиной.

---

## 2. `<ai><agent>` — габариты и рулевая геометрия

Читается спецификацией `AIDrivable` (самоходная техника). Незаданные габариты движок берёт
из блока `<size>` (метод `getAIAgentSize`).

| Атрибут | Тип | По умолчанию | Описание |
|---|---|---|---|
| `width` | FLOAT | из `<size>` | Ширина машины для навигатора, м. |
| `length` | FLOAT | из `<size>` | Длина машины, м. |
| `lengthOffset` | FLOAT | `0` | Смещение центра коробки по длине, м. |
| `height` | FLOAT | из `<size>` | Высота машины, м. |
| `frontOffset` | FLOAT | `3` | Вынос переднего края коробки вперёд, м. |
| `frontWheelNodes` | NODE_INDICES[^node] | — | Список узлов рулевых (передних) колёс. |
| `frontWheelIndices` | VECTOR_N[^vecn] | — | То же, но индексами колёс из `<wheels>`. |
| `maxTurningRadius` | FLOAT | из подвески | Макс. радиус разворота (переопределяет расчёт по геометрии Аккермана[^ackermann]). |
| `maxBrakeAcceleration` | FLOAT | `5` | Макс. торможение, м/с². |
| `maxCentripetalAcceleration` | FLOAT | `1` | Макс. поперечное (центростремительное) ускорение в повороте, м/с². |

Задают либо `frontWheelNodes` (по именам/узлам i3d), либо `frontWheelIndices` (по номерам колёс);
это нужно, чтобы движок вычислил центр поворота и радиус.

### Примеры

Минимум — только рулевые колёса, габариты из `<size>`:

```xml
<ai>
    <agent frontWheelNodes="wheelFrontLeft wheelFrontRight"/>
</ai>
```

Явные габариты и ограничение радиуса разворота:

```xml
<ai>
    <agent width="2.8"
           length="6.2"
           frontOffset="3.5"
           frontWheelNodes="wheelFrontLeft wheelFrontRight"
           maxTurningRadius="7.5"/>
</ai>
```

Рулевые колёса индексами (порядок из блока `<wheels>`, 1-based):

```xml
<ai>
    <agent frontWheelIndices="1 2"/>
</ai>
```

> Атрибутов `sizeWidth`, `sizeLength`, `offset` у `<agent>` **нет** — не использовать.

---

## 3. `<ai><collisionTrigger>` — обнаружение препятствий

Читается спецификацией `AIImplement`. Коробка, которой работник «прощупывает» пространство
впереди (при движении назад — сзади), чтобы затормозить перед препятствием.

| Атрибут | Тип | По умолчанию | Описание |
|---|---|---|---|
| `useSize` | BOOL | `false` | Строить коробку из блока `<size>` и ставить её перед машиной. |
| `node` | NODE_INDEX[^node] | — | Узел-триггер (пустая трансформгруппа[^tg]). Задаётся, если не `useSize`. |
| `backNode` | NODE_INDEX | авто | Узел-триггер для движения назад (ось Z направлена назад). При `useSize` создаётся автоматически. |
| `width` | FLOAT | `4` (или из `<size>`) | Ширина коробки, м. |
| `height` | FLOAT | `3` (или из `<size>`) | Высота коробки, м. |
| `length` | FLOAT | `5` | Максимальная длина коробки (дальность обзора), м. |

Поведение загрузчика:
- **`useSize="true"`, без `node`** — движок создаёт трансформгруппу от `rootNode`, ставит её у
  переднего края коробки `<size>`; `width`/`height` при этом берутся из `<size>`, `length` = `5`.
  Симметричный `backNode` создаётся сзади с разворотом на 180°. Рекомендуемый способ.
- **`node` указывает на shape (меш)** — движок пишет предупреждение об устаревшем формате и
  просит пустую трансформгруппу с атрибутами размера.

### Примеры

Автоматически из `<size>` (типовой случай):

```xml
<ai>
    <collisionTrigger useSize="true"/>
</ai>
```

Явная коробка от узла i3d:

```xml
<ai>
    <collisionTrigger node="aiCollisionTrigger"
                      width="3.0"
                      height="3.0"
                      length="6.0"/>
</ai>
```

С отдельным узлом для движения назад:

```xml
<ai>
    <collisionTrigger node="aiCollisionFront"
                      backNode="aiCollisionBack"
                      width="3.0"
                      length="5.0"/>
</ai>
```

> Атрибута `collisionMask` у `<ai>` **нет** — маска столкновений задаётся движком (константа
> `AICollisionTriggerHandler.COLLISION_MASK`), в XML не выносится.

---

## 4. Рабочая зона: `<areaMarkers>` и `<sizeMarkers>`

Читается спецификацией `AIImplement`. Маркеры задают прямоугольник захвата, по которому
строятся проходы по полю.

### `<areaMarkers>` — рабочая ширина (зона обработки)

| Атрибут | Тип | По умолчанию | Описание |
|---|---|---|---|
| `leftNode` | NODE_INDEX | — | Левый край рабочей зоны. |
| `rightNode` | NODE_INDEX | — | Правый край рабочей зоны. |
| `backNode` | NODE_INDEX | — | Задний край рабочей зоны. |
| `width` | FLOAT | авто | Рабочая ширина, м (по умолчанию считается по расстоянию между маркерами). |
| `sideOffset` | FLOAT | `0` | Боковое смещение зоны относительно центра ведущей машины, м. |
| `sideOffsetHeadlandAlternate` | BOOL | `false` | Чередовать боковое смещение на разворотной полосе[^headland]. |
| `validityOffset` | FLOAT | `0` | Боковой отступ при проверке валидности сегментов, м. |

### `<sizeMarkers>` — физический габарит (для геометрии разворотов)

| Атрибут | Тип | По умолчанию | Описание |
|---|---|---|---|
| `leftNode` | NODE_INDEX | — | Левый край габарита. |
| `rightNode` | NODE_INDEX | — | Правый край габарита. |
| `backNode` | NODE_INDEX | — | Задний край габарита. |

Задают, когда физическая ширина техники отличается от рабочей (например, крылья шире зоны захвата).

### Пример

```xml
<ai>
    <areaMarkers leftNode="aiMarkerLeft"
                 rightNode="aiMarkerRight"
                 backNode="aiMarkerBack"/>
    <sizeMarkers leftNode="aiSizeLeft"
                 rightNode="aiSizeRight"
                 backNode="aiSizeBack"/>
</ai>
```

---

## 5. Развороты и поведение на поле (`<ai>`, spec `AIImplement`)

Прямые дочерние элементы `<ai>`; у большинства значение лежит в атрибуте `#value`.

| Элемент / атрибут | Тип | По умолчанию | Описание |
|---|---|---|---|
| `minTurningRadius#value` | FLOAT | — | Минимальный радиус разворота инструмента, м. |
| `needsLowering#value` | BOOL | `true` | Инструмент нужно опускать для работы. |
| `needsLowering#lowerIfAnyIsLowered` | BOOL | `false` | Опускать, если опущен любой присоединённый AI-инструмент. |
| `needsRootAlignment#value` | BOOL | `true` | Инструмент должен смотреть в ту же сторону, что и ведущая машина. |
| `allowTurnBackward#value` | BOOL | `true` | Разрешён разворот задним ходом с этим инструментом. |
| `allowTurnBackward#straighteningSegmentLength` | FLOAT | — | Длина участка выравнивания после разворота, м. |
| `blockTurnBackward#value` | BOOL | `false` | Запретить движение назад (для не-AI инструментов). |
| `toolReverserDirectionNode#node` | NODE_INDEX | — | Целевой узел направления при движении назад (реверс). |
| `turningRadiusLimitation#rotationJointNode` | NODE_INDEX | — | Узел шарнира ограничения радиуса. |
| `turningRadiusLimitation#wheelIndices` | VECTOR_N | — | Индексы колёс, участвующих в ограничении. |
| `turningRadiusLimitation#radius` | FLOAT | — | Радиус ограничения, м. |
| `lookAheadSize#value` | FLOAT | `2` | Насколько далеко проверять землю перед инструментом, м. |
| `overlap#value` | FLOAT | движок | Перекрытие соседних проходов, м. |
| `hasNoFullCoverageArea#value` | BOOL | `false` | Инструмент не покрывает всю зону (например плуги). |
| `hasNoFullCoverageArea#offset` | FLOAT | `0` | Смещение неполной зоны, м. |
| `headland#minNumHeadlands` | INT | — | Минимальное число разворотных полос. |

### Пример

```xml
<ai>
    <agent frontWheelNodes="wheelFrontLeft wheelFrontRight"/>
    <collisionTrigger useSize="true"/>
    <minTurningRadius value="4.5"/>
    <needsLowering value="true"/>
    <allowTurnBackward value="false"/>
    <toolReverserDirectionNode node="aiReverserNode"/>
</ai>
```

---

## 6. Как настроить (порядок действий)

1. **Самоходная техника (трактор/комбайн):** достаточно `<agent>` с `frontWheelNodes` — габариты
   подтянутся из `<size>`. Проверьте, что переданы именно рулевые (передние) колёса.
2. **Обнаружение препятствий:** начните с `<collisionTrigger useSize="true"/>`. Если коробка
   получается неудачной формы, задайте узел `node` и размеры вручную.
3. **Прицепное/навесное оборудование:** задайте `<areaMarkers>` (рабочая ширина). Если физический
   габарит шире зоны захвата — добавьте `<sizeMarkers>`.
4. **Развороты:** если техника разворачивается некорректно, ограничьте `minTurningRadius`;
   для широких прицепов часто нужен `allowTurnBackward value="false"`.

### Устройство узлов в GIANTS Editor

- Узлы для `frontWheelNodes` — те же трансформгруппы колёс, что заданы в `<wheels>`.
- Триггер `collisionTrigger#node` и маркеры — **пустые трансформгруппы** (Transform Group),
  не меши. Имена узлов должны быть прописаны в `<i3dMappings>` (см. раздел i3dMappings).
- Ось `+Z` узла-триггера направлена вперёд по движению; для `backNode` — назад.

---

## 7. Типичные ошибки

- `collisionTrigger#node` указывает на **меш (shape)** вместо пустой трансформгруппы — движок
  пишет предупреждение об устаревшем формате.
- В `frontWheelNodes` переданы **задние** колёса — неверный центр поворота, техника «рыскает».
- Указаны несуществующие имена узлов, не прописанные в `<i3dMappings>` — маркеры/триггер не находятся.
- Попытка задать `sizeWidth`/`sizeLength`/`offset` у `<agent>` или `collisionMask` у `<ai>` — таких
  атрибутов нет, они игнорируются.

---

## 8. Примечания

- Незаданные габариты `<agent>` и коробка `useSize` берутся из блока `<size>` — держите `<size>`
  корректным, это влияет и на навигацию.
- Маска столкновений триггера зашита в движке и в XML не настраивается.
- Автопомощник в мультиплеере рассчитывается на сервере.

---

## Глоссарий

[^pathfinder]: Навигатор (pathfinder) — модуль движка, строящий маршрут в обход препятствий. <https://en.wikipedia.org/wiki/Pathfinding>
[^bbox]: Габаритная коробка (bounding box) — прямоугольный объём, описывающий размеры объекта. <https://en.wikipedia.org/wiki/Bounding_volume>
[^ackermann]: Рулевая геометрия Аккермана — схема поворота колёс, при которой они катятся без проскальзывания вокруг общего центра. <https://en.wikipedia.org/wiki/Ackermann_steering_geometry>
[^headland]: Разворотная полоса (headland) — краевая зона поля, где техника разворачивается между проходами. <https://en.wikipedia.org/wiki/Headland_(agriculture)>
[^node]: Нода (узел) — узел графа сцены (трансформация или объект). NODE_INDEX — одна нода, NODE_INDICES — список. <https://en.wikipedia.org/wiki/Scene_graph>
[^vecn]: VECTOR_N — список чисел через пробел (здесь — индексы колёс).
[^tg]: Трансформгруппа (transform group) — пустой узел-контейнер без геометрии, задающий положение/поворот.
