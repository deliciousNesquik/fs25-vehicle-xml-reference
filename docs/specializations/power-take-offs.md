# Farming Simulator 2025
## Блок `<powerTakeOffs>` в XML техники/оборудования

Валы отбора мощности[^pto] (ВОМ): соединение вращающегося вала трактора (выход) с орудием (вход).
Блок задаёт узлы валов, связь с точками навески и имя вала для сопоставления сторон.

Источник схемы: спецификация `PowerTakeOffs` (`PowerTakeOffs.lua`), `FS25`, ключ `vehicle.powerTakeOffs`.
Требует наличия спецификации `AttacherJoints` или `Attachable`.

> Расположение: `<powerTakeOffs>` — дочерний элемент корня `<vehicle>`. Раздел справочника — `specializations`.

---

## 1. Что это

`<powerTakeOffs>` описывает валы отбора мощности с двух сторон:
- **`<output>`** — на технике, отдающей мощность (трактор). Задаёт узел вала и точки навески,
  к которым относится этот выход.
- **`<input>`** — на технике, принимающей мощность (орудие). Задаёт узел приёма, точки навески
  и файл модели соединительного вала.
- **`<local>`** — локальный вал внутри одной единицы техники (между двумя её узлами).

При присоединении орудия выход трактора и вход орудия сопоставляются по совпадению имени вала
(`ptoName`) и общей точке навески. После совпадения модель соединительного вала орудия физически
привязывается между узлом выхода трактора и узлом входа орудия. Вращение вала — визуальный элемент
(анимация и звук), включается логикой активности ВОМ.

Пример стороны выхода (трактор):

```xml
<powerTakeOffs>
    <output outputNode="ptoBack" attacherJointIndices="1 3 4"/>
    <output outputNode="ptoFront" attacherJointIndices="2"/>
</powerTakeOffs>
```

Здесь задний вал `ptoBack` относится к точкам навески 1, 3 и 4, передний вал `ptoFront` — к точке 2.

---

## 2. Атрибуты `<powerTakeOffs>` (контейнер)

| Атрибут | Тип | По умолчанию | Описание |
|---|---|---|---|
| `ignoreInvalidJointIndices` | BOOL | `false` | Не выводить предупреждение, если индекс точки навески не найден. Полезно, когда набор точек навески меняется конфигурациями. |
| `maxUpdateDistance` | FLOAT | константа движка | Максимальное расстояние от корня техники, в пределах которого валы обновляются (визуально). |

> Числовое значение стандартного `maxUpdateDistance` (`DEFAULT_MAX_UPDATE_DISTANCE`) в открытом
> зеркале исходников отсутствует.

Блок также поддерживает звуки `<sounds><turnedOn>` и привязку к приборной панели через
`#powerTakeOffIndex`.

---

## 3. Атрибуты `<output>` (сторона трактора)

Регистрируются в `registerOutputXMLPaths`.

| Атрибут | Тип | По умолчанию | Описание |
|---|---|---|---|
| `outputNode` | NODE_INDEX[^node] | — | Узел вала отбора мощности, к которому привязывается соединительный вал. Обязателен, если не задан `skipToInputAttacherIndex`. |
| `attacherJointIndices` | VECTOR_N[^vecn] | — | Индексы точек навески (1-based), к которым относится этот выход. |
| `attacherJointNodes` | NODE_INDICES | — | То же, но узлами точек навески вместо индексов. |
| `ptoName` | STRING | `DEFAULT_PTO` | Имя вала — ключ сопоставления со входом орудия. |
| `skipToInputAttacherIndex` | INT | — | Перенаправить выход на выходы родительской техники по индексу входной точки навески (проброс мощности через промежуточную технику). |

Выход должен иметь хотя бы один корректный `attacherJointIndices` или `attacherJointNodes`, иначе
запись отбрасывается.

Вложенные элементы `<output>`: `<animationNodes>` (анимация вращения), элементы смены объектов
(`objectChange`), элементы приборной панели.

> Атрибут `filename` у `<output>` устарел — модель соединительного вала задаётся на стороне входа
> (`<input filename=…>`). Атрибуты `name`, `boundingRadius`, `maxUpdateDistance` у `<output>` отсутствуют.

---

## 4. Атрибуты `<input>` (сторона орудия)

Регистрируются в `registerInputXMLPaths`.

