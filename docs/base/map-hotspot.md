# Farming Simulator 2025
## Элемент `<mapHotspot>` в блоке `<base>`

Значок техники на карте и мини-карте.

Источник схемы: `Vehicle.lua` (`FS25`), `vehicle.base.mapHotspot`.

---

## 1. Что это

`<mapHotspot>` задаёт **иконку-хотспот** техники на карте/мини-карте и её категорию (какой значок показывать). Создаётся только для техники в мире (не в предпросмотре магазина).

Схема:

```
vehicle.base.mapHotspot#type      — STRING (enum), по умолчанию (рантайм) "OTHER"
vehicle.base.mapHotspot#available — BOOL, по умолчанию true
```

Чтение (`Vehicle:loadFinished`): если `#available=true`, тип разрешается через `VehicleHotspot.getTypeByName(type)`; неизвестное имя → `OTHER`.

---

## 2. Атрибуты

| Атрибут | Тип | По умолчанию | Описание |
|---|---|---|---|
| `type` | STRING (enum) | `OTHER` | Категория/иконка хотспота на карте. |
| `available` | BOOL | `true` | Создавать ли хотспот вообще. `false` — техники не будет на карте. |

---

## 3. Значение `type`

Допустимые значения — члены перечисления `VehicleHotspot.TYPE`. Значение пишется в верхнем регистре (например `type="TRACTOR"`). Неизвестное или отсутствующее сводится к `OTHER`.

### Стандартные значения `type`

| Значение | Категория / иконка на карте |
|---|---|
| `TRACTOR` | трактор (управляемая техника) |
| `TRUCK` | грузовик |
| `CAR` | легковой автомобиль |
| `HARVESTER` | комбайн |
| `WHEELLOADER` | колёсный погрузчик |
| `TRAILER` | прицеп |
| `TOOL` | навесной инструмент |
| `TOOL_TRAILED` | прицепной инструмент |
| `CUTTER` | жатка |
| `OTHER` | прочее (по умолчанию) |
| `HORSE` | лошадь |
| `TRAIN` | поезд |

> Набор подтверждён по коду GIANTS (`VehicleHotspot.lua`, FS22-зеркало); FS25 использует тот же механизм разрешения (`VehicleHotspot.getTypeByName`, дефолт `OTHER`). В FS25 набор может незначительно отличаться — сверяйся с автодополнением в GIANTS Editor.

---

## 4. Примеры XML

Трактор на карте:

```xml
<base>
    <mapHotspot type="TRACTOR"/>
</base>
```

Инструмент:

```xml
<base>
    <mapHotspot type="TOOL"/>
</base>
```

Скрыть с карты:

```xml
<base>
    <mapHotspot type="OTHER" available="false"/>
</base>
```

---

## 5. Примечания

- Хотспот создаётся в мире и убирается при удалении техники; в магазине/конфигураторе он не создаётся.
- Устаревшие `vehicle.forcedMapHotspotType` (FS17–FS19) и `#hasDirection` (удалён в FS25) заменены на `vehicle.base.mapHotspot#type`.
