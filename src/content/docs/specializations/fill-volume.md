---
title: "Блок <fillVolume> — объёмная куча груза"
description: "Меш кучи внутри shape-узла: привязка к ёмкости, форма насыпи, деформеры и узлы высоты."
sidebar:
  label: "fillVolume"
---

```xml
<fillVolume>
    <fillVolumeConfigurations>
        <fillVolumeConfiguration>
            <volumes>
                <volume node="fillVolumeShape" fillUnitIndex="1" maxDelta="1.0" maxAllowedHeapAngle="35"/>
            </volumes>
        </fillVolumeConfiguration>
    </fillVolumeConfigurations>
</fillVolume>
```

`<fillVolume>` — **объёмная визуализация** груза: движок строит по shape-узлу настоящий меш кучи,
которая растёт снизу вверх, ложится по форме кузова и держит угол естественного откоса. Это дорогой
и реалистичный вариант; дешёвый — [`<fillPlane>`](fill-plane.md).

Собственного уровня груза у объёма нет: он привязывается к ёмкости
[`<fillUnit>`](fill-unit.md) по индексу и отображает её содержимое.

> Расположение: блок `vehicle.fillVolume`. Раздел справочника — Specializations.
>
> Источник схемы: `FillVolume.initSpecialization` и `FillVolume:onLoad` (FS25), официальная
> `vehicle.xsd`.

---

## 1. Обязательная обёртка конфигураций

Как и у ёмкостей, движок читает объёмы только по пути с конфигурациями:

```text
vehicle.fillVolume.fillVolumeConfigurations.fillVolumeConfiguration(?).volumes.volume(?)
```

Короткого пути `vehicle.fillVolume.volumes` нет ни в загрузчике, ни в схеме. Обёртка обязательна
даже для единственного варианта.

---

## 2. Что требуется от узла

Узел `#node` должен быть **шейпом** (`ClassIds.SHAPE`) — обычной геометрией, описывающей внутренний
объём кузова. Если указать transform group, в лог уйдёт предупреждение `fillVolume '<имя>' … is not
a shape!`, и объём не загрузится.

По этому шейпу движок создаёт отдельный меш кучи (`createFillPlaneShape`), линкует его к узлу,
скрывает исходный шейп и назначает базовый материал `fillPlane` с массивами текстур типов груза. Если
построить меш не удалось, в логе появится `could not create actual fillVolume … Simplifying the mesh
could help` — почти всегда это слишком сложная геометрия исходного шейпа.

---

## 3. Атрибуты `<volume>`

Привязка к ёмкости:

| Путь | Тип | По умолчанию | Описание |
|---|---|---|---|
| `#node` | NODE[^node] | — | Шейп внутреннего объёма. Обязателен. |
| `#fillUnitIndex` | INT[^int] | — | Индекс ёмкости [`<fillUnit>`](fill-unit.md). Обязателен; несуществующий индекс отключает объём. |
| `#fillUnitFactor` | FLOAT[^float] | `1` | Доля вместимости ёмкости, приходящаяся на этот объём. |
| `#useFullCapacity` | BOOL[^bool] | `true` | `true` — объём представляет всю вместимость; `false` — вместимость делится между объёмами пропорционально `#fillUnitFactor`. |

Форма насыпи:

| Путь | Тип | По умолчанию | Описание |
|---|---|---|---|
| `#maxDelta` | FLOAT (м) | `1.0` | Насколько куча может подниматься над входной поверхностью. |
| `#maxAllowedHeapAngle` | ANGLE (°) | `35` | Максимальный угол склона насыпи. |
| `#maxSurfaceDistanceError` | FLOAT (м) | `0.05` | Допустимое отклонение построенного меша от исходной поверхности. |
| `#maxSubDivEdgeLength` | FLOAT (м) | `0.9` | Максимальная длина ребра при подразбиении. |
| `#syncMaxSubDivEdgeLength` | FLOAT (м) | `1.35` | То же для синхронизации в мультиплеере. |
| `#allSidePlanes` | BOOL | `true` | Строить боковые плоскости. |
| `#retessellateTop` | BOOL | `false` | Перестраивать верхнюю плоскость для лучшей триангуляции. |

Тип груза:

| Путь | Тип | По умолчанию | Описание |
|---|---|---|---|
| `#defaultFillType` | STRING[^string] | — | Тип груза по умолчанию (текстура до первой загрузки). |
| `#forcedVolumeFillType` | STRING | — | Принудительный тип груза для этого объёма. |

Устаревшее: `volume#index` → `#node`.

---

## 4. Деформеры

```xml
<volume node="fillVolumeShape" fillUnitIndex="1">
    <deformNode node="tippingPlate"/>
</volume>
```

`<deformNode#node>` задаёт узел, который «мнёт» кучу — например подвижная стенка выталкивателя. При
загрузке движок ищет для деформера полилинию в построенном меше; если не нашёл, пишет
`Could not find 'polyline' for '<имя>'` и деформер отбрасывается.

