# Farming Simulator 2025
## Элемент `<densityMapHeightTypes>`

```xml
<densityMapHeightTypes filename="xml/densityMapHeightTypes.xml"/>
```

Подключает **типы насыпных материалов на земле** — слой карты высот, благодаря которому груз можно
высыпать на террейн физической кучей. В modDesc это только **ссылка на внешний файл**: единственный
атрибут `filename` указывает на XML с определениями `<densityMapHeightType>`. Каждое определение
привязывает тип наполнения (`fillType`) к его представлению в виде кучи.

> Расположение: дочерний элемент `<modDesc>`. Раздел справочника — modDesc.

---

## 1. Что это

Куча на земле (сено, зерно, щебень и т.п.) реализована через density-map слой высот. Чтобы груз можно
было **высыпать на террейн** и потом собрать/сгрести, у его типа наполнения должен быть зарегистрирован
`densityMapHeightType`. Это тот самый механизм, который проверяет `DensityMapHeightUtil.getCanTipToGround`
перед высыпанием на землю.

`<densityMapHeightTypes filename="...">` подключает внешний файл; типы регистрируются в **общем
глобальном** реестре (`g_densityMapHeightManager`) — вместе с базовыми и с типами карты.

---

## 2. Атрибут `<densityMapHeightTypes>`

| Атрибут | Тип | Обязателен | Описание |
|---|---|---|---|
| `filename` | STRING[^string] | да (практически) | Путь к внешнему XML с типами насыпных материалов. Относительно корня мода; `$data/…` — от корня игры. |

Определений инлайн в modDesc нет — только ссылка на файл.

---

## 3. Как загружается

- modDesc читает `modDesc.densityMapHeightTypes#filename` и ставит файл в очередь
  (`g_densityMapHeightManager:addModDensityMapHeightTypes(...)`); путь резолвится относительно мода.
- Читается у **всех** модов (не только DLC).
- Разбор **отложенный**: сначала базовые типы (`data/maps/maps_densityMapHeightTypes.xml`), затем типы
  карты, затем файлы модов. Поэтому мод может переопределять базовые.

---

## 4. Внешний файл

Корень читается динамически (у базового файла и карты — `<map>`). Внутри — контейнер
`<densityMapHeightTypes>` с записями `<densityMapHeightType>`:

Атрибуты контейнера `<densityMapHeightTypes>`:

| Атрибут | Тип | По умолчанию | Описание |
|---|---|---|---|
| `firstChannel` | INT[^int] | `0` | Первый бит-канал слоя высот. |
| `numChannels` | INT | `6` | Число бит-каналов. |

`<densityMapHeightType>`:

| Атрибут/элемент | Тип | По умолчанию | Описание |
|---|---|---|---|
| `fillTypeName` | STRING | — (ключ) | Имя типа наполнения, которому даётся куча. Резолвится в индекс fillType; неизвестный → ошибка и прерывание загрузки файла. |
| `maxSurfaceAngle` | FLOAT[^float] | `26` (град.) | Макс. угол поверхности кучи (угол естественного откоса). |
| `fillToGroundScale` | FLOAT | `1` | Масштаб пересчёта «литры ↔ высота кучи». |
| `allowsSmoothing` | BOOL[^bool] | `false` | Разрешено ли сглаживание кучи. |
| `<collision scale=>` | FLOAT | `1` | Масштаб коллизии кучи. |
| `<collision baseOffset=>` | FLOAT | `0` | Базовое смещение коллизии. |
| `<collision minOffset=>` | FLOAT | `0` | Мин. смещение коллизии. |
| `<collision maxOffset=>` | FLOAT | `1` | Макс. смещение коллизии. |

Загрузчик читает **только** эти поля. `maxHeight`, `baseFillLevel`, текстуры/материалы здесь **не**
задаются — карты высот и «дальние» текстуры кучи строятся из определения самого `fillType` (`<textures>`
в fillTypes-файле).

---

## 5. Связь с fillTypes и высыпанием на землю

Запись сопоставляет `fillType` (по имени → индексу) его куче и хранится в
`fillTypeNameToHeightType`/`fillTypeIndexToHeightType`. Отсюда — ключевое правило:

- **`getCanTipToGround(fillTypeIndex)`** возвращает `false`, если у типа нет зарегистрированного
  heightType → такой груз **нельзя высыпать кучей на землю**.