| Атрибут | Тип | По умолчанию | Описание |
|---|---|---|---|
| `inputNode` | NODE_INDEX | — (обязателен) | Узел приёма мощности на орудии. |
| `inputAttacherJointIndices` | VECTOR_N | — | Индексы входных точек навески (1-based), к которым относится этот вход. |
| `inputAttacherJointNodes` | NODE_INDICES | — | То же, но узлами точек навески. |
| `ptoName` | STRING | `DEFAULT_PTO` | Имя вала — ключ сопоставления с выходом трактора. |
| `filename` | STRING | `$data/shared/assets/powerTakeOffs/walterscheidW.xml` | Путь к XML модели соединительного вала. |
| `length` | FLOAT | — | Заданная длина вала. Иначе вычисляется по расстоянию между стартовым и конечным узлами. |
| `detachNode` | NODE_INDEX | — | Узел парковки отсоединённого вала (только при `Platform.gameplay.hasDetachedPowerTakeOffs`). |
| `aboveAttacher` | BOOL | `true` | Вал расположен над точкой навески (учитывается при проверке столкновений/отсоединения). |
| `materialTemplateName` | VEHICLE_MATERIAL | — | Имя общего материала для основной части вала (из `brandMaterialTemplates.xml`). |
| `decalMaterialTemplateName` | VEHICLE_MATERIAL | — | Имя общего материала для декалей вала. |

Вход должен иметь хотя бы один корректный `inputAttacherJointIndices` или `inputAttacherJointNodes`,
иначе запись отбрасывается.

Вложенные элементы `<input>`: `<animationNodes>`, элементы смены объектов (`objectChange`).

> Устаревшие атрибуты: `color` → `materialTemplateName`, `decalColor` → `decalMaterialTemplateName`.
> Атрибута `defaultOutputPtoName` не существует — сопоставление идёт по `ptoName`.

---

## 5. Индексы точек навески (`attacherJointIndices`)

Индексы — это позиции (1-based) в списке `<attacherJoints>` техники. Каждый индекс проверяется на
существование соответствующей точки навески; несуществующий индекс выводит предупреждение, если не
задан `ignoreInvalidJointIndices`. Индексы связывают вал с конкретными точками навески: при
присоединении орудия к точке `N` сопоставляются только те выходы и входы, у которых `N` есть в
списке индексов.

При отсутствии и `attacherJointIndices`, и `attacherJointNodes` запись вала не загружается.

---

## 6. Модель соединительного вала (файл `filename`)

Видимый соединительный вал (стартовый и конечный узлы, шарниры, декали) описывается в отдельном
XML-файле, на который ссылается `<input filename=…>`. Стандартный файл — `walterscheidW.xml`.
Схема этого файла (`powerTakeOff`):

| Атрибут / элемент | Тип | По умолчанию | Описание |
|---|---|---|---|
| `powerTakeOff#filename` | STRING | — | Путь к модели `.i3d` вала. |
| `startNode#node` | NODE_INDEX | — | Стартовый узел вала. |
| `linkNode#node` | NODE_INDEX | — | Узел привязки к выходу. |
| `#size` | FLOAT | `0.19` | Толщина вала. |
| `#minLength` | FLOAT | `0.6` | Минимальная длина; при меньшем расстоянии соединение отклоняется. |
| `#maxAngle` | ANGLE | `45` | Максимальный угол излома; при большем соединение отклоняется. |
| `#zOffset` | FLOAT | `0` | Смещение по оси Z. |
| `#colorMaterialName` | STRING | `powerTakeOff_main_mat` | Материал основной части. |
| `#decalColorMaterialName` | STRING | `powerTakeOff_decal_mat` | Материал декалей. |
| `#isSingleJoint` | BOOL | `false` | Одношарнирный вал. |
| `#isDoubleJoint` | BOOL | `false` | Двухшарнирный вал. |

Тип излома вала задаётся парой `isSingleJoint` / `isDoubleJoint`; при обоих `false` используется
базовый вал. Отдельного атрибута `connectionType` в схеме нет.

> Схема элемента `<local>` в открытом зеркале исходников не восстанавливается (функция регистрации
> вырезана), но во время выполнения он читает те же ключи: `startNode`, `endNode`,
> `materialTemplateName`, `decalMaterialTemplateName`, `length`, `filename`.

