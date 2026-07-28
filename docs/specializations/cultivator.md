# Farming Simulator 2025
## Спецификация `<cultivator>`

```xml
<cultivator useDeepMode="false">
    <sounds>
        <work template="DEFAULT_CULTIVATOR_WORK" linkNode="soundNode"/>
    </sounds>
</cultivator>
```

Поверхностная обработка почвы: при опущенном и движущемся орудии переписывает карту плотности поля —
задаёт культивированное/семенное ложе, уничтожает всходы и сорняки, стирает следы колёс. Дисковый
лущильник (ЛДГ) в FS реализуется этой спекой с `useDeepMode="false"`.

> Расположение: спека техники, блок `<vehicle.cultivator>`. Раздел справочника — Specializations.

---

## 1. Что это и предпосылки

Требует спеку **WorkArea** (`prerequisitesPresent` → `hasSpecialization(WorkArea)`). Сам `<cultivator>`
геометрию рабочей зоны **не** задаёт — он **переклассифицирует** рабочие зоны: `WorkAreaType.DEFAULT`
превращается в `WorkAreaType.CULTIVATOR`. Обработку почвы вызывает спека WorkArea через колбэк
`processCultivatorArea`.

Пахоту (`PLOWED`) не создаёт — это «лёгкий» проход обработки.

---

## 2. Разделение: `<cultivator>` vs `<workArea>`

- **`<cultivator>`** — *что* писать в почву (культивация / дисковка) и режимы (глубоко/мелко, subsoiler,
  power harrow), звук. Собственных узлов/геометрии **нет**.
- **`<workAreas><workArea>`** — *где* обрабатывать (прямоугольник по узлам). Именно этот блок несёт
  `type`, `start/width/height` узлы и функцию `processCultivatorArea`.

Дисковому лущильнику нужны **оба** блока.

---

## 3. Атрибуты `<cultivator>`

| Путь | Тип | По умолчанию | Описание |
|---|---|---|---|
| `#useDeepMode` | BOOL[^bool] | `true` | Культиватор (глубоко) vs дисковый лущильник/семенное ложе (мелко). Раздел 6. |
| `#isSubsoiler` | BOOL | `false` | Дополнительно вызывает `updateSubsoilerArea` (глубокое рыхление / снятие «требуется глубокорыхление»). Независимо от `useDeepMode`. |
| `#isPowerHarrow` | BOOL | `false` | Активная (роторная) борона: работает как культиватор, но при навешенной сеялке культивация отключается (работает только сеялка); связывает состояние включения с орудиями. |
| `.directionNode#node` | NODE[^node] | `components[1].node` | Узел, по +Z которого считается направление обработки (угол текстуры культивации следует за движением). |
| `.onlyActiveWhenLowered#value` | BOOL | `true` | Обрабатывать только когда орудие опущено (`getIsLowered`). |
| `.sounds.work(?)` | звук | — | Рабочий звук (раздел 4). Индексируемый: `work`, `work(1)`, … |

**Только FS25:** `…workMode#useDeepMode` (BOOL) — переопределение deep/melko **на выбранный рабочий
режим** (переключается в игре через спеку WorkMode). В FS22 `useDeepMode` фиксирован при загрузке.

Устаревшее: `directionNode#index` → `#node`.

---

## 4. `<sounds><work>` — звуковой сэмпл

Регистрируется через `SoundManager` (`vehicle.cultivator.sounds.work(?)`). Атрибуты каждого `<work>`:

| Атрибут | Тип | По умолчанию | Описание |
|---|---|---|---|
| `template` | STRING[^string] | — | Имя шаблона из `$data/sounds/soundTemplates.xml` (напр. `DEFAULT_CULTIVATOR_WORK`) — даёт файл и все параметры; далее переопределяют только нужное. |
| `linkNode` | NODE | компонент/корень | Узел i3d, к которому привязан 3D-звук (позиция источника). Не резолвится → откат к корню + предупреждение. |
| `linkNodeOffset` | VEC3 | — | Смещение источника от `linkNode`. |
| `file` | STRING | из шаблона | Путь WAV/OGG (обычно из шаблона). |
| `innerRadius` / `outerRadius` | FLOAT[^float] | `5` / `80` | Радиус полной громкости / затухания. |
| `volumeScale` / `pitchScale` | FLOAT | `1` / `1` | Множители громкости/тона. |
| `loops` | INT[^int] | `1` (`0` = бесконечно) | Число повторов. |
| `fadeIn` / `fadeOut` | FLOAT | — | Времена нарастания/затухания, с. |
| `.modifier(?)#type/#value/#modifiedValue` | — | — | Динамические модификаторы по значениям техники. |