Подвижные части связываются с деформерами через `<cylindered>`: у `movingTool` и `movingPart` есть
под-элемент `.fillVolume` с атрибутами `#fillVolumeIndex` (по умолчанию `1`) и
`#deformerNodeIndices` — списком индексов деформеров, которые надо обновлять при движении.

---

## 5. Узлы высоты, загрузки и выгрузки

Три вспомогательных списка лежат **вне** конфигураций, прямо в `vehicle.fillVolume`:

**`heightNodes.heightNode(?)`** — узлы, следящие за высотой кучи (крышки, индикаторы, шторки).
`#fillVolumeIndex` указывает объём, `<refNode#node>` — опорные узлы, `<node(?)>` — сами двигающиеся
узлы с атрибутами `#baseScale` (`1 1 1`), `#scaleAxis` (`0 0 0`), `#scaleMax` (`0 0 0`), `#transAxis`
(`0 0 0`), `#transMax` (`0 0 0`), `#minHeight` (`0`), `#heightOffset` (`0`), `#orientateToWorldY`
(`false`).

**`loadInfos.loadInfo(?)` и `unloadInfos.unloadInfo(?)`** — точки, куда груз попадает и откуда
высыпается. У каждого `<node(?)>`: `#node`, `#width` (`1`), `#length` (`1`), `#priority` (`1`),
`#minHeight` / `#maxHeight`, `#minFillLevelPercentage` / `#maxFillLevelPercentage`,
`#fillVolumeHeightIndex`, `#translationStart` / `#translationEnd`, `#heightForTranslation`.

---

## 6. Несколько объёмов на одну ёмкость

Кузов из нескольких отсеков описывается несколькими `<volume>` с одинаковым `#fillUnitIndex`:

```xml
<volumes>
    <volume node="volumeFront" fillUnitIndex="1" useFullCapacity="false" fillUnitFactor="0.4"/>
    <volume node="volumeRear"  fillUnitIndex="1" useFullCapacity="false" fillUnitFactor="0.6"/>
</volumes>
```

При `useFullCapacity="false"` движок нормирует факторы по их сумме, то есть вместимость ёмкости
делится между объёмами в заданной пропорции. При `true` (по умолчанию) каждый объём считает
вместимость полной и наполняется одинаково — это нужно, когда отсеки сообщающиеся.

---

## 7. Устройство в GIANTS Editor

- Внутренний объём кузова — отдельный **шейп**, а не transform group; его видимость движок
  выключает сам, поэтому текстура и материал исходного шейпа роли не играют.
- Геометрию держать простой: сложный меш увеличивает время построения и может привести к отказу
  (`Simplifying the mesh could help`).
- Шейп описывает пространство, которое груз **может** занять; фактическая поверхность строится
  движком с учётом `#maxDelta` и `#maxAllowedHeapAngle`.
- Деформеры — обычные узлы, движущиеся вместе с подвижными частями; их положение должно попадать
  внутрь объёма, иначе полилиния не найдётся.

---

## 8. Типичные ошибки

- **`#node` указывает на transform group** — предупреждение «is not a shape», объём не создаётся.
- **Нет `#fillUnitIndex` или он неверный** — объём отбрасывается с предупреждением; груз не виден,
  хотя ёмкость наполняется.
- **Слишком сложный меш** — движок не смог построить кучу; упростить геометрию.
- **Забыт `useFullCapacity="false"` при нескольких объёмах** — все отсеки наполняются на полную
  вместимость каждый, куча выглядит завышенной.
- **Ожидание, что объём хранит груз** — уровень живёт в [`<fillUnit>`](fill-unit.md); объём только
  рисует.
- **Деформер вне объёма** — `Could not find 'polyline'`, деформация не работает.

---

## 9. Примечания

- `fillVolume` зарегистрирован как тип конфигурации магазина — варианты объёма можно выбирать.
- Материал кучи — базовый `fillPlane` из реестра материалов; текстуры типов груза берутся из
  террейна.
- Для простого груза без деформации и наклона объём часто избыточен: дешевле
  [`<fillPlane>`](fill-plane.md).
- Поведение — по движку FS25 (`vehicles/specializations/FillVolume.lua`) и официальной схеме
  `vehicle.xsd`.

---

## Глоссарий

[^bool]: BOOL — логический тип (`true`/`false`). <https://en.wikipedia.org/wiki/Boolean_data_type>
[^int]: INT — целочисленный тип. <https://en.wikipedia.org/wiki/Integer_(computer_science)>
[^float]: FLOAT — число с плавающей точкой. <https://en.wikipedia.org/wiki/Floating-point_arithmetic>
[^string]: STRING — строковый тип значения. <https://en.wikipedia.org/wiki/String_(computer_science)>
[^node]: NODE — ссылка на узел i3d (имя i3d-маппинга или путь `компонент>ребёнок|ребёнок`). <https://en.wikipedia.org/wiki/Scene_graph>
