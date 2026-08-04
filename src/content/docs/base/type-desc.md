---
title: "Элемент <typeDesc> в блоке <base>"
description: "Название типа техники в магазине (ключ локализации)."
sidebar:
  label: "typeDesc"
---
Локализованное название типа техники, отображаемое в магазине (например «Трактор», «Плуг»).

Источник схемы: `Vehicle.lua` (`FS25`), `vehicle.base.typeDesc`.

---

## 1. Что это

`<typeDesc>` — **ключ локализации**[^l10n] (не сырой текст), задающий короткое описание типа техники в магазине. Пример значения — `$l10n_typeDesc_tractor`.

Схема:

```
vehicle.base.typeDesc — L10N_STRING, по умолчанию (в схеме) nil
```

Чтение в рантайме (`Vehicle:loadFinished`): при отсутствии элемента используется запасное значение `"TypeDescription"`. Ключи `$l10n_*` разрешаются через префикс мода (`customEnvironment`): сначала ищется в локализации мода (`modDesc.xml <l10n>`), затем во встроенной локализации игры.

---

## 2. Значение: откуда берутся ключи

- **Встроенные** `$l10n_typeDesc_*` — из локализации самой игры. В моде их писать не нужно, они уже определены.
- **Свои** ключи — объявляются в `modDesc.xml` в секции `<l10n>` и используются так же через `$l10n_<ключ>`.

### Стандартные ключи `typeDesc_*`

| Ключ | Значение (en) |
|---|---|
| `typeDesc_tractor` | tractor |
| `typeDesc_mower` | mower |
| `typeDesc_tedder` | tedder |
| `typeDesc_windrower` | windrower |
| `typeDesc_baler` | baler |
| `typeDesc_baleLoader` | bale loader |
| `typeDesc_baleWrapper` | round bale wrapper |
| `typeDesc_cultivator` | cultivator |
| `typeDesc_plow` (`typeDesc_plough`) | plow |
| `typeDesc_seeder` | sower |
| `typeDesc_planter` | planter |
| `typeDesc_sprayer` | sprayer |
| `typeDesc_fertilizerSpreader` | fertilizer spreader |
| `typeDesc_manureSpreader` | manure spreader |
| `typeDesc_manureBarrel` | slurry tanker |
| `typeDesc_cutter` | header |
| `typeDesc_cutterTrailer` | header trailer |
| `typeDesc_cornCutter` | corn header |
| `typeDesc_harvester` | harvester |
| `typeDesc_forageWagon` | forage wagon |
| `typeDesc_mixerWagon` | mixer wagon |
| `typeDesc_augerWagon` | auger wagon |
| `typeDesc_strawBlower` | straw blower |
| `typeDesc_trailer` | trailer |
| `typeDesc_tipper` | tipper |
| `typeDesc_waterTrailer` | water trailer |
| `typeDesc_timberTrailer` | timber trailer |
| `typeDesc_lowLoader` | low loader |
| `typeDesc_weight` | weight |
| `typeDesc_pickup` | pickup |
| `typeDesc_pallet` | pallet |
| `typeDesc_haulmTopper` | topper |
| `typeDesc_defoliator` | defoliator |
| `typeDesc_forwarder` | forwarder |
| `typeDesc_woodHarvester` | wood harvester |
| `typeDesc_treePlanter` | tree planter |
| `typeDesc_stumpCutter` | stump cutter |
| `typeDesc_woodCrusher` | wood crusher |
| `typeDesc_highPressureWasher` | high pressure washer |

> Список — документированный набор встроенных ключей; ключи регистронезависимы. Он **не гарантированно полон для FS25** (мастер-список локализации лежит в зашифрованных данных игры). Если нужного нет — используй свой ключ через `modDesc.xml <l10n>`. Само поле `typeDesc` не ограничено этим набором: подойдёт любой `$l10n_`-ключ.

---

## 3. Можно ли переопределить

Да — **на уровне конфигурации** техники. Если для активной конфигурации задан атрибут `#typeDesc`, он заменяет базовое значение:

```
<config ... typeDesc="$l10n_typeDesc_myVariant"/>
```

(Схема: `configuration.configurationKey(?)#typeDesc`.) Порядок: сначала читается `vehicle.base.typeDesc`, затем, если выбранная конфигурация задаёт свой `#typeDesc`, применяется он.

Наследования значения от определения типа техники (`vehicleTypes.xml`) в базовом загрузчике нет — только элемент `<typeDesc>` и переопределение конфигурацией.

---

## 4. Примеры XML

Встроенный ключ:

```xml
<base>
    <typeDesc>$l10n_typeDesc_tractor</typeDesc>
</base>
```

Свой ключ (объявлен в `modDesc.xml <l10n>`):

```xml
<base>
    <typeDesc>$l10n_typeDesc_myHarvesterHead</typeDesc>
</base>
```

---

## 5. Примечания

- Тип значения — ключ локализации, а не текст: писать напрямую «Трактор» не следует.
- Устаревшая форма `vehicle.typeDesc` автоматически переносится загрузчиком в `vehicle.base.typeDesc`.

---

## Глоссарий

[^l10n]: Локализация (l10n) — система переводимых строк по ключам. В FS ключ подставляется через `$l10n_<ключ>`. <https://ru.wikipedia.org/wiki/Локализация_программного_обеспечения>
