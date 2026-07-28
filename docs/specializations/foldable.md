# Farming Simulator 2025
## Спецификация `<foldable>`

```xml
<foldable>
    <foldingConfigurations>
        <foldingConfiguration workingWidth="10">
            <foldingParts startAnimTime="1">
                <foldingPart animationName="foldLeftWing"  speedScale="1"/>
                <foldingPart animationName="foldRightWing" speedScale="1"/>
            </foldingParts>
        </foldingConfiguration>
    </foldingConfigurations>
</foldable>
```

Складывает части техники (крылья, брусья, стрелы) между **рабочей** (разложено) и **транспортной**
(сложено) позой, проигрывая анимации и отслеживая единый нормализованный прогресс `foldAnimTime ∈ [0,1]`.
Это значение читают другие системы, чтобы включать/выключать функции по состоянию складывания
(раздел 4).

> Расположение: спека техники, блок `<vehicle.foldable>`. Раздел справочника — Specializations.

---

## 1. Что это и предпосылки

Спека не анимирует узлы сама — она **запускает** анимации и хранит общий `foldAnimTime`. Жёстких
prerequisite-спек нет, но по факту:

- `foldingPart#animationName` требует спеку **AnimatedVehicle** (анимация задаётся там).
- альтернатива без AnimatedVehicle — сырой i3d-клип через `foldingPart#rootNode` + `#animationClip`.
- `foldingPart#componentJointIndex` (физический «перелом» рамы) требует компонентных суставов.

`foldable` перезаписывает функции ~20 других систем — этим реализуется гейтинг (раздел 4).

---

## 2. Структура XML

```
vehicle.foldable.foldingConfigurations.foldingConfiguration(?)   — конфигурация (селектор в магазине)
    foldingParts                                                 — параметры всего складывания
        foldingPart(?)                                           — отдельная движущаяся часть
```

`<foldingConfiguration>` — обязательная обёртка-конфигурация (тип конфигурации называется `folding`),
атрибут `#workingWidth` (рабочая ширина в магазине) + `objectChange`-переходы. Устаревшие
`vehicle.foldingParts` / `vehicle.foldable.foldingParts` ремапятся в конфигурацию.

---

## 3. Модель состояния

- **`foldAnimTime` `[0,1]`** — мастер-таймлайн орудия. Части с разной длительностью анимации мапятся на
  него (`animTime = foldAnimTime × maxFoldAnimDuration / animDuration`); короткая часть завершается
  раньше, мастер идёт до самой длинной.
- **`foldMoveDirection` `{−1, 0, +1}`** — движение: `+1` к `1`, `−1` к `0`, `0` — стоп.
- **`turnOnFoldDirection` `{−1, +1}`** — какой конец таймлайна считается «разложено/работает».
  Развязывает полярность анимации и смысл; выводится из `startAnimTime`.
- **`foldMiddleAnimTime`** — средняя точка (транспорт/поворотная полоса); если не задан — среднего
  состояния нет (двухстадийное складывание).

Прогресс читается из фактической анимации каждый кадр; при изменении `foldAnimTime` вызывается хук
`onFoldTimeChanged`.

---

## 4. Ключевой механизм: `foldMinLimit` / `foldMaxLimit`

`foldable` **впрыскивает атрибуты `foldMinLimit`/`foldMaxLimit` (или `.folding#minLimit/#maxLimit`) в
схемы многих других спек** и включает соответствующую функцию **только когда** прогресс в окне:

```
активно, только если  foldMinLimit ≤ foldAnimTime ≤ foldMaxLimit    (по умолчанию [0,1] = всегда)
```

Так складывание само по себе отключает рабочие органы и функции. Потребители (окно + функция-гейт):

| Система | Ключ XML | Что гейтит |
|---|---|---|
| WorkArea | `workArea.folding#minLimit/#maxLimit` | рабочая зона активна только разложенной |
| FillUnit | `fillUnit#foldMinLimit/#foldMaxLimit` | приём груза |
| Cylindered movingTool/movingPart | `#foldMinLimit/#foldMaxLimit` | активность инструмента/части |
| Wheels | `#versatileFoldMinLimit/Max` | поворотные колёса |
| Leveler / Sprayer / Cutter / Pickup / Shovel / Sowing | `#foldMinLimit/Max` | соответствующая функция |
| GroundReference / GroundAdjustedNodes | `.folding#minLimit/#maxLimit` | контакт с землёй |
| Attacher lowering / heightNode / steeringAxle | `#foldMinLimit/Max` | опускание/рулевая ось |
| TurnOnVehicle | `#foldMinLimit/Max` | включение орудия |

Флаг **`foldLimitedOuterRange`** (у WorkArea/SpeedRotatingParts/Leveler) инвертирует тест — функция
активна **снаружи** окна (для частей, работающих у краёв диапазона).