- **`getMinValidLiterValue`** для типа без heightType возвращает `0`; `tipToGroundAroundLine` сразу
  возвращает `0,0` (террейн не деформируется). `getFillLevelAtArea`/`removeFromGroundByArea`/
  `changeFillTypeAtArea` тоже выходят рано.

Итог: добавление `densityMapHeightType` **включает** для груза кучу на земле (высыпать, сгрести, собрать
погрузчиком). Без него груз полностью рабочий (возится в прицепе, хранится в силосе, сдаётся на точке),
но кучей на террейн его не высыпать.

---

## 6. Глобальность и переопределение

- Реестр **глобальный** (`g_densityMapHeightManager`), ключ — имя/индекс fillType; без префикса мода.
- **Дубликат:** базовый файл при повторе имени выдаёт ошибку и пропускает; файл мода/карты **переопределяет
  и мержит** существующую запись на месте (незаданные поля берутся из уже существующей). Порядок загрузки
  (база → карта → моды) задаёт приоритет: мод может изменить кучу базового `WHEAT`.

---

## 7. Базовые типы

Базовые — в `data/maps/maps_densityMapHeightTypes.xml` (в открытые исходники не входит, поэтому список
имён первоисточником не подтверждается). Кучу на земле имеют стандартные насыпные грузы: зерно/масличные
(`WHEAT`, `BARLEY`, `CANOLA`, `MAIZE`, …), корнеплоды навалом (`POTATO`, `SUGARBEET`), `CHAFF`/`SILAGE`,
валки (`GRASS_WINDROW`, `DRYGRASS_WINDROW`), `WOODCHIPS`, стройматериалы (`STONE`/`GRAVEL`/`SAND`/`LIME`).

---

## 8. Пример

Своя куча для кастомного насыпного груза (структура из подтверждённых полей):

```xml
<map>
    <densityMapHeightTypes>
        <densityMapHeightType fillTypeName="MYBULK" maxSurfaceAngle="26" fillToGroundScale="1" allowsSmoothing="false">
            <collision scale="1" baseOffset="0" minOffset="0" maxOffset="1"/>
        </densityMapHeightType>
    </densityMapHeightTypes>
</map>
```

(Тип `MYBULK` должен быть заранее объявлен в [fillTypes](fill-types.md).)

---

## 9. Типичные ошибки

- **`fillTypeName` на несуществующий тип** — ошибка и прерывание загрузки всего файла; тип должен быть
  объявлен в fillTypes.
- **Инлайн-определения в modDesc** — нельзя; `<densityMapHeightTypes>` только `filename`.
- **Ожидание кучи без heightType** — насыпной груз без записи `densityMapHeightType` на землю не
  высыпается (`getCanTipToGround` → false).
- **Задание текстур/`maxHeight` здесь** — не читаются; визуал кучи идёт из `<textures>` типа наполнения.
- **Расчёт на «второй» тип при совпадении имени** — файл мода переопределяет/мержит существующую запись.

---

## 10. Примечания

- modDesc только ссылается на файл; определения — во внешнем `<map>`-файле.
- Реестр глобальный, ключ — fillType; мод может переопределить базовую кучу (грузится после базовых).
- Читаемые поля: `fillTypeName`, `maxSurfaceAngle` (град.), `fillToGroundScale`, `allowsSmoothing`,
  `<collision>` (scale/baseOffset/minOffset/maxOffset). Визуал — из fillType.
- Наличие heightType — условие высыпания груза кучей на землю (`getCanTipToGround`).
- Поведение — по официальной схеме FS25 (`modDesc.xsd`) и движку игры. Базовый список — в
  `data/maps/maps_densityMapHeightTypes.xml` (в открытые исходники не входит).

---

## Глоссарий

[^string]: STRING — строковый тип значения. <https://en.wikipedia.org/wiki/String_(computer_science)>
[^float]: FLOAT — число с плавающей точкой. <https://en.wikipedia.org/wiki/Floating-point_arithmetic>
[^int]: INT — целочисленный тип. <https://en.wikipedia.org/wiki/Integer_(computer_science)>
[^bool]: BOOL — логический тип (`true`/`false`). <https://en.wikipedia.org/wiki/Boolean_data_type>
