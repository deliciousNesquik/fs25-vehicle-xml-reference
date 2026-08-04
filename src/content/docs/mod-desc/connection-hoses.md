---
title: "Элемент <connectionHoses>"
description: "Типы шлангов трактор↔орудие: внешний файл (basicHoses/connectionHoseTypes/sockets); ссылка по имени."
sidebar:
  label: "connectionHoses"
---
```xml
<connectionHoses>
    <connectionHose xmlFilename="xml/connectionHoses.xml"/>
</connectionHoses>
```

Подключает **типы шлангов подключения** — гидравлические/электрические/пневматические шланги, визуально
соединяющие трактор и навешенное орудие. В modDesc это список **ссылок на внешние файлы**: каждый
`<connectionHose>` содержит атрибут `xmlFilename`, указывающий на XML с определениями шлангов, адаптеров и
сокетов. Сами определения — в тех файлах.

> Расположение: дочерний элемент `<modDesc>`. Раздел справочника — modDesc.

---

## 1. Что это

Шланг подключения — это визуальная связка между портом орудия и портом (сокетом) трактора. Игра держит
базовый набор (гидравлика/электрика/воздух/ISOBUS); `<connectionHoses>` позволяет моду добавить свои типы
шлангов, адаптеров-коннекторов и сокетов. Определения регистрируются в общем реестре
(`g_connectionHoseManager`); техника ссылается на них по имени (раздел 6).

Один или несколько `<connectionHose xmlFilename>` подключают файлы; читается у **всех** модов (не только
DLC); разбор отложен: сначала базовый файл, затем файлы модов.

---

## 2. Атрибут `<connectionHose>`

| Атрибут | Тип | Обязателен | Описание |
|---|---|---|---|
| `xmlFilename` | STRING[^string] | да (практически) | Путь к внешнему XML с определениями шлангов. Относительно корня мода; `$data/…` — от корня игры. |

`<connectionHoses>` необязателен (`minOccurs="0"`), один; `<connectionHose>` внутри может быть несколько.

---

## 3. Внешний файл

Корень внешнего файла — `<connectionHoses>` (схема `connectionHoses.xsd`). Три независимых реестра:

**`<basicHoses>` → `<basicHose>`** — пул геометрии шлангов (безымянные записи; подбираются по ближайшему
диаметру и длине):

| Атрибут | По умолчанию | Описание |
|---|---|---|
| `filename` / `node` | — | i3d и узел геометрии шланга. |
| `diameter` | — | Диаметр (ключ подбора). |
| `length` / `realLength` | — | Опорная и реальная длина i3d. |
| `startStraightening` / `endStraightening` | `2` | Выпрямление у концов. |
| `minCenterPointAngle` | `90` | Мин. угол в средней точке. |

**`<connectionHoseTypes>` → `<connectionHoseType name="...">`** — именованные типы; каждый содержит:

- `<adapter name="DEFAULT" filename node detachedNode>` — геометрия коннектора на конце шланга.
- `<material name="DEFAULT" filename materialNode defaultColor(vec4) uvOffset(vec2) uvScale(vec2)>` —
  «шкурка» (материал) шланга.

**`<sockets>` → `<socket name filename node referenceNode shaderParameterColor>`** — порт на технике;
может содержать `<cap node openedRotation closedRotation openedVisibility closedVisibility>` — крышку,
открывающуюся/закрывающуюся при подключении.

---

## 4. Имена и неймспейс

- **Базовый файл** грузится с пустым окружением — его имена типов/адаптеров/материалов/сокетов **голые
  и глобальные**.
- **Файл мода:** имя `connectionHoseType` префиксуется `MODNAME.NAME`, **только если оно новое**; если
  тип с таким голым именем уже есть (базовый), мод **дополняет** его (можно добавить адаптеры/материалы).
  Имена адаптеров, материалов и сокетов **всегда** префиксуются именем мода.
- **Поиск** учитывает неймспейс с откатом: сначала `MODNAME.NAME`, затем голое имя. Поэтому в XML своей
  техники на свои шланги ссылаются голым именем (движок подставит префикс), а на базовые — голым
  глобальным.
- **Дубликаты:** тип с существующим голым именем — сливается (расширяется); сокет с существующим именем —
  отклоняется (первый побеждает); `basicHose` — просто добавляется в пул.

---

## 5. Базовые типы, адаптеры, сокеты

Базовые определения — в `data/shared/connectionHoses/connectionHoses.xml` (в открытые исходники не
входит; имена подтверждены по зеркалу базового файла и реальным модам):

- **Типы:** `hydraulicIn`, `hydraulicOut`, `electric`, `airDoubleRed`, `airDoubleYellow`, `isobus`,
  `TOOL_CONNECTOR_*`, `CABLE_BOUNDLE`.