---

## 7. Как работает соединение

- При присоединении орудия для каждой точки навески берутся выходы трактора, затем на орудии
  ищется вход с тем же `ptoName` и совпадающей точкой навески.
- При совпадении стороны перекрёстно связываются, и модель соединительного вала орудия
  привязывается между узлом `outputNode` трактора и узлом `inputNode` орудия.
- Соединение отклоняется, если расстояние меньше `minLength` или угол больше `maxAngle` (из файла вала).
- Каждый кадр (в пределах `maxUpdateDistance`) геометрия вала пересчитывается под текущий излом,
  а анимация вращения и звук `turnedOn` включаются по состоянию активности ВОМ.
- При отсоединении соединительный вал паркуется (по `detachNode`) и связи очищаются.

---

## 8. Примеры

Сторона трактора — задний и передний валы к разным точкам навески:

```xml
<powerTakeOffs>
    <output outputNode="ptoBack"  attacherJointIndices="1 3 4"/>
    <output outputNode="ptoFront" attacherJointIndices="2"/>
</powerTakeOffs>
```

Сторона орудия — вход с моделью вала по умолчанию:

```xml
<powerTakeOffs>
    <input inputNode="ptoInput" inputAttacherJointIndices="1"/>
</powerTakeOffs>
```

Именованные валы (сопоставление по `ptoName`) — например отдельный вал для переднего навесного:

```xml
<!-- Трактор -->
<powerTakeOffs>
    <output outputNode="ptoBack"  attacherJointIndices="1" ptoName="DEFAULT_PTO"/>
    <output outputNode="ptoFront" attacherJointIndices="2" ptoName="FRONT_PTO"/>
</powerTakeOffs>

<!-- Орудие переднего навешивания -->
<powerTakeOffs>
    <input inputNode="ptoInput" inputAttacherJointIndices="1" ptoName="FRONT_PTO"/>
</powerTakeOffs>
```

Вход с указанием модели вала и материала:

```xml
<powerTakeOffs>
    <input inputNode="ptoInput"
           inputAttacherJointIndices="1"
           filename="$data/shared/assets/powerTakeOffs/walterscheidWWide.xml"
           materialTemplateName="metalPainted"/>
</powerTakeOffs>
```

---

## 9. Устройство узлов в GIANTS Editor

- `outputNode` и `inputNode` — трансформгруппы[^tg] в точках вывода/приёма вала, ось `+Z` направлена
  по оси вала. Модель соединительного вала привязывается к этим узлам.
- Собственную модель соединительного вала в i3d орудия добавлять не требуется — она берётся из
  файла `filename`.
- Индексы `attacherJointIndices` соответствуют порядку точек в блоке `<attacherJoints>`.
- Имена узлов прописываются в `<i3dMappings>` (см. раздел i3dMappings).

---

## 10. Типичные ошибки

- Не задан `attacherJointIndices` (и `attacherJointNodes`) — вал не загружается.
- `ptoName` выхода и входа не совпадают — соединение не образуется (вал остаётся неподключённым).
- Индекс точки навески указывает на несуществующую точку — предупреждение (кроме случая `ignoreInvalidJointIndices="true"`).
- Использование `filename` на `<output>` — атрибут устарел; модель вала задаётся на `<input>`.
- Расстояние между узлами меньше `minLength` или угол больше `maxAngle` — соединение отклоняется.

---

## 11. Примечания

- Вращение вала — визуальный элемент (анимация и звук); передача мощности рассчитывается отдельной логикой.
- Материалы вала задаются шаблонами материалов (`materialTemplateName`), а не прямыми цветами.
- Атрибут `skipToInputAttacherIndex` используется для проброса ВОМ через промежуточную технику.

---

## Глоссарий

[^pto]: Вал отбора мощности (Power Take-Off, PTO) — вал, передающий вращение от двигателя техники к орудию. <https://en.wikipedia.org/wiki/Power_take-off>
[^node]: Нода (узел) — узел графа сцены (трансформация или объект). NODE_INDEX — одна нода, NODE_INDICES — список. <https://en.wikipedia.org/wiki/Scene_graph>
[^vecn]: VECTOR_N — список чисел через пробел (здесь — индексы точек навески).
[^tg]: Трансформгруппа (transform group) — пустой узел-контейнер без геометрии, задающий положение и поворот.
