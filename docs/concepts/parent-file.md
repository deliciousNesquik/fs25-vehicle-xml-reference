# Farming Simulator 2025
## Механизм `<parentFile>` (наследование XML)

```xml
<parentFile xmlFilename="$data/vehicles/brand/model/model.xml">
    <attributes>
        <set    path="vehicle.storeData.price" value="21000"/>
        <remove path="vehicle.wheels.wheelConfigurations.wheelConfiguration(1)"/>
        <clearList path="vehicle.designConfigurations.designConfiguration" keepIndex="1"/>
    </attributes>
</parentFile>
```

Наследование XML: файл берёт **родительский XML за основу** и накладывает на него правки
(`set`/`remove`/`clearList`). Это **общий механизм движка** (работает в любом XML: техника, placeable,
сейв, `modDesc`), а не фича конкретного блока. Основное применение — **варианты конфигов техники**
(реколоры, аддоны, разные комплектации одной базовой машины). Формально `<parentFile>` есть и среди
дочерних `<modDesc>` (см. раздел modDesc), но там встречается редко.

> Расположение: корень любого XML движка. Раздел справочника — Concepts (сквозная тема).

---

## 1. Что это и как применяется

При загрузке файла с `<parentFile>` движок (`XMLFile:initInheritance`):

1. Читает `parentFile#xmlFilename` из **дочернего** файла.
2. Загружает **родителя** отдельным дескриптором.
3. Применяет правки `<attributes>` **поверх родителя**.
4. **Уничтожает дескриптор дочернего файла и заменяет его родительским** (`delete(childHandle)` →
   `handle = parentHandle`).

Ключевое следствие: из дочернего файла берутся **только** `parentFile#xmlFilename` и операции
`parentFile.attributes` — **все прочие собственные элементы дочернего файла отбрасываются** и в игре не
действуют. Итог = **родитель + правки**.

Если родитель не загрузился — предупреждение в лог, наследование не применяется.

---

## 2. Атрибут `xmlFilename`

| Атрибут | Тип | Описание |
|---|---|---|
| `xmlFilename` | STRING[^string] | Путь к родительскому XML — основе. |

- **Относительный** — от каталога **своего** мода (родитель лежит внутри этого мода).
- **`$data/...`** — файл базовой игры (`$`-префикс — единственный способ выйти за пределы своего мода).
- Ссылка на файл **другого** мода нативно не работает (нужен community-мод Extended Filenames, форма
  `$moddir$…`). Родитель — либо в своём моде, либо в данных игры. Это **не** `<dependency>`.

---

## 3. Операции в `<attributes>`

| Операция | Атрибуты | Действие |
|---|---|---|
| `<set>` | `path`, `value` | Записать значение по XML-пути[^xpath]. Пишется **строкой** (`setXMLString`); создаёт узел/атрибут, если его нет. Может задавать как атрибут (`…#attr`), так и **текст элемента** (путь без `#`). |
| `<remove>` | `path` | Удалить узел по пути. Список **переиндексируется** (следующий элемент занимает освободившийся индекс). |
| `<clearList>` | `path`, `keepIndex` | Очистить весь повторяющийся список, кроме элемента `keepIndex` (удаление идёт с конца — от старших индексов к младшим). |

**Порядок фиксирован кодом, а не порядком в XML:** сначала выполняются **все `remove`**, затем **все
`set`**, затем **все `clearList`**. Interleaving в документе на порядок не влияет.

`path`: элементы через `.`, индекс повторяющегося элемента `(n)`, атрибут `#attr`
(`vehicle.storeData.price`, `…wheelConfiguration(1)#isSelectable`).

---

## 4. Идиом «удалить диапазон» через повтор `remove`

Так как `remove` переиндексирует список, **повторение одного и того же индекса удаляет подряд идущие
элементы**:

```xml
<!-- удалить configuration 2 и 3 (после удаления 2 бывший 3 становится 2) -->
<remove path="vehicle.configurationSets.configurationSet(0).configuration(2)"/>
<remove path="vehicle.configurationSets.configurationSet(0).configuration(2)"/>

<!-- удалить наборы 3..17 -->
<remove path="vehicle.configurationSets.configurationSet(3)"/>
<remove path="vehicle.configurationSets.configurationSet(3)"/>
<!-- ...столько раз, сколько наборов нужно снести... -->
```

Это штатный приём, а не ошибка.

---

## 5. Собственные элементы дочернего файла не действуют

