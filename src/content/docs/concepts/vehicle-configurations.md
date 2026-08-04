---
title: "Конфигурации техники в магазине"
description: "<...Configurations>/<...Configuration> (design/motor/wheel/…), <objectChange>, <configurationSets>; выбираемые варианты машины."
sidebar:
  label: "Конфигурации"
---
```xml
<designConfigurations title="$l10n_configuration_design">
    <designConfiguration name="Standard" saveId="STANDARD" price="0" isDefault="true">
        <objectChange node="designANode" visibilityActive="true"  visibilityInactive="false"/>
        <objectChange node="designBNode" visibilityActive="false" visibilityInactive="true"/>
    </designConfiguration>
    <designConfiguration name="Alternative" saveId="ALT" price="2500">
        <objectChange node="designANode" visibilityActive="false" visibilityInactive="true"/>
        <objectChange node="designBNode" visibilityActive="true"  visibilityInactive="false"/>
    </designConfiguration>
</designConfigurations>
```

Конфигурации — это **выбираемые в магазине варианты** одной машины (дизайн, двигатель, колёса, ёмкость,
цвета и т.п.). Каждый тип — контейнер `vehicle.<имя>Configurations` со списком элементов
`<имя>Configuration`; выбранный вариант меняет модель/параметры через `<objectChange>`, `<material>` и
специфичные для типа данные. Готовые сочетания вариантов собираются в комплекты
`<configurationSets>` (раздел 6).

> Расположение: блоки `vehicle.<имя>Configurations`. Раздел справочника — Concepts (сквозная тема).
> Покрасочные типы (`baseColor`/`designColor`/…) детально — [`<baseColorConfigurations>`](../base/base-color-configurations.md).

---

## 1. Как устроено

Тип конфигурации задаётся кодом (`ConfigurationManager`): контейнер-ключ `vehicle.<имя>Configurations`
и элемент-ключ `<имя>Configuration`; загрузчик перебирает элементы по индексу `(0)`, `(1)`, … до первого
отсутствующего. Загрузка — `ConfigurationUtil.getConfigurationsFromXML`: для каждого элемента вызывается
`itemClass.new` → `loadFromXML` → `postLoad`.

- **Показ в магазине** — каждый тип даёт селектор в экране конфигурации; подпись — из `title`
  контейнера, варианты — из `name` элементов.
- **Вариант по умолчанию** — первый с `isDefault="true"` (и `isSelectable≠false`); иначе первый
  `isSelectable`; иначе первый в списке.
- **Сохранение/сеть** — состояние пишется по `name` типа + `saveId` элемента + флагу активности.
- **Базовый класс-загрузчик** — `VehicleConfigurationItem`; часть типов имеет специализированные классы
  (раздел 4).

---

## 2. Общие атрибуты конфигурации

Есть у (почти) любого типа. **Контейнер** `<...Configurations>`:

| Атрибут | Тип | По умолчанию | Описание |
|---|---|---|---|
| `title` | L10N[^l10n] | — | Заголовок селектора в магазине. |
| `isYesNoOption` | BOOL[^bool] | `false` | Показать как переключатель да/нет. |
| `postLoadObjectChange` | BOOL | `false` | Применять `<objectChange>` на `postLoad`, а не на `load`. |

**Элемент** `<...Configuration>`:

| Атрибут | Тип | По умолчанию | Описание |
|---|---|---|---|
| `name` | L10N | индекс | Подпись варианта в магазине. |
| `params` | STRING[^string] | — | Параметры, подставляемые в `name` (`%s`). |
| `desc` | L10N | — | Описание варианта. |
| `price` | FLOAT[^float] | `0` | Цена варианта. |
| `dailyUpkeep` | FLOAT | `0` | Прибавка к ежедневному содержанию. |
| `isDefault` | BOOL | `false` | Предвыбран в магазине. |
| `isSelectable` | BOOL | `true` | Доступен для выбора. |
| `saveId` | STRING | номер | Стабильный идентификатор для сейва. |
| `displayBrand` | STRING | — | Иконка бренда в экране конфигурации. |
| `vehicleBrand` | STRING | — | Переопределяет бренд машины после покупки. |
| `vehicleName` | L10N | — | Переопределяет имя машины после покупки. |
| `vehicleIcon` | STRING | — | Переопределяет иконку после покупки. |
| `.shopOffset#translation` / `#rotation` | VEC3[^vec3] | — | Смещение камеры в магазине для этого варианта. |