`template` = «взять пресет за основу»; `linkNode` = «где в модели звучит».

---

## 5. Как обрабатывается почва

В `processCultivatorArea` по каждой рабочей зоне, пока активна:

1. Берутся мировые позиции прямоугольника зоны (`start`, `width`, `height`).
2. Если включено:
   - **глубоко** (`useDeepMode=true`): `FSDensityMapUtil.updateCultivatorArea(...)` — состояние
     культивации, уничтожение всходов/сорняков;
   - **мелко** (`useDeepMode=false`): `FSDensityMapUtil.updateDiscHarrowArea(...)` — вариант
     дисковой бороны/семенного ложа;
   - плюс `updateVineCultivatorArea(...)` (виноградник).
3. Если `isSubsoiler` — сверху `updateSubsoilerArea(...)`.
4. **Всегда** `eraseTireTrack(...)` — стирание следов колёс/технологической колеи.
5. `isWorking = getLastSpeed() > 0.5` — управляет звуком, грязью, износом, статистикой.

`limitToField`/ограничение уничтожения фруктов полем зависят от прав `createFields`; угол обработки —
из `directionNode`. Таблица типов почвы и удаление сорняков — внутри движковых `FSDensityMapUtil.*`.

---

## 6. `useDeepMode` — семантика

- По умолчанию `true`. Док-строка схемы: *«true — ведёт себя как культиватор; false — дисковая борона
  или комбинация семенного ложа»*.
- **Глубоко (true)** → `updateCultivatorArea`; AI-требования почвы «deep» (начинается со `STUBBLE_TILLAGE`,
  `SEEDBED`…).
- **Мелко (false)** → `updateDiscHarrowArea`; AI-требования «flat» (начинается с `CULTIVATED`, `PLOWED`…),
  т.е. ожидается уже обработанная поверхность.
- Это **не** subsoiler (тот — отдельный `isSubsoiler`); `useDeepMode` лишь выбирает движковый вызов и
  набор AI-типов почвы.
- **Переключаемость:** FS22 — фиксировано при загрузке; **FS25 — можно на рабочий режим** через
  `workMode#useDeepMode` (переключается в игре).

---

## 7. `linkNode` из примера — опечатка

В присланном примере `linkNode="0>"` — **некорректное/обрезанное значение**. `linkNode` типа NODE_INDEX
резолвится через i3d-маппинги/компоненты. Валидные формы:
- **имя i3d-маппинга**: `linkNode="soundNode"` (объявлено в `<i3dMappings>`), либо
- **путь по индексам узла**: `linkNode="0>0|1|2"` — индекс компонента, затем `>`, затем цепочка детей
  через `|`.

`"0>"` = «компонент 0 + пустой путь» — обрезано; не зарезолвится, звук привяжется к корню с
предупреждением `Could not find linkNode … Ignoring it!`. Исправить на имя маппинга или полный путь
`компонент>ребёнок|ребёнок`. (`template="DEFAULT_CULTIVATOR_WORK"` — верно.)

---

## 8. Связки

- **SowingMachine (прямой посев):** если дочерняя сеялка требует включения/использует свои AI-требования,
  культиватор снимает свои AI-требования почвы и отдаёт их сеялке — классика «культиватор + сеялка =
  прямой посев».
- **`isPowerHarrow` + сеялка:** культивация отключается (`isEnabled=false`), работает только сеялка;
  включение орудий связывается (`onStateChange` TURN_ON/OFF).
