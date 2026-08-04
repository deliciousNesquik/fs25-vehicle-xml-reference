---
title: "Элемент <fillTypes>"
description: "Типы груза/наполнения: ссылка на внешний файл <map> с <fillType>; глобальный реестр FillType.<ИМЯ>."
sidebar:
  label: "fillTypes"
---
```xml
<fillTypes filename="xml/maps_fillTypes.xml"/>
```

Подключает **типы груза/наполнения** (fill type — зерно, жидкости, продукты и т.п.), которые добавляет
мод. В modDesc это только **ссылка на внешний файл**: единственный атрибут `filename` указывает на
XML-файл с определениями `<fillType>`. Сами типы описаны в том файле (раздел 4).

> Расположение: дочерний элемент `<modDesc>`. Раздел справочника — modDesc.

---

## 1. Что это

Тип наполнения — это сущность груза (WHEAT, DIESEL, MILK, своя INSECTICIDE и т.п.): цена, масса,
иконка HUD, паллета, текстуры «плоскости заполнения». Игра держит базовый набор; мод через
`<fillTypes filename="...">` подключает **внешний файл**, который добавляет новые типы (или изменяет
свойства существующих). Техника ссылается на тип по имени/категории (раздел 7).

Реестр типов **общий и глобальный**: имя не неймспейсится по моду (как у `brands`/`jointTypes`) — иначе
техника мода не могла бы работать с базовым `WHEAT`, а базовая техника с типом мода.

---

## 2. Атрибут `<fillTypes>`

| Атрибут | Тип | Обязателен | Описание |
|---|---|---|---|
| `filename` | STRING[^string] | да (практически) | Путь к внешнему XML-файлу с типами наполнения. Относительно корня мода; `$data/...`/`$dataS/...` — от корня игры. |

`<fillTypes>` необязателен (`minOccurs="0"`), один. Инлайн-определений типов в modDesc нет — только
ссылка на файл.

---

## 3. Как загружается

- modDesc читает `modDesc.fillTypes#filename` и ставит файл в очередь
  (`g_fillTypeManager:addModWithFillTypes(...)`); путь резолвится относительно корня мода.
- Читается у **всех** модов (не только DLC).
- Разбор **отложенный**: сначала грузятся базовые типы (`data/maps/maps_fillTypes.xml`), затем типы
  карты, затем файлы модов. Поэтому мод видит и может переопределять базовые типы.

---

## 4. Внешний файл

Корень внешнего файла — `<map>` (схема `fillTypes.xsd`). Внутри четыре контейнера:

| Контейнер | Содержимое |
|---|---|
| `<fillTypes>` | `<fillType>` — определения типов (раздел 5). |
| `<fillTypeCategories>` | `<fillTypeCategory name="...">ИМЯ1 ИМЯ2 …</fillTypeCategory>` — группы типов (раздел 6). |
| `<fillTypeConverters>` | `<fillTypeConverter name="..."><converter from= to= factor=/></fillTypeConverter>` — превращение одного типа в другой (тед­дер: `GRASS_WINDROW`→`DRYGRASS_WINDROW`). |
| `<fillTypeSounds>` | `<fillTypeSound fillTypes="..."><sound template="..."/></fillTypeSound>` — звук пересыпания/налива. |

---

## 5. `<fillType>`

Атрибуты:

| Атрибут | Тип | Описание |
|---|---|---|
| `name` | STRING | Имя-идентификатор. Приводится к ВЕРХНЕМУ регистру; глобальное (без префикса мода). |
| `title` | STRING | Название в UI. `$l10n_<ключ>` резолвится через локализацию мода. |
| `showOnPriceTable` | BOOL[^bool] | Показывать в таблице цен. По умолчанию `false`. |
| `unitShort` | STRING | Короткая единица (обычно `$l10n_unit_literShort`). |
| `achievementName` | STRING | Имя связанного достижения (доставки). |
| `fillPlaneColors` | VEC3 | Цвет плоскости заполнения (напр. для навоза в загоне). По умолчанию `1 1 1`. |
| `isBulkType` | BOOL | Насыпной/наливной груз (в реальных файлах FS25). |
| `isPalletType` | BOOL | Продукт на паллете (в реальных файлах FS25; нужен `<pallet>`, физика/экономика не требуются). |