Плюс `typeDesc` (L10N) и `workingWidth` (FLOAT) — регистрируются на уровне техники и показываются в
магазине. Дочерние блоки, общие для всех типов: `<objectChange>` (раздел 5), `<material>` (подмена
материала, см. [материалы и покраска](../base/materials-paint.md)), `<xmlOverwrites>` (`set`/`remove`/
`clearList`), `<shopOffset>`, `<size>`, `<dependentConfiguration>` (форсировать индекс другого типа).

---

## 3. `designConfigurations` — пример

Тип `design` — **выбор дизайна/ливреи** (вариант модели: какие детали/накладки показаны). Загружается
общим классом `VehicleConfigurationItem`, отдельных цветовых атрибутов **не имеет** — переключение идёт
через дочерние `<objectChange>` (видимость узлов дизайна) и/или `<material>`. Существует 16 параллельных
каналов: `design`, `design2` … `design16`.

Контейнер добавляет флаг `preLoad` (BOOL, `false`) — применить до загрузки (если конфигурация двигает
позиции колёс). Элемент несёт стандартный общий набор атрибутов (раздел 2).

**Связь с цветом.** `designConfigurations` и `designColorConfigurations` — **разные** типы:

- `designConfigurations` (`design`) — какой вариант дизайна показан;
- `designColorConfigurations` (`designColor`, класс `VehicleConfigurationItemColor`) — каким цветом он
  покрашен (см. [`<baseColorConfigurations>`](../base/base-color-configurations.md)).

Оба — по 16 каналов (`designN` выбирает вариант, `designColorN` его тонирует).

---

## 4. Типы конфигураций

FS25 определяет 57 типов (числовые каналы `design2…16`, `designColor2…16`, `consumable2` свёрнуты):

```
ackermannSteering, ai, animation, attacherJoint, automaticArmControlForwarder,
automaticArmControlHarvester, baler, baseColor, beaconLight, component,
connectionHose, consumable, consumer, cover, cropSensor, cylindered, design,
designColor, differential, dischargeable, enterablePassenger, fillUnit,
fillVolume, folding, frontloader, groundAdjustedNode, handToolHolder,
inputAttacherJoint, liftableAxle, logGrab, manureSensor, motor,
multipleItemPurchaseAmount, numDynamic, onion, pipe, plow, powerConsumer,
powerTakeOff, pulseWidthModulation, ridgeMarker, rimColor, roller,
slopeCompensation, tensionBelts, trailer, treeSaplingType, variableWorkWidth,
vehicleType, vineCutter, weedSpotSpray, wheel, winch, woodContainer, workArea,
workMode, wrappingAnimation, wrappingColor
```

Важнейшие (тип → что настраивает → класс-загрузчик):

| Тип | Настраивает | Класс |
|---|---|---|
| `design` (+2…16) | вариант дизайна/ливреи (видимость узлов) | `VehicleConfigurationItem` |
| `designColor` (+2…16) | цвет канала дизайна | `VehicleConfigurationItemColor` |
| `baseColor` | основной цвет | `VehicleConfigurationItemColor` |
| `rimColor` | цвет дисков | `VehicleConfigurationItemColor` |
| `wrappingColor` | цвет обмотки тюков | `VehicleConfigurationItemColor` |
| `wheel` | марка/комплект колёс (подвыбор по бренду) | `VehicleConfigurationItemWheel` |
| `motor` | двигатель (л.с./макс. скорость в магазине) | `VehicleConfigurationItemMotor` |
| `vehicleType` | подмена типа техники | `VehicleConfigurationItemVehicleType` |
| `treeSaplingType` | тип саженца на паллете | `VehicleConfigurationItemTreeSapling` |
| `component` | вариант базовых компонентов | `VehicleConfigurationItem` |
| `fillUnit` / `fillVolume` | вариант ёмкости / меша заполнения | `VehicleConfigurationItem` |
| `cover` | вариант тента/крышки | `VehicleConfigurationItem` |
| `frontloader` / `attacherJoint` / `inputAttacherJoint` | варианты сцепок | `VehicleConfigurationItem` |
| `folding` | вариант складывания | `VehicleConfigurationItem` |
| `pipe` | вариант выгрузной трубы комбайна | `VehicleConfigurationItem` |
| `workArea` / `workMode` / `variableWorkWidth` | рабочая зона / режим / ширина | `VehicleConfigurationItem` |
| `beaconLight` | вариант проблескового маяка | `VehicleConfigurationItem` |

