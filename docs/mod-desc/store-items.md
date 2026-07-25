# Farming Simulator 2025
## Элемент `<storeItems>`

```xml
<storeItems>
    <storeItem xmlFilename="vehicles/myHeader.xml"/>
</storeItems>
```

Перечисляет **товары мода для магазина** — по одной записи `<storeItem>` на каждую покупаемую позицию.
Каждая запись только **указывает путь** к XML-файлу предмета (техника, орудие, ручной инструмент,
паллета/объект, размещаемый объект). Вся витринная информация (название, цена, категория, бренд, иконка)
хранится **не здесь**, а в блоке `<storeData>` внутри самого файла предмета (см. раздел 4).

> Расположение: дочерний элемент `<modDesc>`. Раздел справочника — modDesc.

---

## 1. Что это

Чтобы предмет мода появился в магазине, его файл нужно зарегистрировать записью `<storeItem>`. modDesc
лишь **ссылается** на файл; движок открывает этот файл и читает из него `<storeData>`. Один и тот же
паттерн работает для техники (`<vehicle>`), размещаемых объектов (`<placeable>`) и ручных инструментов
(`<handTool>`) — вид предмета определяется содержимым файла, а не элементом `<storeItem>`.

Несколько `<storeItem>` подряд образуют «пак» — просто набор отдельных товаров (см. раздел 6).

---

## 2. Атрибуты `<storeItem>`

| Атрибут | Тип | Обязателен | Описание |
|---|---|---|---|
| `xmlFilename` | STRING[^string] | да (практически) | Путь к XML-файлу предмета, относительно корня мода. Единственный атрибут, читаемый движком. |

`<storeItems>` необязателен (`minOccurs="0"`), один; `<storeItem>` внутри может быть несколько.
`xmlFilename` формально не помечен обязательным в схеме, но запись без него движок молча пропускает.

Путь резолвится относительно корня мода. Префикс `$` означает **абсолютный путь от корня игры**:
`xmlFilename="$data/vehicles/..."` сошлётся на **базовый** файл игры (так мод может добавить в магазин
предмет из базовой игры).

Некоторые моды пишут у `<storeItem>` атрибут `rootNode="vehicle"` — движок его **не читает**, и в
официальной XSD его нет. Это устаревший no-op; вид предмета определяется по `<storeData>`/корню файла,
а не по нему.

---

## 3. Что происходит при загрузке

1. На загрузке мода движок проходит `modDesc.storeItems.storeItem`, берёт `#xmlFilename` и ставит
   предмет в очередь (`g_storeManager:addModStoreItem(xmlFilename, modDir, modName, …)`) — сразу файл не
   читается.
2. Позже (`StoreManager:loadMapData`) каждый предмет асинхронно загружается через `StoreManager:loadItem`.
3. `xmlFilename` резолвится относительно корня мода (`Utils.getFilename`); `$`-путь — от корня игры.
4. `customEnvironment` предмета = имя мода — по нему резолвятся `$l10n_`-переводы из локализации мода.

---

## 4. Где лежат данные магазина: `<storeData>`

Ключевой момент: **вся витринная информация — в файле предмета, а не в modDesc.** Движок берёт корневой
элемент файла (`vehicle`/`placeable`/`handTool`) и читает блок `<корень>.storeData`. Основные поля:

| Поле `<storeData>` | Назначение |
|---|---|
| `name` | Название в магазине (обычно `$l10n_<ключ>`; можно `name params="a|b"` с шаблоном `%s %s`). |
| `image` | Иконка магазина (обязательна, если предмет виден в магазине). |
| `price` | Цена покупки. |
| `dailyUpkeep` | Ежедневное содержание. |
| `lifetime` | Ресурс/срок службы. |
| `brand` | Бренд (по имени; см. раздел 7). |
| `category` | Категория(-и) магазина, через пробел (по имени; см. раздел 7). |
| `species` | Вид предмета: `vehicle` (по умолчанию), `placeable`, `handTool`, `object` и т.д. (раздел 5). |
| `functions` → `function` | Пункты списка «Функции» в карточке магазина (`$l10n_…`). |
| `specs` | Тех.характеристики (для техники/паллет: `capacity`, `fillTypes`, `weight` и т.п.). |
| `showInStore` | Показывать ли в магазине (по умолчанию `true`). |
| `canBeSold` | Можно ли продавать. |
| `allowLeasing` | Доступен ли в лизинг. |
| `maxItemCount` | Предел числа экземпляров. |
| `rotation` / `shopHeight` | Ориентация/высота модели в превью магазина. |
| `financeCategory` | Категория в финансовой статистике. |
| `brush` | Для размещаемых: параметры кисти строительного меню (`type`/`category`/`tab`). |
| `storeIconRendering` | Настройки камеры для авто-генерации иконки. |

Набор полей шире перечисленного; выше — используемые чаще всего.

---

## 5. Вид предмета: `species`

Вид (техника / размещаемый / инструмент / объект) определяется полем `<storeData><species>`; при его
отсутствии — `vehicle`. `species` выбирает схему разбора: `vehicle` → схема техники, `placeable` → схема
размещаемого, `handTool` → схема инструмента.

Корневой элемент файла на практике **совпадает** с `species` (`<vehicle>` ↔ `vehicle`, `<placeable>` ↔
`placeable`, `<handTool>` ↔ `handTool`) и служит префиксом ключей XML. Паллеты и простые объекты обычно
оформляются как техника: файл с корнем `<vehicle type="pallet">`.