Дочерние элементы:

| Элемент | Атрибуты | Описание |
|---|---|---|
| `<physics>` | `massPerLiter`, `maxPhysicalSurfaceAngle` | Масса на литр (кг/л; внутри делится на 1000) и макс. угол поверхности (градусы, по умолчанию 30). |
| `<economy>` | `pricePerLiter` + `<factors><factor period= value=/>` | Цена за литр (по умолчанию 0) и месячные ценовые коэффициенты. |
| `<image>` | `hud`, `hudSmall` | Иконки HUD. |
| `<pallet>` | `filename` | Паллета/тара для продажи этого груза. |
| `<textures>` | `diffuse`, `normal`, `specular`, `distance` | Текстуры плоскости заполнения (карта `distance` — здесь, не в `<image>`). |
| `<effects>` | `prioritizedEffectType`, `fillSmokeColor`, `fruitSmokeColor` | Эффекты выгрузки. |

Пути (`hud`, `pallet#filename`, текстуры) резолвятся относительно мода; `$data/…`/`$dataS/…` — от корня
игры. `title`/`unitShort` — l10n-ключи мода.

---

## 6. Имя, глобальность и переопределение

- **Имя** приводится к верхнему регистру и кладётся в общие таблицы (`FillType.<ИМЯ>` = индекс). Одно на
  всю игру, без префикса мода.
- **Дубликат имени** обрабатывается по-разному: базовый файл повторное имя игнорирует; **файл мода
  переопределяет** уже существующий тип на месте (перезаписывает поля — цену, массу, иконку, паллету), а
  не создаёт второй. Так мод может изменить свойства базового `WHEAT`. Новое имя получает новый индекс.
- **Категории** (`<fillTypeCategory name="X">ИМЯ1 ИМЯ2 …`) группируют типы, чтобы техника принимала
  целую группу одним токеном. Имя категории тоже глобальное и в верхнем регистре. Базовые категории:
  `BULK`, `LIQUID`, `COMBINE`, `SPRAYER`, `SLURRYTANK` и т.п.

---

## 7. Как техника ссылается на тип

В `fillUnit` техники — два **взаимоисключающих** атрибута:

```xml
<fillUnit fillTypeCategories="BULK" capacity="20000"/>   <!-- по категории -->
<fillUnit fillTypes="DIESEL"        capacity="1500"/>     <!-- по имени -->
```

Указано и то и другое (или ничего) → предупреждение и отказ. Значения регистронезависимы (движок
приводит к верхнему регистру), поэтому в технике часто пишут строчными (`fillTypes="diesel"`), хотя
каноничное определение — в верхнем регистре. По имени на типы ссылаются и другие места (потребители
двигателя `consumer fillType=`, распылители/сеялки, производства).

---

## 8. Базовые типы

Базовые типы — в `data/maps/maps_fillTypes.xml` (в открытые исходники не входит, полный список
первоисточником не подтверждается). Встроенный технический тип — `UNKNOWN`.

Имена, подтверждённые прямо по коду движка: `UNKNOWN`, `DIESEL`, `DEF`, `ELECTRICCHARGE`, `METHANE`,
`FUEL`, `FERTILIZER`, `LIQUIDFERTILIZER`, `HERBICIDE`, `LIME`, `MANURE`, `LIQUIDMANURE`, `DIGESTATE`.
Прочие (по базовому файлу-зеркалу и практике): `WHEAT`, `BARLEY`, `OAT`, `CANOLA`, `MAIZE`, `SUNFLOWER`,
`SOYBEAN`, `POTATO`, `SUGARBEET`, `COTTON`, `GRASS`, `SILAGE`, `STRAW`, `WOODCHIPS`, `SEEDS`, `WATER`,
`MILK` и продукты (`FLOUR`, `BREAD`, `SUGAR`, …).