Специализированных классов всего пять (`…Color`, `…Wheel`, `…Motor`, `…VehicleType`, `…TreeSapling`);
все прочие типы грузит общий `VehicleConfigurationItem`.

---

## 5. `<objectChange>` — переключение модели

`<objectChange>` — дочерний блок конфигурации (и многих других узлов): переводит узел сцены между
**активным** состоянием (этот вариант выбран) и **неактивным** (не выбран). Движок перебирает
`<objectChange>` всех вариантов типа: невыбранные применяют значения `*Inactive`, выбранный —
`*Active` **последним** (может перекрыть). Момент применения — `load` или `postLoad`
(по `postLoadObjectChange` контейнера).

Основные атрибуты (регистрируются базово; часть ниже добавляют отдельные спеки):

| Атрибут | Тип | Описание |
|---|---|---|
| `node` | NODE[^node] | Целевой узел (обязателен). |
| `visibilityActive` / `visibilityInactive` | BOOL | Показать/скрыть узел. |
| `translationActive` / `translationInactive` | VEC3 | Позиция. |
| `rotationActive` / `rotationInactive` | VEC3 | Поворот. |
| `scaleActive` / `scaleInactive` | VEC3 | Масштаб. |
| `shaderParameter` | STRING | Имя параметра шейдера. |
| `shaderParameterActive` / `shaderParameterInactive` | VEC4[^vec4] | Значение параметра шейдера. |
| `sharedShaderParameter` | BOOL (`false`) | Применить ко всем объектам с тем же материалом. |
| `shaderParameterSetRecursive` | BOOL (`false`) | Применить ко всем дочерним узлам. |
| `massActive` / `massInactive` | FLOAT | Масса (кг; внутри делится на 1000). |
| `centerOfMassActive` / `centerOfMassInactive` | VEC3 | Центр масс. |
| `compoundChildActive` / `compoundChildInactive` | BOOL | Вхождение в составное тело. |
| `rigidBodyTypeActive` / `rigidBodyTypeInactive` | STRING | `Static`/`Dynamic`/`Kinematic`/`None`. |
| `parentNodeActive` / `parentNodeInactive` | NODE | Перепривязка узла к другому родителю. |
| `deleteActive` / `deleteInactive` | BOOL | Удалить узел. |
| `interpolation` / `interpolationTime` | BOOL (`false`) / TIME | Плавный переход и его длительность. |
| `movingToolRotMin/MaxActive`, `movingToolStartRot/TransActive`, `movingToolTransMin/MaxActive` (+`Inactive`) | ANGLE/FLOAT | Пределы/старт для movingTool. |

Схема (`ObjectChange_single`) — надмножество: базово регистрируются node/visibility/translation/rotation/
scale/shaderParameter/mass/centerOfMass/compoundChild/rigidBodyType/parentNode, а `delete*`/`movingTool*`/
`shaderParameterSetRecursive` подключают отдельные спеки. Есть контейнерная форма `<objectChanges>`.

`<objectChange>` **не** переключает i3d-файл или шаблон материала: смена материала в конфигурации — через
отдельный дочерний `<material>` (`materialTemplateName` живёт там и в цветовых конфигурациях, не в
`<objectChange>`).

---

## 6. `<configurationSets>` — готовые комплекты