Дополнительно окна на уровне `<foldingParts>` гейтят целые действия: `loweringMin/MaxLimit`,
`turnOnFoldMin/MaxLimit`, `attaching/detachingMin/MaxLimit`, `toggleCoverMin/MaxLimit`,
`dynamicMountMin/MaxLimit`, `crabSteeringMin/MaxLimit`, `loadMovingToolStatesMin/MaxLimit`.

---

## 5. Атрибуты `<foldingParts>`

| Атрибут | Тип | По умолчанию | Описание |
|---|---|---|---|
| `startAnimTime` | FLOAT[^float] | — | Начальный `foldAnimTime` при спавне (поза в магазине/на старте). |
| `startMoveDirection` | INT[^int] | `0` | Если `>0` и нет `startAnimTime` — спавн сложенным (animTime `1`). |
| `turnOnFoldDirection` | INT | выводится | Знак направления, означающий «разложить/включить». |
| `foldMiddleAnimTime` | FLOAT | — (нет) | Средняя точка (транспорт/поворотная полоса). |
| `foldMiddleDirection` | INT | `1` | Знак движения от середины к «поднятой» стороне. |
| `foldInputButton` | STRING[^string] | `IMPLEMENT_EXTRA2` | Действие ввода для сложить/разложить. |
| `foldMiddleInputButton` | STRING | `LOWER_IMPLEMENT` | Действие ввода для поднять/опустить (средняя). |
| `allowUnfoldingByAI` | BOOL[^bool] | `true` | AI может складывать/раскладывать. |
| `requiresPower` | BOOL | `true` | Нужен заведённый трактор для смены состояния. |
| `useParentFoldingState` | BOOL | `false` | Состояние копируется у родителя (сам не складывается). |
| `lowerWhileDetach` | BOOL | `false` | Опускается при отцепке, поднимается при повторной прицепке. |
| `keepFoldingWhileDetached` | BOOL | платформа | Продолжать анимацию после отцепки. |
| `releaseBrakesWhileFolding` | BOOL | `false` | Отпускать тормоза во время складывания. |
| `ignoreFoldMiddleWhileFolded` | BOOL | `false` | В сложенном клавиша «опустить» управляет только навеской. |
| `allowDetachingWhileFolding` | BOOL | `false` | Разрешить отцепку в процессе анимации. |
| `objectText` | L10N[^l10n] | typeDesc | Подстановка «OBJECT» в тексты действий. |
| `posDirectionText` / `negDirectionText` | L10N | fold/unfold | Тексты действия сложить/разложить. |
| `middlePosDirectionText` / `middleNegDirectionText` | L10N | lift/lower | Тексты поднять/опустить. |
| `unfoldWarning` / `detachWarning` | L10N | — | Предупреждения при заблокированном действии. |
| окна-лимиты `loweringMin/Max`, `turnOnFoldMin/Max`, `attaching/detachingMin/Max`, `toggleCoverMin/Max`, `dynamicMountMin/Max`, `crabSteeringMin/Max`, `loadMovingToolStatesMin/Max` | FLOAT | `0`/`1` | Окна допустимости соответствующих действий по `foldAnimTime`. |

Дополнительно: `foldWhileDetach` (BOOL, `false`), `allowControlWhileFolding` (BOOL, `true`).

---

## 6. Атрибуты `<foldingPart>`

| Атрибут | Тип | По умолчанию | Описание |
|---|---|---|---|
| `animationName` | STRING | — | Имя `<animation>` AnimatedVehicle, которую крутит эта часть. |
| `rootNode` | NODE[^node] | — | Узел с i3d-набором анимации (альтернатива AnimatedVehicle). |
| `animationClip` | STRING | — | Имя клипа на `rootNode`. |
| `componentJointIndex` | INT | — | 1-based индекс компонентного сустава, физически переставляемого при складывании. |
| `anchorActor` | INT | `0` | Какой актор (0/1) сустава — неподвижный якорь. |
| `speedScale` | FLOAT | `1` | Множитель скорости анимации (`>0`). |
| `delayDistance` | FLOAT | — | Дистанция проезда до старта этой части (каскадное опускание). |
| `previousDuration` | FLOAT | `1` с | Длительность опускания предыдущей части в цепочке. |
| `loweringDuration` | FLOAT | `1` с | Длительность опускания этой части. |
| `maxDelayDuration` | FLOAT | `7.5` с | Макс. задержка по дистанции до принудительного движения. |
| `aiSkipDelay` | BOOL | `false` | AI двигает все части синхронно, без задержек. |

Часть ссылается **либо** на `animationName`, **либо** на `rootNode`+`animationClip` (иначе отклоняется).
Несколько `foldingPart` делят один `foldAnimTime`. Атрибут `skipDelayOnReverse` (BOOL, `true`).

---

## 7. Конфигурации, родитель, AI, привязки

