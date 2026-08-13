---
title: "Блок <fillUnit> — ёмкость и уровень груза"
description: "Логическая ёмкость техники: вместимость, допустимые типы груза, узлы заправки, масса и отображение в HUD."
sidebar:
  label: "fillUnit"
---

```xml
<fillUnit>
    <fillUnitConfigurations>
        <fillUnitConfiguration>
            <fillUnits>
                <fillUnit fillTypeCategories="bulk" capacity="12000" unitTextOverride="$l10n_unit_literShort">
                    <exactFillRootNode node="fillRootNode"/>
                </fillUnit>
            </fillUnits>
        </fillUnitConfiguration>
    </fillUnitConfigurations>
</fillUnit>
```

`<fillUnit>` — **логическая** ёмкость: сколько литров помещается, какие типы груза принимаются, как
уровень влияет на массу, что показывать в HUD. Это единственный из трёх «наполняющих» блоков, где
хранится сам уровень груза; [`<fillVolume>`](fill-volume.md) и [`<fillPlane>`](fill-plane.md) только
показывают его.

Техника может иметь несколько ёмкостей: у каждой свой индекс (порядковый номер `<fillUnit>` в
списке, начиная с 1), и именно по этому индексу на неё ссылаются другие блоки.

> Расположение: блок `vehicle.fillUnit`. Раздел справочника — Specializations.
>
> Источник схемы: `FillUnit.initSpecialization` и `FillUnit:onLoad` (FS25), официальная `vehicle.xsd`.

---

## 1. Обязательная обёртка конфигураций

Движок читает ёмкости **только** по пути с конфигурациями:

```text
vehicle.fillUnit.fillUnitConfigurations.fillUnitConfiguration(?).fillUnits.fillUnit(?)
```

Фолбэка на короткий путь `vehicle.fillUnit.fillUnits` нет: спека формирует ключ подстановкой номера
конфигурации и другого пути не пробует. В схеме `vehicle.xsd` элемента `<fillUnits>` вне
`<fillUnitConfiguration>` тоже не существует.

Практический вывод: обёртка `<fillUnitConfigurations><fillUnitConfiguration>` нужна **всегда**, даже
если вариант ровно один. Ёмкость, записанная сразу внутрь `<fillUnit>`, молча не загрузится —
техника окажется без ёмкостей, а зависящие от них блоки начнут ругаться на неверный `fillUnitIndex`.

Про общие атрибуты конфигураций (`name`, `price`, `isDefault`, `saveId`) — страница
[Конфигурации техники в магазине](../concepts/vehicle-configurations.md).

---

## 2. Атрибуты `<fillUnit>`

Основные:

| Путь | Тип | По умолчанию | Описание |
|---|---|---|---|
| `#capacity` | FLOAT[^float] (л) | без ограничения | Вместимость в литрах. |
| `#fillTypeCategories` | STRING[^string] | — | Категории принимаемого груза (`bulk`, `liquid` и т.п.), через пробел. |
| `#fillTypes` | STRING | — | Конкретные типы груза, через пробел. Задаётся вместо или вместе с категориями. |
| `#startFillLevel` | FLOAT | — | Начальный уровень при покупке/спавне. |
| `#startFillType` | STRING | — | Начальный тип груза. |
| `#canBeUnloaded` | BOOL[^bool] | `true` | Можно ли выгружать содержимое. |
| `#ignoreFillLimit` | BOOL | `false` | Игнорировать ограничение по максимальной массе (когда настройка включена). |

Масса и физика:

| Путь | Тип | По умолчанию | Описание |
|---|---|---|---|
| `#updateMass` | BOOL | `true` | Обновлять массу техники при изменении уровня. |
| `#updateFillLevelMass` | BOOL | `true` | Учитывать массу самого груза. |
| `.fillMassNode#node` | NODE[^node] | первый компонент | Узел, к которому прикладывается масса груза. |
| `.fillRootNode#node` | NODE | первый компонент | Корневой узел ёмкости. |

Отображение:

| Путь | Тип | По умолчанию | Описание |
|---|---|---|---|
| `#showOnHud` | BOOL | `true` | Показывать в HUD. |
| `#showOnInfoHud` | BOOL | `true` | Показывать в информационном HUD. |
| `#uiDisplayType` | STRING | `BAR` | Стиль индикатора: `BAR` или `STEP`. |
| `#uiPrecision` | INT[^int] | `0` | Знаков после запятой. |
| `#uiCustomFillTypeName` | L10N[^l10n] | — | Своё название груза в интерфейсе. |
| `#uiExtraInfoText` | L10N | — | Дополнительный текст после названия груза. |
| `#unitTextOverride` | STRING | — | Своя единица измерения без пересчёта. |
| `#shopDisplayUnit` | STRING | `LITER` | Единица для показа вместимости в магазине (с пересчётом). |
| `#showInShop` / `#showCapacityInShop` | BOOL | `true` | Показывать ёмкость и её вместимость в магазине. |