- **Адаптеры:** `DEFAULT`, `METAL`, `RUBBER`.
- **Сокеты:** `electric`, `electric_metal`, `hydraulic01`–`hydraulic04`, `air_yellow`, `air_red`,
  `isobus`.

`DEFAULT` — запасное имя для адаптера и материала, если у типа они не поименованы.

---

## 6. Как техника использует шланги

Регистрация в modDesc **необходима, но недостаточна** — шланг появляется только когда его называет XML
техники. За это отвечает специализация `ConnectionHoses` (`vehicle.connectionHoses`). Ключевые ссылки на
реестр (реализация — скриптинг, здесь только связь имён):

- **Сторона орудия — `<hose>`:** `type` → `connectionHoseType`; `hoseType` → имя материала (по умолчанию
  `DEFAULT`); `adapterType` / `outgoingAdapter` → имена адаптеров; `socket` → имя сокета; `socketColor`.
- **Сторона трактора/навески — `<target>`:** `type` → тип; `socket` → имя сокета; `adapterType`;
  `socketColor`; `node`, `attacherJointIndices`.
- **`<customHose>` / `<customTarget>`:** `type` здесь — **произвольная строка-ключ**, соединение
  происходит при совпадении `type` (и `specType`) у кастомного шланга и кастомной цели.

Другие дочерние элементы спеки: `<skipNode>`, `<toolConnectorHose>` (со `startTarget`/`endTarget`),
`<localHose>`. Отдельного `<socket>`-элемента и `<supportArm>` в спеке нет — сокет задаётся атрибутом.

---

## 7. Примеры

Подключение файла в modDesc (в т.ч. можно сослаться на базовый файл):

```xml
<connectionHoses>
    <connectionHose xmlFilename="xml/connectionHoses.xml"/>
</connectionHoses>
```

Определение типа во внешнем файле (структура базового `hydraulicIn`):

```xml
<connectionHoses>
    <connectionHoseTypes>
        <connectionHoseType name="hydraulicIn">
            <adapter  name="DEFAULT" filename="$data/shared/connectionHoses/connectors.i3d" node="0|0" detachedNode="1|0"/>
            <material name="DEFAULT" filename="$data/shared/connectionHoses/hoseMaterialHolder.i3d" materialNode="0" defaultColor="0.01 0.01 0.01 0" uvOffset="0 0" uvScale="1 1"/>
        </connectionHoseType>
    </connectionHoseTypes>
    <sockets>
        <socket name="hydraulic01" filename="$data/shared/connectionHoses/connectors.i3d" node="2|2" referenceNode="0" shaderParameterColor="colorMat0">
            <cap node="1" openedVisibility="false" closedVisibility="true"/>
            <cap node="2" openedVisibility="true"  closedVisibility="false"/>
        </socket>
    </sockets>
</connectionHoses>
```

Ссылка на тип в XML техники (реальный мод FS25_BednarBatWing) — голым именем:

```xml
<connectionHoses>
    <hose inputAttacherJointIndices="1" type="hydraulicIn" node="hydraulicIn01" length="1.2" diameter="0.02" adapterNode="hydraulicIn01_connector"/>
    <hose inputAttacherJointIndices="1" type="electric"    node="electric"      length="1.3" diameter="0.01" adapterNode="electric_connector"/>
</connectionHoses>
```

---

## 8. Типичные ошибки

- **Инлайн-определения в modDesc** — нельзя; `<connectionHose>` только `xmlFilename`, определения в файле.
- **Ссылка на несуществующий тип/сокет/адаптер** в технике — шланг не создастся (имя не резолвится).
- **Регистрация без ссылок в технике** — визуально ничего не появится; нужны `<hose>` у орудия и
  `<target>` у трактора с совместимыми именами/суставами.
- **Ожидание, что свой сокет переопределит базовый** — сокет-дубликат отклоняется (первый побеждает); тип
  же с базовым именем — сливается.
- **Своё имя типа vs базовое** — своё имя неймспейсится (`MODNAME.NAME`), базовые — голые глобальные.

---

## 9. Примечания

- modDesc только ссылается на файл(ы); определения — во внешнем `<connectionHoses>`-файле (три реестра:
  `basicHoses`, `connectionHoseTypes`, `sockets`).
- Базовые имена глобальны; имена мода неймспейсятся (тип — если новый; адаптер/материал/сокет — всегда),
  поиск с откатом на голое имя.
- Мод может **дополнить** базовый тип (добавить адаптеры/материалы), сослав файл на существующее имя.
- Техника ссылается по имени: орудие — `<hose>`, трактор — `<target>` (сокет — атрибут, не элемент).
- Поведение — по официальной схеме FS25 (`modDesc.xsd`) и движку игры. Базовый файл —
  `data/shared/connectionHoses/connectionHoses.xml` (в открытые исходники не входит).

---

## Глоссарий

[^string]: STRING — строковый тип значения. <https://en.wikipedia.org/wiki/String_(computer_science)>
