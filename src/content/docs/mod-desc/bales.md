---
title: "Элемент <bales>"
description: "Типы тюков: внешний <bale> файл (i3d/размер/грузы/обмотка); подбор баллером по грузу+форме+размеру."
sidebar:
  label: "bales"
---
```xml
<bales>
    <bale filename="xml/bales/roundbale180.xml"/>
</bales>
```

Подключает **типы тюков** — определения тюков (круглых/квадратных) для разных грузов. В modDesc это
список **ссылок на внешние файлы**: каждый `<bale>` содержит атрибут `filename`, указывающий на XML с
определением тюка. Само определение (i3d, размеры, грузы, обмотка) — в том файле; он же становится
физическим объектом-тюком в мире.

> Расположение: дочерний элемент `<modDesc>`. Раздел справочника — modDesc.

---

## 1. Что это

Тюк — это объект, который производит пресс-подборщик (баллер) из подобранного груза. Игра держит базовый
набор тюков (задаётся картой); `<bales>` позволяет моду добавить свои определения (новый размер/форма или
тюк для кастомного груза). Определения регистрируются в общем реестре (`g_baleManager`); баллер по типу
груза, форме и размеру подбирает подходящее определение и порождает по нему объект-тюк.

Читается у **всех** модов (не только DLC, без права на скрипты); разбор отложен: файлы ставятся в очередь
и читаются при загрузке карты (i3d грузится асинхронно).

---

## 2. Атрибут `<bale>`

| Атрибут | Тип | Обязателен | Описание |
|---|---|---|---|
| `filename` | STRING[^string] | да (практически) | Путь к внешнему XML с определением тюка. Относительно корня мода; `$data/…` — от корня игры. |

`<bales>` необязателен (`minOccurs="0"`), один; `<bale>` внутри может быть несколько.

---

## 3. Внешний файл

Корень внешнего файла — `<bale>` (схема `bale.xsd`). Основные элементы:

| Элемент/атрибут | Описание |
|---|---|
| `<filename>` | Путь к i3d-модели тюка (**обязателен**; текст элемента). |
| `<size isRoundbale width height length diameter maxStackHeight …>` | Форма и габариты. `isRoundbale` по умолчанию `true`. Круглый тюк требует `width`+`diameter`; квадратный — `width`+`height`+`length`. `maxStackHeight` (дефолт 2 круглый / 3 квадратный); `visualWidth`/`visualHeight`/`visualLength`/`visualDiameter` — визуальные переопределения. |
| `<fillTypes><fillType name capacity mass …>` | Грузы, которые может содержать этот тюк (раздел 4). |
| `<baleMeshes><baleMesh node supportsWrapping isTensionBeltMesh isAlphaMesh fillTypes>` | Видимые меши тюка. |
| `<uvId>` | Идентификатор UV (дефолт `DEFAULT`); используется обмотчиком для подбора текстуры. |
| `<variations><variation id>` | Визуальные варианты (FS25): `DEFAULT`, `NETWRAP`, `FOILWRAP`, `TWINE` — с текстурами `<netWrapDiffuse>`/`<netWrapNormal>`. |
| `<mountableObject …>` | Параметры подъёма/переноса тюка. |
| `<packedBale singleBale="…"><singleBale node=/>` | Пакет из нескольких одиночных тюков. |

---

## 4. `<fillType>` внутри тюка

`<fillTypes>` перечисляет грузы (repeating). Атрибуты `<fillType>`:

| Атрибут | По умолчанию | Описание |
|---|---|---|
| `name` | — | Имя типа груза (см. [fillTypes](fill-types.md)); резолвится в индекс; неизвестный → предупреждение, пропуск. |
| `capacity` | `1000` | Ёмкость тюка в литрах для этого груза. |
| `mass` | `500` | Масса в кг. |
| `forceAcceleration` | — | Параметр физики переноса. |
| `supportsWrapping` | `false` | Можно ли обматывать (силос). |
| `materialName` / `alphaMaterialName` | — | Имена материалов меша (FS25). |

Дочерние текстуры: `<diffuse>`/`<normal>`/`<specular>`/`<alpha>`/`<baleNormal>` (`filename` или
`useFillTypeArray`). `<fermenting outputFillType requiresWrapping(def true) time>` — созревание (напр.
`GRASS_WINDROW` → `SILAGE` после обмотки, за N игровых дней).

Реестр использует только `name` + `capacity` для подбора; полный набор читает сам объект-тюк.

---

## 5. Подбор тюка и порождение

- Соответствие ищется по **(тип груза, форма, размер)**: `getBaleXMLFilename(fillTypeIndex, isRoundbale,
  width, height, length, diameter, customEnvironment)`. Совпадение: одинаковая форма, тип груза входит в
  `<fillTypes>` тюка, и размеры совпадают (круглый — `width`+`diameter`; квадратный —
  `width`+`height`+`length`; `nil` — «любой»).