Мультиплеер:

| Путь | Тип | По умолчанию | Описание |
|---|---|---|---|
| `#synchronizeFillLevel` | BOOL | `true` | Синхронизировать уровень. |
| `#synchronizeFullFillLevel` | BOOL | `false` | Синхронизировать 32-битным float вместо процента. |
| `#synchronizationNumBits` | INT | — | Число бит синхронизации. |

Прочее: `#allowFoldingThreshold`, `#allowFoldingFillType`, `#foldMinLimit` / `#foldMaxLimit` (гейтинг
заправки по состоянию складывания), `#allowAILoading` и `#aiLoadingNode`, `#fillAnimation` с
`#fillAnimationLoadTime` / `#fillAnimationEmptyTime`, `#blocksAutomatedTrainTravel`,
`#disablingAttacherJointNodes`.

---

## 3. Атрибуты контейнера `<fillUnits>`

Действуют на все ёмкости конфигурации:

| Путь | Тип | По умолчанию | Описание |
|---|---|---|---|
| `#removeVehicleIfEmpty` | BOOL | `false` | Удалять объект, когда ёмкость опустела (поддоны, мешки). |
| `#removeVehicleThreshold` | FLOAT (л) | `0` | Порог «пусто» для удаления. |
| `#removeVehicleDelay` | TIME | `0` | Задержка удаления (например пока доигрывает звук). |
| `#removeVehicleReward` | FLOAT | `0` | Награда за удаление. |
| `#allowFoldingWhileFilled` | BOOL | `true` | Разрешать складывание с грузом. |
| `#allowFoldingThreshold` | FLOAT | `0.0001` | Порог уровня для запрета складывания. |
| `#resetFoldingWhileFilled` | BOOL | `false` | Сбрасывать складывание при наличии груза. |
| `#fillTypeChangeThreshold` | FLOAT | `0.05` | До какой доли заполнения тип груза можно перезаписать другим. |

Рядом: `.fillTrigger#litersPerSecond` (`200`) и `#consumePtoPower` (`false`) — скорость заправки из
триггера и расход мощности ВОМ; `.unloading(?)#node`, `#width` (`15`), `#offset` — точки выгрузки.

---

## 4. Под-элементы `<fillUnit>`

| Элемент | Назначение |
|---|---|
| `.exactFillRootNode#node` | Узел точной заправки (куда «прилетает» струя/поток). `#extraEffectDistance` расширяет зону эффекта. |
| `.exactFillRootNodes.exactFillRootNode(?)` | Несколько таких узлов с гейтингом по складыванию (`#foldMinLimit` / `#foldMaxLimit`). |
| `.autoAimTargetNode` | Цель автоприцеливания при загрузке: `#node`, `#startZ`, `#endZ`, `#startPercentage`, `#invert`. |
| `.measurementNodes.measurementNode(?)#node` | Узлы замера уровня. |
| `.fillLevelAnimation(?)` | Анимация, время которой = процент заполнения: `#name`, `#resetOnEmpty`, `#updateWhileFilled`, `#useMaxStateIfEmpty`. |
| `.alarmTriggers.alarmTrigger(?)` | Сигнал по диапазону уровня: `#minFillLevel`, `#maxFillLevel`, `#direction` (`0` любое, `1` заправка, `-1` разгрузка), `#needsTurnOn`, `#turnOffInTrigger`; внутри — `<alarmSound>` и `<beaconLight>`. |
| `.fillTypeMaterials.material(?)` | Смена материала/текстуры под тип груза: `#fillType`, `#node`, `#refNode`, `#materialSlotName`, `#diffuse`. |
| `.liquidSimulation(?)` | Симуляция плескания жидкости: `#rootNode`, `#width`, `#height`, `#length`, `#numRows`, `#numColumns`, `#damping` (`0.8`), `#waveSpeed` (`3`), `#acceleration` (`1`), `#tiltRestoringStrength` (`10`). |
| `.fillPlane` | Простая анимированная плоскость груза — [отдельная страница](fill-plane.md). |
| `.fillEffect`, `.animationNodes`, `.dashboard(?)` | Эффекты, анимационные узлы и приборы (`fillLevel`, `fillLevelPct`, `fillLevelWarning`). |

Звук заправки — `vehicle.fillUnit.sounds.fill`.

---

## 5. Чем отличается от соседних блоков