Собирают предустановленные сочетания вариантов в именованные «пакеты» магазина.

```xml
<configurationSets title="$l10n_shop_package">
    <configurationSet name="Base Package" isDefault="true">
        <configuration name="design"    index="1"/>
        <configuration name="baseColor"  index="1"/>
    </configurationSet>
    <configurationSet name="Premium Package">
        <configuration name="design"    index="2"/>
        <configuration name="baseColor"  index="3"/>
    </configurationSet>
</configurationSets>
```

| Уровень | Атрибуты |
|---|---|
| `<configurationSets>` | `title` (L10N), `isYesNoOption` (BOOL, `false`). |
| `<configurationSet>` | `name` (L10N — подпись комплекта), `params` (STRING), `isDefault` (BOOL). |
| `<configuration>` | `name` (STRING — **имя типа** конфигурации, напр. `design`), `index` (INT — **1-based** индекс выбранного варианта), `showWarning` (BOOL, `true`). |

Комплект = отображение «имя типа → выбранный индекс». Движок сверяет `name`/`index` с загруженными
конфигурациями и предупреждает, если тип или индекс не существует.

---

## 7. Типичные ошибки

- **`<configuration type="...">` в комплекте** — атрибутов `type` нет; ссылка задаётся `name` (имя типа) +
  `index` (1-based).
- **Ожидание `i3dFilename`/`materialTemplateName` на `<objectChange>`** — их там нет; смена файла/материала
  — через `<material>`/`<xmlOverwrites>`.
- **Дизайн-вариант «сам покрасится»** — `designConfigurations` только выбирает вариант; цвет — отдельный
  `designColorConfigurations`.
- **Нет `saveId`** — сохранение привязывается к номеру; при переупорядочивании вариантов сейвы «поедут».
  Задавать стабильный `saveId`.
- **Один `objectChange` без парного состояния** — задавать и `*Active`, и `*Inactive`, иначе при смене
  варианта узел не вернётся в исходное состояние.

---

## 8. Примечания

- Тип конфигурации — контейнер `vehicle.<имя>Configurations` + элементы `<имя>Configuration`; загрузка
  `ConfigurationUtil`, база `VehicleConfigurationItem` (5 специализированных классов: Color/Wheel/Motor/
  VehicleType/TreeSapling).
- Общие атрибуты элемента: `name`/`params`/`price`/`dailyUpkeep`/`isDefault`/`isSelectable`/`saveId` +
  переопределения бренда/имени/иконки; дочерние `<objectChange>`/`<material>`/`<xmlOverwrites>`.
- `designN` — вариант дизайна, `designColorN` — его цвет; по 16 каналов каждого.
- `<objectChange>` переключает узел между `*Active`/`*Inactive`; выбранный вариант применяется последним.
- `<configurationSets>` — пакеты по `name`+`index` (1-based).
- Поведение — по официальной схеме FS25 (`vehicle.xsd`) и движку (`ConfigurationUtil`,
  `ConfigurationManager`, `VehicleConfigurationItem`, `ObjectChangeUtil`, `StoreItemUtil`).

---

## Глоссарий

[^string]: STRING — строковый тип значения. <https://en.wikipedia.org/wiki/String_(computer_science)>
[^bool]: BOOL — логический тип (`true`/`false`). <https://en.wikipedia.org/wiki/Boolean_data_type>
[^float]: FLOAT — число с плавающей точкой. <https://en.wikipedia.org/wiki/Floating-point_arithmetic>
[^vec3]: VEC3 — вектор из трёх чисел. <https://en.wikipedia.org/wiki/Euclidean_vector>
[^vec4]: VEC4 — вектор из четырёх чисел. <https://en.wikipedia.org/wiki/Euclidean_vector>
[^node]: NODE — ссылка на узел i3d (имя i3d-маппинга или путь). <https://en.wikipedia.org/wiki/Scene_graph>
[^l10n]: L10N — ключ локализации (`$l10n_<ключ>`), заменяется переведённой строкой. <https://en.wikipedia.org/wiki/Internationalization_and_localization>