- Баллер хранит `vehicle.baler.baleTypes.baleType` (с `isRoundBale` — **заглавная B** — и размерами) и
  при смене груза подбирает определение, кэширует и выставляет ёмкость fillUnit; при отсутствии совпадения
  — предупреждение `Could not find bale for given bale type definition`.
- **Тот же** `<bale>`-файл порождает физический объект в мире (`Bale:loadFromConfigXML`), сервер создаёт
  тюк, клиенты получают по сети.
- Тюки — **рантайм-объекты, не товары магазина**: в схеме тюка нет `<storeData>`, они не покупаются, а
  производятся баллером (или спавнятся командой).

---

## 6. Реестр и переопределение

- Все тюки (карты и модов) лежат в **одном плоском** глобальном списке `g_baleManager.bales`; у записи
  хранится `customEnvironment` (имя мода; `nil` у карты/базы).
- Поиск сначала берёт запись с `customEnvironment` **своего мода**, затем откатывается на глобальные
  (`nil`). То есть тюк мода приватен-первым, с глобальным фолбэком.
- **Дедупликации/переопределения нет:** записи просто добавляются; при совпадении (тип+форма+размер)
  побеждает **первая** подходящая (сначала своего мода). Заменить существующее сопоставление нельзя.

---

## 7. Минимум для тюка кастомного груза

1. Объявить тип груза в [`<fillTypes>`](fill-types.md) (иначе `<fillType name>` тюка молча пропустится).
2. Добавить `<bales><bale filename="…"/>` (путь от корня мода).
3. В файле тюка минимум: корень `<bale>` + `<filename>` (i3d) + `<size>` с формой и обязательными
   размерами + `<fillTypes><fillType name="MY_FILLTYPE" capacity="N"/>`.
4. Чтобы тюк реально прессовался — у баллера должен быть `baleType` с той же формой и размерами.

Ни права на скрипты, ни статус DLC не требуются.

---

## 8. Примеры

Список тюков в modDesc (реальный мод FS25_zLiftablePalletsBales):

```xml
<bales>
    <bale filename="xml/bales/roundbales/roundbale180.xml"/>
    <bale filename="xml/bales/squarebales/squarebale240.xml"/>
</bales>
```

Круглый тюк на несколько грузов (сокращённо):

```xml
<bale xsi:noNamespaceSchemaLocation="https://validation.gdn.giants-software.com/xml/fs25/bale.xsd">
    <filename>$data/objects/bales/roundbales/roundbale180/roundbale180.i3d</filename>
    <size isRoundbale="true" width="1.20" diameter="1.80" visualWidth="1.135"/>
    <uvId>DEFAULT</uvId>
    <fillTypes>
        <fillType name="GRASS_WINDROW" capacity="7500" mass="100" supportsWrapping="true">
            <fermenting outputFillType="silage" requiresWrapping="true" time="1"/>
        </fillType>
        <fillType name="STRAW" capacity="11000" mass="100" supportsWrapping="false"/>
    </fillTypes>
</bale>
```

Квадратный тюк — `<size>` с `width`/`height`/`length` и `isRoundbale="false"`:

```xml
<size isRoundbale="false" width="1.20" height="0.9" length="2.4"/>
```

---

## 9. Типичные ошибки

- **Инлайн-определения в modDesc** — нельзя; `<bale>` только `filename`, определение в файле.
- **`<fillType name>` не объявлен в fillTypes** — пропускается с предупреждением; тюк для этого груза не
  создастся.
- **Нет `<filename>` (i3d)** — загрузка тюка падает.
- **Неполные размеры** — круглому нужны `width`+`diameter`, квадратному `width`+`height`+`length`.
- **Нет совпадающего `baleType` у баллера** — тюк не спрессуется (`Could not find bale…`).
- **Ожидание тюка в магазине** — тюки не товары; их делает баллер.
- **Расчёт на переопределение базового тюка** — переопределения нет; побеждает первое совпадение.

---

## 10. Примечания

- modDesc только ссылается на файл(ы); определение — во внешнем `<bale>`-файле, он же — объект в мире.
- Подбор по (тип груза, форма, размер); поиск сначала своего мода, потом глобально.
- Тюки — рантайм-объекты, не store items.
- Поддерживаются `<variations>`, `materialName`/`alphaMaterialName`, `baleMesh#isAlphaMesh`.
- Поведение — по официальной схеме FS25 (`modDesc.xsd`) и движку игры. Базовые тюки задаются картой
  (`map.bales#filename`); базовые файлы данных в открытые исходники не входят.

---

## Глоссарий

[^string]: STRING — строковый тип значения. <https://en.wikipedia.org/wiki/String_(computer_science)>
