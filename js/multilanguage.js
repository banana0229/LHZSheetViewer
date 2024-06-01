const jp = 0;
const zh = 1;

var zhPath = "./data/zh/";
var jpPath = "./data/jp/";
var itemFileName = "items.json";
var skillFileName = "skills.json";
var basicActionFileName = "basicActions.json";
var prefixedEffectFileName = "prefixed_effects.json";

var jpPrefixedEffectDict = {};

var zhItemDict = {};
var zhSkillDict = {};
var zhBasicActionDict = {};
var zhPrefixedEffectDict = {};
var testBasicActionDict = {};

var Language = 0;


function Test() {
    TranslateToZh();
    
    let basicActionData = GetBasicActionData(1);

    //console.log(zhBasicActionDict);
    //console.log(basicActionData);
    let testEffectID = GetPrefixedEffectID("〔起動：判定直後〕この武器による［武器攻撃］、もしくはあなたの［魔法攻撃］の［命中判定］のダイスに６の出目が１つ以上あれば、判定をクリティカルにする。シナリオ１回使用可能。")
    console.log(testEffectID);
    let zhEffectData = GetPrefixedEffectData(testEffectID)
    console.log(zhEffectData["name"]);
    console.log(zhEffectData["function"]);
    readTranslataionJSON("./data/jp/", basicActionFileName, "basicActions", testBasicActionDict);

    Refresh();

    let i = 0;
    for (let key in testBasicActionDict) {
        let actioinData = testBasicActionDict[key];
        if (actioinData != null) {
            let line = '<tr class="skill_tr" id="basicAction_' + i + '"><td class="strings">' + actioinData["name"] + write_skill(actioinData) + '</td> <td class="enum">' + actioinData["timing"]
                + '</td> <td class="nump">' + actioinData["skill_rank"] + '/' + actioinData["skill_max_rank"] + '</td></tr> '
            document.getElementById("skill_block").insertAdjacentHTML('beforeend', line);
        }
        i++;
    }
};

function TranslateToZh() {
    Language = zh;
    //skill
    let translateKeys = ["name", "timing", "roll", "target", "range", "cost", "limit", "function", "explain"];
    for (let i = 0; i < currentData["skills"].length; i++) {
        let skill = currentData["skills"][i];
        if (skill) {
            let zhSkillData = GetSkillData(skill["id"]);
            if (zhSkillData != null) {
                translateKeys.forEach(key => {
                    skill[key] = zhSkillData[key];
                });
                let tags = [...zhSkillData["tags"]]
                skill["tags"] = tags
            }
        }
    }

    //item
    translateKeys = ["type", "range", "timing", "target", "roll", "function","recipe"];
    for (let i = 0; i < currentData["items"].length; i++) {
        let item = currentData["items"][i];
        if (item) {
            let zhItemData = GetItemData(item["id"]);
            if (zhItemData != null) {
                if (item["prefix_function"] == null) {
                    if (item["name"] === item["alias"]) {
                        item["alias"] = zhItemData["alias"]
                    }
                    item["name"] = zhItemData["name"]
                    let tags = [...zhItemData["tags"]]
                    item["tags"] = tags
                }
                else{
                    let prefixedEffectID = GetPrefixedEffectID(item["prefix_function"])
                    if(prefixedEffectID != 0){
                        let zhprefixedEffectData = GetPrefixedEffectData(prefixedEffectID)
                        item["prefix_function"] = zhprefixedEffectData["function"]
                        if (item["name"] === item["alias"]) {
                            item["alias"] = zhprefixedEffectData["name"] + zhItemData["alias"]
                        }
                        item["name"] = zhprefixedEffectData["name"] + zhItemData["name"]
                        let tags = [...zhItemData["tags"]]
                        let mgTag = "M"+zhprefixedEffectData["rank"]
                        tags.push(mgTag)
                        item["tags"] = tags
                    }
                }

                translateKeys.forEach(key => {
                    item[key] = zhItemData[key];
                });
            }
        }
    }

    //equipment
    var equipmentKeys = ["hand1", "hand2", "armor", "support_item1", "support_item2", "support_item3", "bag"];
    equipmentKeys.forEach(equipmentKey => { 
        let item = currentData[equipmentKey];
        if (item) {
            let zhItemData = GetItemData(item["id"]);
            if (zhItemData != null) {
                if (item["prefix_function"] == null) {
                    if (item["name"] === item["alias"]) {
                        item["alias"] = zhItemData["alias"]
                    }
                    item["name"] = zhItemData["name"]
                    let tags = [...zhItemData["tags"]]
                    item["tags"] = tags
                }
                else{
                    let prefixedEffectID = GetPrefixedEffectID(item["prefix_function"])
                    if(prefixedEffectID != 0){
                        let zhprefixedEffectData = GetPrefixedEffectData(prefixedEffectID)
                        item["prefix_function"] = zhprefixedEffectData["function"]
                        if (item["name"] === item["alias"]) {
                            item["alias"] = zhprefixedEffectData["name"] + zhItemData["alias"]
                        }
                        item["name"] = zhprefixedEffectData["name"] + zhItemData["name"]
                        let tags = [...zhItemData["tags"]]
                        let mgTag = "M"+zhprefixedEffectData["rank"]
                        tags.push(mgTag)
                        item["tags"] = tags
                    }
                }

                translateKeys.forEach(key => {
                    item[key] = zhItemData[key];
                });
            }
        }
    });

    Refresh();
}

function readTranslataionJSON(folderName, fileName, dataKey, dict) {
    if (Object.keys(dict).length == 0) {
        var request = new XMLHttpRequest();
        request.open("GET", folderName + fileName, false);
        request.send();
        let translationData = JSON.parse(request.responseText);

        for (let i = 0; i < translationData[dataKey].length; i++) {
            let data = translationData[dataKey][i];
            if (data) {
                dict[data["id"]] = data;
            }
        }
    }
}

function GetSkillData(skillID) {
    readTranslataionJSON(zhPath, skillFileName, "skills", zhSkillDict);

    if (skillID in zhSkillDict) {
        return zhSkillDict[skillID];
    }

    return null;
}

function GetItemData(itemID) {
    readTranslataionJSON(zhPath, itemFileName, "items", zhItemDict);

    if (itemID in zhItemDict) {
        return zhItemDict[itemID];
    }

    return null;
}

function GetBasicActionData(ationID) {
    readTranslataionJSON(zhPath, basicActionFileName, "basicActions", zhBasicActionDict);

    if (ationID in zhBasicActionDict) {
        return zhBasicActionDict[ationID];
    }

    return null;
}

function GetPrefixedEffectID(prefixedEffect) {
    readTranslataionJSON(jpPath, prefixedEffectFileName, "prefixed_effects", jpPrefixedEffectDict);

    let id = 0;
    Object.entries(jpPrefixedEffectDict).every(([k,v]) => {
        if(v["function"] === prefixedEffect){
            id = k;
            return false;
        }
        return true;
    })
    
    return id;
}

function GetPrefixedEffectData(prefixedEffectID) {
    readTranslataionJSON(zhPath, prefixedEffectFileName, "prefixed_effects", zhPrefixedEffectDict);

    if (prefixedEffectID in zhPrefixedEffectDict) {
        return zhPrefixedEffectDict[prefixedEffectID];
    }

    return null;
}