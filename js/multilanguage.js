var zhPath = "./data/zh/";
var itemFileName = "items.json";
var skillFileName = "skills.json";
var basicActionFileName = "basicActions.json";


var zhItemDict = {};
var zhSkillDict = {};
var zhBasicActionDict = {};

function Test() {
    TranslateToZh();

    let skillData = GetSkillData(503);
    let basicActionData = GetBasicActionData(1);

    console.log(zhBasicActionDict);
    console.log(basicActionData);

    Refresh();

    let i = 0;
    for (let key in zhBasicActionDict) {
        let actioinData = zhBasicActionDict[key];
        if (actioinData != null) {
            let line = '<tr class="skill_tr" id="basicAction_' + i + '"><td class="strings">' + actioinData["name"] + write_skill(actioinData) + '</td> <td class="enum">' + actioinData["timing"]
                + '</td> <td class="nump">' + actioinData["skill_rank"] + '/' + actioinData["skill_max_rank"] + '</td></tr> '
            document.getElementById("skill_block").insertAdjacentHTML('beforeend', line);
        }
        i++;
    }
};

function TranslateToZh() {
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
            }
        }
    }

    //item
    translateKeys = ["type", "timing", "target", "roll", "function", "tags"];
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
                }

                translateKeys.forEach(key => {
                    item[key] = zhItemData[key];
                });
            }
        }
    }

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