- Тип конфигурации — `folding`; movingTool/sprayer можно привязать к конкретной конфигурации через
  `#foldingConfigurationIndex(es)`.
- **`useParentFoldingState`** — прицеп повторяет складывание родителя (регистрируется в
  `subFoldingStateVehicles`; сам не складывается).
- **AI / actionController** — fold регистрируется в root-технике (приоритет 4), lower (3); AI
  раскладывает орудие перед работой и складывает после.
- **AttacherJoints** — авто-подъём/опускание на прицепке/отцепке (`lowerWhileDetach`, `onSetLoweredAll`
  маппит «поднять всё» трактора на среднюю позу). **Cover** — окно `toggleCoverMin/MaxLimit`.

---

## 8. Ввод, мультиплеер, сейв, функции

- **Ввод:** `foldInputButton` (по умолчанию `IMPLEMENT_EXTRA2`) → сложить/разложить;
  `foldMiddleInputButton` (`LOWER_IMPLEMENT`) → средняя; скрытое `FOLD_ALL_IMPLEMENTS`.
- **MP:** сервер-авторитетно; в стриме — направление (2 бита) + `moveToMiddle` + `foldAnimTime` (float);
  прогресс каждый клиент считает локально из анимации. Событие смены — `FoldableSetFoldDirectionEvent`.
- **Сейв:** `vehicle.foldable#foldAnimTime`.
- **Функции:** `setFoldState(direction, moveToMiddle)`, `setFoldDirection`, `setAnimTime`,
  `getFoldAnimTime`, `getIsUnfolded`, `getIsFoldAllowed`, `getToggledFoldDirection`; хук
  `onFoldTimeChanged(foldAnimTime)` (на него подписываются другие системы).

---

## 9. Пример: складные крылья орудия

```xml
<foldable>
    <foldingConfigurations>
        <foldingConfiguration workingWidth="10">
            <foldingParts startAnimTime="1">                 <!-- спавн сложенным, если animTime 1 = транспорт -->
                <foldingPart animationName="foldLeftWing"  speedScale="1"/>
                <foldingPart animationName="foldRightWing" speedScale="1"/>
            </foldingParts>
        </foldingConfiguration>
    </foldingConfigurations>
</foldable>
```

Отключение работы в сложенном — окно на каждой рабочей зоне (при «разложено = animTime 1»):

```xml
<workAreas>
    <workArea ...>
        <folding minLimit="0.95" maxLimit="1"/>
    </workArea>
</workAreas>
```

Транспортные колёса/опоры гейтятся `versatileFoldMinLimit/Max` или `.folding#minLimit/#maxLimit`;
средняя (поворотная) поза — опциональный `foldMiddleAnimTime`.

---

## 10. Типичные ошибки

- **`foldingPart` без анимации** — нужна `animationName` (AnimatedVehicle) или `rootNode`+`animationClip`.
- **Рабочие органы активны в транспорте** — не заданы `folding#minLimit/#maxLimit` на `workArea` (и fillUnit).
- **Путаница полярности** — `foldAnimTime` `0/1` сам по себе не «разложено/сложено»; смысл задаёт
  `turnOnFoldDirection`/`startAnimTime`; держать полярность согласованной во всех лимитах.
- **Ожидание среднего состояния без `foldMiddleAnimTime`** — без него нет поворотной/транспортной позы.
- **`componentJointIndex` без компонентных суставов** — физический перелом рамы требует их наличия.

---

## 11. Примечания

- `foldAnimTime` — единый прогресс складывания; функции других спек включаются окнами
  `foldMinLimit`/`foldMaxLimit` относительно него.
- Тип конфигурации — `folding`; несколько `foldingPart` делят один таймлайн.
- Смысл «разложено» задаёт `turnOnFoldDirection` (не сам знак animTime).
- Поведение — по движку FS25 (`vehicles/specializations/Foldable.lua`); дополнительные атрибуты:
  `foldWhileDetach`, `allowControlWhileFolding` (на `<foldingParts>`), `skipDelayOnReverse`
  (на `<foldingPart>`).

---

## Глоссарий

[^float]: FLOAT — число с плавающей точкой. <https://en.wikipedia.org/wiki/Floating-point_arithmetic>
[^int]: INT — целочисленный тип. <https://en.wikipedia.org/wiki/Integer_(computer_science)>
[^bool]: BOOL — логический тип (`true`/`false`). <https://en.wikipedia.org/wiki/Boolean_data_type>
[^string]: STRING — строковый тип значения. <https://en.wikipedia.org/wiki/String_(computer_science)>
[^l10n]: L10N — ключ локализации (`$l10n_<ключ>`), заменяется переведённой строкой. <https://en.wikipedia.org/wiki/Internationalization_and_localization>
[^node]: NODE — ссылка на узел i3d (по индексу/имени в сцене). <https://en.wikipedia.org/wiki/Scene_graph>