---

## 9. Примеры

Свой наливной тип с паллетой (реальный мод FS25_CropDiseases_BMP):

```xml
<map xsi:noNamespaceSchemaLocation="../../shared/xml/schema/fillTypes.xsd">
    <fillTypes>
        <fillType name="INSECTICIDE" title="$l10n_fillType_insecticide" showOnPriceTable="true" isBulkType="true" unitShort="$l10n_unit_literShort">
            <physics massPerLiter="1.0" maxPhysicalSurfaceAngle="0"/>
            <economy pricePerLiter="1.2"/>
            <image   hud="hud/hud_fill_insecticide.dds"/>
            <pallet  filename="pallets/insecticide/insecticideTank.xml"/>
        </fillType>
    </fillTypes>

    <fillTypeCategories>
        <fillTypeCategory name="SPRAYER">LIQUIDFERTILIZER HERBICIDE INSECTICIDE FUNGICIDE</fillTypeCategory>
    </fillTypeCategories>
</map>
```

Насыпной тип с плоскостью заполнения и месячными ценами (структура базового `WHEAT`):

```xml
<fillType name="WHEAT" title="$l10n_fillType_wheat" showOnPriceTable="true" unitShort="$l10n_unit_literShort">
    <physics massPerLiter="0.78" maxPhysicalSurfaceAngle="15"/>
    <economy pricePerLiter="0.337">
        <factors>
            <factor period="1" value="1.00"/>
            <factor period="12" value="1.08"/>
        </factors>
    </economy>
    <image    hud="$dataS/menu/hud/fillTypes/hud_fill_wheat.png"/>
    <pallet   filename="$data/objects/pallets/fillablePallet/fillablePallet.xml"/>
    <textures diffuse="$data/fillPlanes/wheat_diffuse.png" normal="$data/fillPlanes/wheat_normal.png" specular="$data/fillPlanes/wheat_specular.png" distance="$data/fillPlanes/distance/wheatDistance_diffuse.png"/>
</fillType>
```

Продукт на паллете (без физики/экономики):

```xml
<fillType name="BREAD" title="$l10n_fillType_bread" showOnPriceTable="true" isPalletType="true">
    <image  hud="$dataS/menu/hud/fillTypes/hud_fill_bread.png"/>
    <pallet filename="pallets/bakeryBoxPallet.xml"/>
</fillType>
```

---

## 10. Типичные ошибки

- **Инлайн-определение типов в modDesc** — нельзя; `<fillTypes>` только `filename`, типы в отдельном файле.
- **Неверный `filename`** — файл не найдётся, типы не добавятся.
- **Ожидание второго типа при совпадении имени** — файл мода **переопределяет** существующий тип, а не
  добавляет одноимённый.
- **И `fillTypes`, и `fillTypeCategories` на одном `fillUnit`** (или ни одного) — предупреждение и отказ.
- **Ссылка на несуществующий тип/категорию** в технике — груз не подхватится.
- **Отсутствует `<pallet>` у продаваемого через паллету типа** — продавать/покупать будет нечем.

---

## 11. Примечания

- modDesc только ссылается на файл; определения — во внешнем `<map>`-файле.
- Имена типов и категорий глобальны, в верхнем регистре, без префикса мода (`FillType.<ИМЯ>`).
- Файл мода может переопределить свойства базового типа (грузится после базовых и типов карты).
- `title`/`unitShort` — l10n-ключи мода; пути с `$data`/`$dataS` — от корня игры.
- Техника ссылается на тип по имени или категории (регистронезависимо).
- Поведение — по официальной схеме FS25 (`modDesc.xsd`) и движку игры. Полный базовый
  список — в `data/maps/maps_fillTypes.xml` (в открытые исходники не входит).

---

## Глоссарий

[^string]: STRING — строковый тип значения. <https://en.wikipedia.org/wiki/String_(computer_science)>
[^bool]: BOOL — логический тип (`true`/`false`). <https://en.wikipedia.org/wiki/Boolean_data_type>
