# Farming Simulator 2025
## Кастомная покраска через спецификацию (скрипт)

Как добавить технике **дополнительную/свободную покраску** скриптом-специализацией. Внизу — полный
рабочий исходник спеки (`CustomPaint.lua`) и её регистрация в modDesc.

> Раздел справочника — Concepts (сквозной гайд). Механика: параметр шейдера `colorScale`,
> см. [материалы и покраска](../base/materials-paint.md).

---

## 1. Когда скрипт НЕ нужен

Для фиксированных цветов магазина скрипт не требуется: в XML техники достаточно блока конфигурации цвета
с `useDefaultColors="true"` — движок сам добавит брендовые цвета **и свободный RGB-пикер**, с сохранением
и синхронизацией в MP (`VehicleConfigurationItemColor`). Скрипт нужен для **динамической покраски в
рантайме** (клавиша-переключатель, живой RGB, покраска по событию).

---

## 2. Механизм

- **Цвет = параметр шейдера материала** `colorScale`: `x,y,z` = линейный RGB, `w` = тип
  краски/глянца. Установка: `setShaderParameter(node, "colorScale", r, g, b, w, false)` (`w=nil` —
  сохранить текущий тип).
- **Перебор окрашиваемых материалов** — обход графа сцены: `getHasClassId(node, ClassIds.SHAPE)` →
  `getNumOfMaterials` / `getMaterialSlotName`, рекурсия `getNumOfChildren` / `getChildAt`.
- **Сохранение** — `saveToXMLFile` + схема сейва на `Vehicle.xmlSchemaSavegame`
  (`vehicles.vehicle(?).customPaint#color`).
- **MP** — начальная синхронизация через `onReadStream`/`onWriteStream`; изменения в рантайме — событие
  `CustomPaintSetColorEvent` (`NetworkUtil.write/readCompressedColor`).

---

## 3. Шаги

1. **Выбрать подход.** Фиксированные цвета магазина — без скрипта (`useDefaultColors="true"`). Скрипт —
   только для динамической покраски.
2. **Подготовить i3d:** окрашиваемые детали используют материал с параметром `colorScale`; каждому
   окрашиваемому материалу задать стабильное уникальное имя слота (`materialSlotName`) в GIANTS Editor.
3. **Создать каркас мода:** `modDesc.xml` + `scripts/CustomPaint.lua` (деплой/симлинк — скил `fs25-mod-deploy`).
4. Положить `CustomPaint.lua` в `scripts/`; имя глобальной таблицы (`CustomPaint`) = `className` в modDesc.
5. Зарегистрировать спеку в `<specializations>` (`name=customPaint`, `className=CustomPaint`,
   `filename=scripts/CustomPaint.lua`).
6. В `<vehicleTypes>` добавить `<type parent="<базовый тип>">` с `<specialization name="<модпапка>.customPaint"/>`
   на каждый нужный базовый тип.
7. Опц. клавиша: `<actions>`/`<inputBinding>` для перебора пресетов.
8. Переключить целевую технику на новый тип (`<vehicle type="...">`); опц. блок `<customPaint>` со списком
   `<material materialSlotName="..."/>` (иначе красятся все материалы с `colorScale`).
9. Тест в одиночной: сменить цвет, проверить, что меняются только нужные детали.
10. Тест сохранения: сохранить/загрузить — цвет должен сохраниться.
11. Тест MP: хост + клиент, смена цвета видна у обоих; лог — скил `fs25-modding-debug`.

---

## 4. Регистрация в modDesc

```xml
<modDesc descVersion="98">
    <!-- ... author, version, title, iconFilename и т.д. ... -->

    <specializations>
        <specialization name="customPaint" className="CustomPaint" filename="scripts/CustomPaint.lua"/>
    </specializations>

    <vehicleTypes>
        <type name="tractorCustomPaint" parent="tractor">
            <specialization name="FS25_CustomPaint.customPaint"/>
        </type>
        <type name="trailerCustomPaint" parent="trailer">
            <specialization name="FS25_CustomPaint.customPaint"/>
        </type>
    </vehicleTypes>

    <actions>
        <action name="CUSTOMPAINT_CYCLE" axisType="HALF"/>
    </actions>
    <inputBinding>
        <actionBinding action="CUSTOMPAINT_CYCLE">
            <binding device="KB_MOUSE_DEFAULT" input="KEY_lshift KEY_p"/>
        </actionBinding>
    </inputBinding>
</modDesc>
```