---

## 6. Паки и покупка нескольких штук

- **Пак** — просто несколько `<storeItem>` в одном `<storeItems>`; каждый предмет отдельный. Может
  смешивать виды (техника + размещаемые).
- **`multiPurchase` — не понятие движка.** Имя файла вида `multiPurchaseLiquidTank_*.xml` — соглашение
  автора; для движка это обычный товар со своим `<storeData>`.
- **Покупка «N штук за раз»** — отдельная механика: файл с корнем `<vehicle type="multipleItemPurchase">`,
  внутри блок `<multipleItemPurchase …>` (позиции/смещения) и
  `<multipleItemPurchaseAmountConfigurations>` (варианты количества и цены).
- **Бандл** (один товар из нескольких под-предметов) задаётся полем `<storeData>` `bundleElements`
  внутри файла, а не в modDesc.

---

## 7. Категория и бренд

- **`category`** резолвится **по имени** (регистр не важен), можно несколько через пробел. Неизвестная
  категория → лог `Invalid category …`, откат к `MISC`. Категории — из базовой игры плюс
  `<storeCategories>` DLC. Обычный (не-DLC) мод **не может** завести новую
  категорию через modDesc — использует базовое имя категории либо регистрирует её скриптом.
- **`brand`** резолвится по имени к индексу бренда; неизвестный → откат к `LIZARD`. Бренды — из базовой
  игры плюс `<brands>` мода (для брендов ограничения «только DLC» нет).

---

## 8. Примеры

Один товар — техника (реальный мод FS25_CutterMover):

```xml
<storeItems>
    <storeItem xmlFilename="vehicles/myHeader.xml"/>
</storeItems>
```

Смешанный набор — паллеты и размещаемый объект (реальный мод FS25_CropDiseases_BMP):

```xml
<storeItems>
    <storeItem xmlFilename="pallets/insecticide/insecticideTank.xml"/>
    <storeItem xmlFilename="pallets/fungicide/fungicideTank.xml"/>
    <storeItem xmlFilename="placeables/liquidstation/liquidstation.xml"/>
</storeItems>
```

`<storeData>` размещаемого объекта (в файле предмета, не в modDesc):

```xml
<placeable type="buyingStation">
    <storeData>
        <name>$l10n_shopItem_fieldworkFillStation</name>
        <functions>
            <function>$l10n_function_fieldworkFillStation</function>
        </functions>
        <image>icons/store_fieldworkFillStation.png</image>
        <price>15000</price>
        <dailyUpkeep>2</dailyUpkeep>
        <lifetime>100</lifetime>
        <brand>LIZARD</brand>
        <species>placeable</species>
        <category>placeableMisc</category>
        <brush>
            <type>placeable</type>
            <category>buildings</category>
            <tab>containers</tab>
        </brush>
    </storeData>
    ...
</placeable>
```

`<storeData>` техники/паллеты с характеристиками и скрытием из магазина:

```xml
<vehicle type="pallet">
    <storeData>
        <name params="$l10n_name_bulkPallet|$l10n_fillType_refillable">%s %s</name>
        <specs>
            <capacity>1200</capacity>
            <fillTypes>BULK</fillTypes>
            <weight ignore="true"/>
        </specs>
        <image>icons/store_bulkPallet_refillable.png</image>
        <price>50</price>
        <allowLeasing>false</allowLeasing>
        <canBeSold>false</canBeSold>
        <showInStore>false</showInStore>
        <brand>LIZARD</brand>
        <category>pallets</category>
        <financeCategory>PURCHASE_SEEDS</financeCategory>
    </storeData>
    ...
</vehicle>
```

---

## 9. Типичные ошибки

- **Нет `xmlFilename`** — запись молча пропускается.
- **Файл не открывается** (неверный путь/регистр) — предмет тихо не регистрируется (без ошибки в логе).
- **В файле нет `<storeData>`** — `No storeData found. StoreItem will be ignored!`, предмет отброшен.
- **Нет `name`** — предупреждение, предмет отброшен.
- **Нет `image` при `showInStore=true`** — предупреждение, предмет отброшен (скрытый предмет иконку может
  не иметь).
- **Неизвестная `category`/`brand`** — откат к `MISC`/`LIZARD` (предмет попадёт не туда, куда задумано).
- **Расчёт на `rootNode`** — атрибут не читается; вид задаёт `<storeData><species>` и корень файла.
- **Данные магазина в modDesc** — их там нет; всё в `<storeData>` файла предмета.

---

## 10. Примечания

- modDesc только ссылается на файл; витринные данные — в `<storeData>` внутри файла предмета.
- Вид предмета — из `<storeData><species>` (по умолчанию `vehicle`); корень файла обычно ему
  соответствует.
- `xmlFilename` относителен корню мода; `$data/...` ссылается на базовую игру.
- `showInStore=false` — валидный кейс: предмет зарегистрирован, но скрыт (база для конфигураций,
  члены бандла, добавляемые скриптом).
- Размещаемые с блоком `<brush>` попадают в строительное меню.
- Механика подтверждена по исходникам FS22 и FS25 (`StoreManager.lua`, `StoreItemUtil.lua`, `mods.lua`) и
  реальными модами (FS25_CutterMover, FS25_CropDiseases_BMP, FS22_FieldworkFillStation, FS22_BetterBulkBox).

---

## Глоссарий

[^string]: STRING — строковый тип значения. <https://en.wikipedia.org/wiki/String_(computer_science)>