| Блок | Что это | Есть ли уровень груза | Нужен ли меш |
|---|---|---|---|
| `<fillUnit>` | логическая ёмкость: литры, типы, масса, HUD | **да, хранится здесь** | нет |
| [`<fillVolume>`](fill-volume.md) | объёмный меш кучи внутри shape-узла | нет, берёт из ёмкости | да, shape |
| [`<fillPlane>`](fill-plane.md) | плоскость, движущаяся по уровню | нет, берёт из ёмкости | простой узел |

Ёмкость самодостаточна: техника с одним `<fillUnit>` полностью работоспособна, груз просто не будет
виден внутри кузова. Визуализацию добавляют `<fillVolume>` (реалистичная куча) **или** `<fillPlane>`
(дешёвая плоскость) — они ссылаются на ёмкость по её индексу.

---

## 6. Индекс ёмкости

Индекс — это порядковый номер `<fillUnit>` внутри `<fillUnits>`, считая с **1**. По нему ссылаются:

- `<fillVolume>`: `volume#fillUnitIndex`;
- рабочие блоки техники (разгрузка, эффекты, приборы) — атрибутом `fillUnitIndex`;
- сохранение: `vehicles.vehicle(?).fillUnit.unit(?)#index/#fillType/#fillLevel`.

Перестановка ёмкостей в XML меняет их индексы — все ссылки надо править вместе.

---

## 7. Примеры

Сыпучий груз с точкой заправки и индикатором:

```xml
<fillUnit>
    <fillUnitConfigurations>
        <fillUnitConfiguration>
            <fillUnits>
                <fillUnit fillTypeCategories="bulk" capacity="12000" showOnHud="true">
                    <exactFillRootNode node="fillRootNode"/>
                    <fillMassNode node="massNode"/>
                </fillUnit>
            </fillUnits>
        </fillUnitConfiguration>
    </fillUnitConfigurations>
</fillUnit>
```

Две ёмкости: семена и удобрение (индексы 1 и 2):

```xml
<fillUnits>
    <fillUnit fillTypeCategories="seeds" capacity="3000"/>
    <fillUnit fillTypeCategories="fertilizer" capacity="1500"/>
</fillUnits>
```

Поддон, исчезающий после опустошения:

```xml
<fillUnits removeVehicleIfEmpty="true" removeVehicleDelay="2000">
    <fillUnit fillTypes="wheat" capacity="1000" canBeUnloaded="true"/>
</fillUnits>
```

---

## 8. Типичные ошибки

- **Ёмкость записана без `<fillUnitConfigurations>`** — путь не совпадает с тем, что читает движок;
  ёмкостей не будет вовсе (раздел 1).
- **Индекс перепутан** — `fillUnitIndex` считается с 1; ссылка на несуществующий индекс даёт
  предупреждение и отключает зависимый блок.
- **Нет ни `#fillTypes`, ни `#fillTypeCategories`** — ёмкость не примет ни один груз.
- **Ожидание, что груз станет видно** — `<fillUnit>` ничего не рисует; нужна визуализация
  ([`<fillVolume>`](fill-volume.md) или [`<fillPlane>`](fill-plane.md)).
- **`#capacity` не указан** — вместимость считается неограниченной, а в магазине показывать нечего.

---

## 9. Примечания

- Тип груза можно перезаписать другим, пока заполнение ниже `#fillTypeChangeThreshold` (по
  умолчанию 5 %).
- `fillUnit` зарегистрирован как тип конфигурации магазина: варианты ёмкости выбираются покупателем.
- Вместимость и список грузов попадают в карточку магазина (`storeData.specs.capacity`,
  `…specs.fillTypes`).
- Поведение — по движку FS25 (`vehicles/specializations/FillUnit.lua`) и официальной схеме
  `vehicle.xsd`.

---

## Глоссарий

[^bool]: BOOL — логический тип (`true`/`false`). <https://en.wikipedia.org/wiki/Boolean_data_type>
[^int]: INT — целочисленный тип. <https://en.wikipedia.org/wiki/Integer_(computer_science)>
[^float]: FLOAT — число с плавающей точкой. <https://en.wikipedia.org/wiki/Floating-point_arithmetic>
[^string]: STRING — строковый тип значения. <https://en.wikipedia.org/wiki/String_(computer_science)>
[^node]: NODE — ссылка на узел i3d (имя i3d-маппинга или путь `компонент>ребёнок|ребёнок`). <https://en.wikipedia.org/wiki/Scene_graph>
[^l10n]: L10N — ключ локализации (`$l10n_<ключ>`), подставляется переводом. <https://en.wikipedia.org/wiki/Internationalization_and_localization>