В XML техники — переключить тип: `<vehicle type="tractorCustomPaint" ...>`. Опц. ограничить окрашиваемые
слоты:

```xml
<customPaint defaultColor="0.9 0.9 0.9">
    <material materialSlotName="chassisMat"/>
    <material materialSlotName="bodyMat"/>
</customPaint>
```

---

## 5. Исходник `scripts/CustomPaint.lua`

```lua
--
-- CustomPaint.lua
-- Добавляет технике свободно выбираемый кастомный цвет в рантайме.
-- Покраска идёт через параметр шейдера "colorScale".
--
-- Механика:
--   * Цвет = параметр материала "colorScale": x,y,z = RGB, w = тип краски/глянца.
--        setShaderParameter(node, "colorScale", r, g, b, w, false)  (w=nil сохраняет тип)
--   * Окрашиваемые материалы находятся обходом графа сцены (ClassIds.SHAPE).
--   * Сохранение — saveToXMLFile + схема на Vehicle.xmlSchemaSavegame.
--   * MP — onReadStream/onWriteStream (join) + CustomPaintSetColorEvent (рантайм).
--
-- Для фиксированных цветов магазина скрипт НЕ нужен: <colorConfigurations
-- useDefaultColors="true"> даёт брендовые цвета + свободный RGB-пикер сам.
--

CustomPaint = {}

CustomPaint.PRESETS = {
    {name = "White",  color = {0.95, 0.95, 0.95}},
    {name = "Red",    color = {0.60, 0.02, 0.02}},
    {name = "Green",  color = {0.05, 0.25, 0.05}},
    {name = "Blue",   color = {0.02, 0.05, 0.35}},
    {name = "Yellow", color = {0.75, 0.60, 0.02}},
    {name = "Black",  color = {0.02, 0.02, 0.02}},
}

function CustomPaint.prerequisitesPresent(specializations)
    return true
end

function CustomPaint.initSpecialization()
    local schema = Vehicle.xmlSchema
    schema:setXMLSpecializationType("CustomPaint")

    schema:register(XMLValueType.STRING, "vehicle.customPaint.material(?)#materialSlotName",
        "Имя слота материала i3d для покраски (можно несколько). Без него красятся все материалы с colorScale.")
    schema:register(XMLValueType.VECTOR_3, "vehicle.customPaint#defaultColor",
        "Цвет по умолчанию (линейный RGB), если в сейве нет своего", "0.95 0.95 0.95")
    schema:register(XMLValueType.FLOAT, "vehicle.customPaint#defaultMatType",
        "Тип краски/глянца в 4-й компонент colorScale (nil = сохранить исходный)")

    schema:setXMLSpecializationType()

    local schemaSavegame = Vehicle.xmlSchemaSavegame
    local key = "vehicles.vehicle(?).customPaint"
    schemaSavegame:register(XMLValueType.VECTOR_3, key .. "#color", "Выбранный кастомный цвет")
    schemaSavegame:register(XMLValueType.FLOAT, key .. "#matType", "Выбранный тип краски (colorScale w)")
end

function CustomPaint.registerFunctions(vehicleType)
    SpecializationUtil.registerFunction(vehicleType, "setCustomPaintColor",    CustomPaint.setCustomPaintColor)
    SpecializationUtil.registerFunction(vehicleType, "applyCustomPaintColor",  CustomPaint.applyCustomPaintColor)
    SpecializationUtil.registerFunction(vehicleType, "getCustomPaintColor",    CustomPaint.getCustomPaintColor)
    SpecializationUtil.registerFunction(vehicleType, "cycleCustomPaintPreset", CustomPaint.cycleCustomPaintPreset)
end

function CustomPaint.registerEventListeners(vehicleType)
    SpecializationUtil.registerEventListener(vehicleType, "onLoad",                 CustomPaint)
    SpecializationUtil.registerEventListener(vehicleType, "onPostLoad",             CustomPaint)
    SpecializationUtil.registerEventListener(vehicleType, "onReadStream",           CustomPaint)
    SpecializationUtil.registerEventListener(vehicleType, "onWriteStream",          CustomPaint)
    SpecializationUtil.registerEventListener(vehicleType, "onRegisterActionEvents", CustomPaint)
end

function CustomPaint:onLoad(savegame)
    local spec = self.spec_customPaint
    spec.actionEvents = {}

    spec.materialSlotNames = {}
    spec.hasSlotFilter = false
    self.xmlFile:iterate("vehicle.customPaint.material", function(_, matKey)
        local slot = self.xmlFile:getValue(matKey .. "#materialSlotName")
        if slot ~= nil then
            spec.materialSlotNames[slot] = true
            spec.hasSlotFilter = true
        end
    end)

    spec.color   = self.xmlFile:getValue("vehicle.customPaint#defaultColor", nil, true) or {0.95, 0.95, 0.95}
    spec.matType = self.xmlFile:getValue("vehicle.customPaint#defaultMatType")
    spec.presetIndex = 1

    if savegame ~= nil and not savegame.resetVehicles then
        local key   = savegame.key .. ".customPaint"
        local color = savegame.xmlFile:getValue(key .. "#color", nil, true)
        if color ~= nil then
            spec.color = color
        end
        spec.matType = savegame.xmlFile:getValue(key .. "#matType", spec.matType)
    end
end

function CustomPaint:onPostLoad(savegame)
    self:applyCustomPaintColor()
end

function CustomPaint:applyCustomPaintColor()
    local spec = self.spec_customPaint
    if spec.color == nil then
        return
    end

    local r, g, b = spec.color[1], spec.color[2], spec.color[3]
    local w = spec.matType  -- nil => сохранить текущий тип краски

    local function shouldPaint(node, materialIndex)
        if spec.hasSlotFilter then
            return spec.materialSlotNames[getMaterialSlotName(node, materialIndex)] == true
        end
        return select(1, getShaderParameter(node, "colorScale")) ~= nil
    end

    local function applyRec(node)
        if getHasClassId(node, ClassIds.SHAPE) then
            local num = getNumOfMaterials(node)
            local paintNode = false
            for i = 0, num - 1 do
                if shouldPaint(node, i) then
                    paintNode = true
                    break
                end
            end
            if paintNode then
                setShaderParameter(node, "colorScale", r, g, b, w, false)
            end
        end

        local numChildren = getNumOfChildren(node)
        for i = 0, numChildren - 1 do
            applyRec(getChildAt(node, i))
        end
    end

    for _, component in ipairs(self.components) do
        applyRec(component.node)
    end
end

function CustomPaint:setCustomPaintColor(r, g, b, matType, noEventSend)
    local spec = self.spec_customPaint
    spec.color   = {r, g, b}
    spec.matType = matType

    self:applyCustomPaintColor()

    if noEventSend == nil or noEventSend == false then
        if g_server ~= nil then
            g_server:broadcastEvent(CustomPaintSetColorEvent.new(self, r, g, b, matType), nil, nil, self)
        else
            g_client:getServerConnection():sendEvent(CustomPaintSetColorEvent.new(self, r, g, b, matType))
        end
    end
end

function CustomPaint:getCustomPaintColor()
    local spec = self.spec_customPaint
    if spec.color == nil then
        return nil
    end
    return spec.color[1], spec.color[2], spec.color[3], spec.matType
end

function CustomPaint:cycleCustomPaintPreset()
    local spec = self.spec_customPaint
    spec.presetIndex = (spec.presetIndex % #CustomPaint.PRESETS) + 1
    local preset = CustomPaint.PRESETS[spec.presetIndex]
    self:setCustomPaintColor(preset.color[1], preset.color[2], preset.color[3], spec.matType, false)

    if self.isClient and g_currentMission ~= nil then
        g_currentMission:showBlinkingWarning(string.format("Paint: %s", preset.name), 1500)
    end
end

function CustomPaint:saveToXMLFile(xmlFile, key, usedModNames)
    local spec = self.spec_customPaint
    if spec.color ~= nil then
        xmlFile:setValue(key .. "#color", spec.color[1], spec.color[2], spec.color[3])
    end
    if spec.matType ~= nil then
        xmlFile:setValue(key .. "#matType", spec.matType)
    end
end

function CustomPaint:onWriteStream(streamId, connection)
    local spec = self.spec_customPaint
    local r, g, b = 1, 1, 1
    if spec.color ~= nil then
        r, g, b = spec.color[1], spec.color[2], spec.color[3]
    end
    NetworkUtil.writeCompressedColor(streamId, r, g, b)
    if streamWriteBool(streamId, spec.matType ~= nil) then
        streamWriteFloat32(streamId, spec.matType)
    end
end

function CustomPaint:onReadStream(streamId, connection)
    local r, g, b = NetworkUtil.readCompressedColor(streamId)
    local matType
    if streamReadBool(streamId) then
        matType = streamReadFloat32(streamId)
    end
    self:setCustomPaintColor(r, g, b, matType, true)
end

function CustomPaint:onRegisterActionEvents(isActiveForInput, isActiveForInputIgnoreSelection)
    if self.isClient then
        local spec = self.spec_customPaint
        self:clearActionEventsTable(spec.actionEvents)

        if self:getIsActiveForInput(true, true) then
            local _, eventId = self:addActionEvent(spec.actionEvents, InputAction.CUSTOMPAINT_CYCLE,
                self, CustomPaint.actionEventCycle, false, true, false, true, nil)
            g_inputBinding:setActionEventText(eventId, "Cycle paint colour")
            g_inputBinding:setActionEventTextPriority(eventId, GS_PRIO_LOW)
        end
    end
end

function CustomPaint.actionEventCycle(self, actionName, inputValue, callbackState, isAnalog)
    self:cycleCustomPaintPreset()
end

CustomPaintSetColorEvent = {}
local CustomPaintSetColorEvent_mt = Class(CustomPaintSetColorEvent, Event)

InitEventClass(CustomPaintSetColorEvent, "CustomPaintSetColorEvent")

function CustomPaintSetColorEvent.emptyNew()
    return Event.new(CustomPaintSetColorEvent_mt)
end

function CustomPaintSetColorEvent.new(vehicle, r, g, b, matType)
    local self = CustomPaintSetColorEvent.emptyNew()
    self.vehicle = vehicle
    self.r, self.g, self.b = r, g, b
    self.matType = matType
    return self
end

function CustomPaintSetColorEvent:writeStream(streamId, connection)
    NetworkUtil.writeNodeObject(streamId, self.vehicle)
    NetworkUtil.writeCompressedColor(streamId, self.r, self.g, self.b)
    if streamWriteBool(streamId, self.matType ~= nil) then
        streamWriteFloat32(streamId, self.matType)
    end
end

function CustomPaintSetColorEvent:readStream(streamId, connection)
    self.vehicle = NetworkUtil.readNodeObject(streamId)
    self.r, self.g, self.b = NetworkUtil.readCompressedColor(streamId)
    if streamReadBool(streamId) then
        self.matType = streamReadFloat32(streamId)
    end
    self:run(connection)
end

function CustomPaintSetColorEvent:run(connection)
    if self.vehicle ~= nil and self.vehicle:getIsSynchronized() then
        self.vehicle:setCustomPaintColor(self.r, self.g, self.b, self.matType, true)
    end

    if not connection:getIsServer() then
        g_server:broadcastEvent(self, false, connection, self.vehicle)
    end
end
```

---

## 6. Примечания

- Для фиксированной палитры магазина скрипт не нужен (`useDefaultColors="true"` даёт брендовые цвета +
  свободный RGB-пикер). Скрипт — для рантайм-покраски.
- Красится параметр `colorScale`. Некоторые устаревшие материалы вместо него имеют `colorMat0`
  (7-арг `setShaderParameter`, без завершающего индекса материала).
- Имена функций сверены по движку FS25 (`VehicleMaterial`, `ConfigurationUtil`, событие по
  образцу базовых Event-классов); исходник — рабочая заготовка, проверять на своей сборке по `log.txt`.
- Если в логе появляются предупреждения `colorScale` на неокрашиваемых мешах — задать белый список слотов
  через блок `<customPaint><material materialSlotName=.../>`.
- Связано: [материалы и покраска](../base/materials-paint.md), [`<baseMaterialConfigurations>`](../base/base-material-configurations.md),
  [specializations](../mod-desc/specializations.md), [inputBinding](../mod-desc/input-binding.md).