- **Roller** в цепочке добавляет `ROLLER_LINES`/`ROLLED_SEEDBED` в исключаемые AI-типы.
- **Foldable/AttacherJoints** ортогональны — складывание лишь меняет «опущено», что гейтит работу через
  `onlyActiveWhenLowered`.

---

## 9. Мультиплеер и активация

- Отдельного сетевого состояния/событий у спеки **нет**: запись в карту плотности — серверная (реплики
  движка), статистика — сервер, звук — клиент. Синхронизировать на уровне культиватора нечего.
- **Активация автоматическая:** зона CULTIVATOR активна при опущенном орудии и после дебаунса ~2000 мс
  после прицепки, а `isWorking` — при скорости `> 0.5`. `TurnOnVehicle` **не** требуется (кроме
  `isPowerHarrow`, где включение важно).
- Ограничение скорости по умолчанию — 15 км/ч; грязь/износ масштабируются от рабочей скорости.

---

## 10. Примеры

Как в присланном блоке (лущильник, мелко), с исправленным `linkNode`:

```xml
<cultivator useDeepMode="false">
    <sounds>
        <work template="DEFAULT_CULTIVATOR_WORK" linkNode="soundNode"/>
    </sounds>
</cultivator>
```

Полная связка для дискового лущильника (нужны обе части):

```xml
<cultivator useDeepMode="false" isSubsoiler="false" isPowerHarrow="false">
    <directionNode node="0>"/>              <!-- узел направления обработки -->
    <sounds>
        <work template="DEFAULT_CULTIVATOR_WORK" linkNode="soundNode"/>
    </sounds>
</cultivator>

<workAreas>
    <workArea type="cultivator">
        <area startNode="workAreaStart" widthNode="workAreaWidth" heightNode="workAreaHeight"/>
        <groundReferenceNode node="groundRef" ... />
    </workArea>
</workAreas>
```

---

## 11. Типичные ошибки

- **Нет спеки/блока `<workAreas>`** — `<cultivator>` без рабочих зон почву не трогает (геометрия — там).
- **Обрезанный/неверный `linkNode`** (как `"0>"`) — звук не привяжется к нужному узлу (откат к корню).
- **Ожидание пахоты** — культиватор создаёт культивацию/семенное ложе, не `PLOWED`.
- **Путаница `useDeepMode` и `isSubsoiler`** — это разные вещи: режим почвы vs глубокое рыхление.
- **Нет узла грунт-референса** — спека предупреждает при отсутствии `groundReferenceNode(1)`.
- **Ставка на ручное включение** — базовый культиватор активируется сам (опущен + движется), не через
  `turnOn` (исключение — power harrow).

---

## 12. Примечания

- `<cultivator>` = что/режим/звук; `<workArea type="cultivator">` = где. Нужны оба.
- `useDeepMode=false` = дисковая борона/лущильник (`updateDiscHarrowArea`); `true` = культиватор
  (`updateCultivatorArea`).
- `eraseTireTrack` выполняется всегда; `updateSubsoilerArea` — только при `isSubsoiler`.
- Активация автоматическая (опущено + скорость); сетевого состояния у спеки нет.
- Механика подтверждена по исходникам FS22 `vehicles/specializations/Cultivator.lua` и `SoundManager`.
  **FS25 — полный исходник**; XML-схема самого `<cultivator>` идентична FS22, кроме FS25-переключения
  `workMode#useDeepMode` (и внутренних отличий: `processVineCultivatorArea`, `loadWorkModeFromXML`,
  `onWorkModeChanged`).

---

## Глоссарий

[^bool]: BOOL — логический тип (`true`/`false`). <https://en.wikipedia.org/wiki/Boolean_data_type>
[^float]: FLOAT — число с плавающей точкой. <https://en.wikipedia.org/wiki/Floating-point_arithmetic>
[^int]: INT — целочисленный тип. <https://en.wikipedia.org/wiki/Integer_(computer_science)>
[^string]: STRING — строковый тип значения. <https://en.wikipedia.org/wiki/String_(computer_science)>
[^node]: NODE — ссылка на узел i3d (имя i3d-маппинга или путь `компонент>ребёнок|ребёнок`). <https://en.wikipedia.org/wiki/Scene_graph>