Поскольку дескриптор ребёнка заменяется родительским (раздел 1), любые **свои** элементы рядом с
`<parentFile>` (например `<wearable>`, `<washable>`) **в игре игнорируются**. Чтобы изменить их —
только через `<attributes>`:

```xml
<!-- своим элементом при parentFile не применяется -->
<wearable wearDuration="480" workMultiplier="5" fieldMultiplier="2"/>

<!-- эквивалент — через set внутри attributes -->
<set path="vehicle.wearable#wearDuration"    value="480"/>
<set path="vehicle.wearable#workMultiplier"  value="5"/>
<set path="vehicle.wearable#fieldMultiplier" value="2"/>
```

**`storeData` — исключение по назначению.** Иногда дочерний файл несёт standalone-`<storeData>` с
комментарием `ONLY FOR ICON GENERATION`: в игре он тоже отбрасывается (витрина берётся из storeData
родителя + `set …storeData.*`), но его читает **офлайн-генератор иконок**, который загружает файл **без**
резолва `parentFile`. Поэтому такой блок оставляют намеренно.

---

## 6. Пример: вариант техники (реальный кейс)

Вариант МТЗ на базе `mtz_800.xml`: правит стор-данные, прячет лишние конфигурации колёс/дизайна,
переопределяет наборы конфигураций и переносит `wearable`/`washable` в патчи:

```xml
<vehicle type="MTZ8001000" ... >
    <annotation>Copyright (C) GIANTS Software GmbH, All Rights Reserved.</annotation>

    <parentFile xmlFilename="mtz_800.xml">
        <attributes>
            <set path="vehicle.wearable#wearDuration"   value="480"/>
            <set path="vehicle.washable#dirtDuration"   value="90"/>

            <set path="vehicle.storeData.image" value="stores/store_892.png"/>
            <set path="vehicle.storeData.name"  value="MT3 920.3/952.3/1025.3"/>

            <set path="vehicle.wheels.wheelConfigurations.wheelConfiguration(0)#isSelectable" value="false"/>
            <!-- ...прочие isSelectable=false... -->

            <set    path="vehicle.configurationSets.configurationSet(0).configuration(0)#index" value="11"/>
            <remove path="vehicle.configurationSets.configurationSet(0).configuration(2)"/>
            <remove path="vehicle.configurationSets.configurationSet(0).configuration(2)"/>
            <set    path="vehicle.configurationSets.configurationSet(0)#name" value="$l10n_configuration_920"/>
        </attributes>
    </parentFile>

    <!-- ONLY FOR ICON GENERATION (в игре игнорируется, нужен генератору иконок) -->
    <storeData>
        <name>MT3 920.3/952.3/1025.3</name>
        <image>stores/store.png</image>
        <brand>MTZ</brand>
        <category>tractorsS</category>
    </storeData>
</vehicle>
```

---

## 7. Типичные ошибки

- **Свои элементы (`wearable`/`washable`/…) рядом с `parentFile`** — не применяются; переносить в `set`.
- **Ожидание «домержа» прочих элементов ребёнка** — читается только `<parentFile>`.
- **Ссылка на файл другого мода** — нативно не резолвится (нужен `$`-форма/Extended Filenames).
- **Путаница с `<dependencies>`** — родитель не требует отдельной установки; он в своём моде или `$data`.
- **Неверный `path`** — путь должен соответствовать структуре **родителя**.
- **Ставка на порядок операций по документу** — движок делает remove→set→clearList независимо от порядка.

---

## 8. Примечания

- Общий механизм наследования XML движка (`XMLFile:initInheritance`), не привязан к `modDesc`; чаще всего —
  варианты техники/placeable без копирования всего XML.
- Итог = родитель + правки; из ребёнка живут только `parentFile#xmlFilename` и `attributes`.
- `storeItem` при этом указывает на **дочерний** файл; витрина в игре собирается из storeData родителя +
  `set`.
- Механика подтверждена дословно по FS22 `xml/XMLFile.lua` (`initInheritance` :306-353; замена дескриптора
  :346-348; порядок remove/set/clearList; резолв пути через `Utils.getFilename`). Движок общий с FS25;
  открытого зеркала FS25-загрузчика нет, но `XMLFile.lua` идентичен по механизму.

---

## Глоссарий

[^string]: STRING — строковый тип значения (здесь — путь к файлу). <https://en.wikipedia.org/wiki/String_(computer_science)>
[^xpath]: XML-путь — адрес узла/атрибута: элементы через `.`, индекс `(n)`, атрибут `#attr`. <https://en.wikipedia.org/wiki/XPath>
