# Farming Simulator 2025
## Элемент `<filename>` в блоке `<base>`

Путь к файлу 3D-сцены техники (`.i3d`[^i3d]).

Источник схемы: `Vehicle.lua` (`FS25`), `vehicle.base.filename`.

---

## 1. Что это

`<filename>` задаёт путь к `.i3d`-файлу — сцене с 3D-моделью, нодами, коллизиями, физикой. Без него у техники нет геометрии, поэтому элемент фактически обязателен.

Схема:

```
vehicle.base.filename — STRING, по умолчанию nil
```

Загрузка (`Vehicle:loadFinished`): путь разрешается относительно каталога мода и файл грузится асинхронно через `g_i3DManager`.

---

## 2. Откуда брать `.i3d`

Файл `.i3d` — результат экспорта модели из **GIANTS Editor**[^giantseditor] (или из Blender через плагин-экспортёр GIANTS с последующей доводкой в редакторе). Готовый `.i3d` кладётся в каталог мода, а путь к нему указывается здесь.

---

## 3. Разрешение пути

- **Относительно каталога мода** (`Utils.getFilename(value, baseDirectory)`), например `deutzAgroStar661.i3d` или `models/tool.i3d`.
- **Ссылка на ассеты игры** через префикс `$data/...` — так переиспользуют базовые модели.
- **Только прямые слэши** `/`. Обратные слэши `\` запрещены — загрузчик выдаёт предупреждение.

---

## 4. Примеры XML

Модель в корне мода:

```xml
<base>
    <filename>deutzAgroStar661.i3d</filename>
</base>
```

Модель в подпапке мода:

```xml
<base>
    <filename>models/deutzAgroStar661.i3d</filename>
</base>
```

Базовая модель из данных игры:

```xml
<base>
    <filename>$data/vehicles/.../someBase.i3d</filename>
</base>
```

---

## 5. Примечания

- Соседний файл `.i3d.shapes` (геометрия) должен лежать рядом с `.i3d` — он подгружается автоматически.
- Устаревшая форма `vehicle.filename` (FS17–FS19) переносится в `vehicle.base.filename`.

---

## Глоссарий

[^i3d]: i3d — формат файла сцены (модели) GIANTS Engine. <https://gdn.giants-software.com/documentation.php>
[^giantseditor]: GIANTS Editor — редактор сцен и моделей для GIANTS Engine. <https://gdn.giants-software.com/downloads.php>
