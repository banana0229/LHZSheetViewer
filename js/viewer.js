var Database = {};
var tmpdata;
var currentData;
var isIgnoreMostExpensiveItem = new Boolean(false);
var isIgnoreInitialItem = new Boolean(false);
var isShowBasicAction = new Boolean(false);
var ignoreList = [];

function OnIsIgnoreMostExpensiveItemToggle() {
	Refresh();
}
function OnIsIgnoreInitialItemToggle() {
	Refresh();
}
function OnIsShowBasicActionToggle() {
	Refresh();
}

function Refresh() {
	if (currentData != null) {
		datafill(currentData);
	}
}

function openjson() {
	let url_id = document.getElementById("sheet_id").value;
	if (url_id === "test") {
		document.getElementById("testBtn").style.display = "block";
		return;
	}
	let request = new XMLHttpRequest();

	request.open('GET', "https://lhrpg.com/lhz/api/" + url_id + ".json");
	request.responseType = 'json';
	request.send();

	request.onload = function () {
		let data = request.response;
		tmpdata = JSON.parse(JSON.stringify(data));
		//TODO：選擇語言
		Language = jp;
		datafill(tmpdata);
		document.getElementById("view_char").value = "";
		document.getElementById("tmp_char").label = "ID:" + document.getElementById("sheet_id").value;
		select_char();
	}
}

function openjson_local(e) {
	let reader = new FileReader();
	reader.readAsText(e.files[0], "UTF-8");
	reader.onload = function () {
		Database = JSON.parse(reader.result);
		update_list();
	}
}

function savejson() {
	let key = document.getElementById("save_char").value;
	if (!(key in Database)) {
		Database[key] = {};
	}
	if (tmpdata) {
		let tmpcr = "CR:" + tmpdata["character_rank"]
		Database[key][tmpcr] = tmpdata;
		update_list();
		document.getElementById("view_char").value = key;
		select_char();
	}
}

function writejson() {
	let str = JSON.stringify(Database); // 出力文字列
	if (str.localeCompare("{}") == 0) {
		alert("無法取得角色資料。請確認從冒險窗口匯入後是否有存檔。");
		return;
	}
	let ary = str.split(''); // 配列形式に変換（後述のBlobで全要素出力）
	let blob = new Blob(ary, { type: "text/json" }); // テキスト形式でBlob定義
	let link = document.createElement('a'); // HTMLのaタグを作成
	link.href = URL.createObjectURL(blob); // aタグのhref属性を作成
	link.download = 'LHViewer.lhdb'; // aタグのdownload属性を作成
	link.click(); // 定義したaタグをクリック（実行）
}

function select_char() {
	let key = document.getElementById("view_char").value;
	let str_list = '<option value="" label="CR:--"></option>\n'
	if (key != "") {
		Object.keys(Database[key]).map(key2 => {
			str_list += '<option value="' + key2 + '" label="' + key2 + '"></option>\n'
		});
	}
	let crOptions = document.getElementById("cr_list").options;
	document.getElementById("cr_list").innerHTML = str_list;
	document.getElementById("cr_list").value = crOptions.length > 0 ? crOptions[crOptions.length - 1].value : "";
	select_cr();
}

function select_cr() {
	let key = document.getElementById("view_char").value;
	let key2 = document.getElementById("cr_list").value;
	if ((key != "") & (key2 != "")) {
		tmpdata = null;
		//TODO：選擇語言
		Language = jp;
		datafill(Database[key][key2]);
	}
}

function update_list() {
	let str_view = '<option id="tmp_char" value="" label="請選擇角色"></option>\n'
	let str_list = ''
	Object.keys(Database).map(key => {
		str_view += '<option value="' + key + '" label="' + key + '"></option>\n'
		str_list += '<option value="' + key + '"></option>\n'
	});
	document.getElementById("view_char").innerHTML = str_view;
	document.getElementById("save_list").innerHTML = str_list;

}

window.addEventListener('beforeunload', function (e) {
	// イベントをキャンセルする
	e.preventDefault();
	// Chrome では returnValue を設定する必要がある
	e.returnValue = '';
});

function datafill(chardata) {
	try {
		isIgnoreMostExpensiveItem = document.getElementById("isIgnoreMostExpensiveItem").checked;
		isIgnoreInitialItem = document.getElementById("isIgnoreInitialItem").checked;
		isShowBasicAction = document.getElementById("isShowBasicAction").checked;
		// JSONデータを出力したいHTML要素を指定
		let keys = ["name", "character_rank", "main_job", "sub_job", "race",
			"max_hitpoint", "effect", "action", "move", "range", "heal_power",
			"physical_attack", "magic_attack", "physical_defense", "magic_defense",
			"str_value", "dex_value", "pow_value", "int_value",
			"abl_motion", "abl_durability", "abl_dismantle", "abl_operate",
			"abl_sense", "abl_negotiate", "abl_knowledge", "abl_analyze",
			"abl_avoid", "abl_resist", "abl_hit"];
		keys.forEach(key => {
			document.getElementById(key).innerHTML = chardata[key];
		});

		document.getElementById("wrapname").innerHTML = chardata["name"];
		document.getElementById("wrapplay").innerHTML = "@" + chardata["player_name"];
		document.getElementById("wraptag").innerHTML = '<li class="skillTag">' + chardata["tags"].join('</li><li class="skillTag">') + '</li>';
		document.getElementById("wrapremark").innerHTML = chardata["remarks"] != null ? chardata["remarks"].replace(/[\r\n|\n]+/g, "<br>") : null;

		keys = ["str_basic_value", "dex_basic_value", "pow_basic_value", "int_basic_value"];
		keys.forEach(key => {
			document.getElementById(key).innerHTML = "(" + ("\u00A0" + chardata[key]).slice(-2) + ")";
		});
		keys = ["hand1", "hand2", "armor", "support_item1", "support_item2", "support_item3", "bag"];
		keys.forEach(key => {
			if (chardata[key]) {
				if (!chardata[key]["alias"]) {
					document.getElementById(key).innerHTML = chardata[key]["name"] + write_item(chardata[key]);
				} else {
					document.getElementById(key).innerHTML = chardata[key]["alias"] + write_item(chardata[key]);
				}
			} else {
				document.getElementById(key).innerHTML = "\u00A0";
			}
		});
		//所持品書き込み
		document.getElementById("items").innerHTML = "<th>持有物</th>";
		var i = 0, emp = 0;
		chardata["items"].forEach(item => {
			if (item) {
				document.getElementById("items").insertAdjacentHTML('beforeend', '<td class="item strings" id="item_' + i + '">' + item["alias"] + write_item(item) + '</td>');
			} else {
				emp++;
			}
			i++;
		});

		var items = GetItems(chardata);
		var use_yen = 0;
		var use_mg = 0;
		items.forEach(item => use_yen += item.price);
		items.forEach(item => use_mg += item.mg);

		document.getElementById("items").insertAdjacentHTML('beforeend', '<td class="strings" id="item_emp">剩餘空欄：' + emp + '\u00A0\u00A0</td>');

		document.getElementById("items").insertAdjacentHTML('beforeend', '<td class="strings" id="item_emp">總計價格：' + use_yen + 'G\u00A0\u00A0</td>');
		document.getElementById("items").insertAdjacentHTML('beforeend', '<td class="strings" id="item_emp">MG：' + use_mg + '\u00A0\u00A0</td>');
		document.getElementById("items_num").setAttribute('span', i + 1);
		//スキル書き込み
		document.getElementById("skill_block").innerHTML = "";
		var i = 0, emp = 0;
		chardata["skills"].forEach(skill => {
			if (skill) {
				let line = '<tr class="skill_tr" id="skill_' + i + '"><td class="strings">' + skill["name"] + write_skill(skill) + '</td> <td class="enum">' + skill["timing"]
					+ '</td> <td class="nump">' + skill["skill_rank"] + '/' + skill["skill_max_rank"] + '</td></tr> '
				document.getElementById("skill_block").insertAdjacentHTML('beforeend', line);
			} else {
				emp++;
			}
			i++;
		});
		if (emp > 0) {
			document.getElementById("skill_block").insertAdjacentHTML('beforeend', '<tr><td>空きスロット:' + emp + '</td></tr>');
		}

		//根據語言動態載入不同的基本動作
		if (isShowBasicAction == true) {
			//暫定顯示
			var dataPath = jpPath;
			var tempBasicActionDict = {};
			if(Language === jp){
				dataPath = jpPath;
				readTranslataionJSON(dataPath, basicActionFileName, "basicActions", jpBasicActionDict);
				tempBasicActionDict = jpBasicActionDict;
			}
			else if(Language === zh){
				dataPath = zhPath;
				readTranslataionJSON(dataPath, basicActionFileName, "basicActions", zhBasicActionDict);
				tempBasicActionDict = zhBasicActionDict;
			}
			//readTranslataionJSON(dataPath, basicActionFileName, "basicActions", testBasicActionDict);
			let i = 0;
			for (let key in tempBasicActionDict) {
				let actioinData = tempBasicActionDict[key];
				if (actioinData != null) {
					let line = '<tr class="skill_tr" id="basicAction_' + i + '"><td class="strings">' + actioinData["name"] + write_skill(actioinData) + '</td> <td class="enum">' + actioinData["timing"]
						+ '</td> <td class="nump">' + actioinData["skill_rank"] + '/' + actioinData["skill_max_rank"] + '</td></tr> '
					document.getElementById("skill_block").insertAdjacentHTML('beforeend', line);
				}
				i++;
			}
		}
		currentData = structuredClone(chardata);
	}
	catch (e) {
		alert("無法讀取角色資料。請確認ID是否有輸入正確，或角色是否允許外部工具存取資料。");
		console.log("[error] - " + e);
	}

}
function write_item(data) {
	let code = '<div class="itemWrap"><div class="skillWrap"><h3 class="skillTitle">' + data["name"] + ' <span class="itemRank">IR ' +
		data["item_rank"] + '</span></h3><ul class="skillTags"><li class="skillType">' + data["type"] + '</li> ';
	data["tags"].forEach(tag => {
		code += '<li class="skillTag">' + tag + '</li>';
	});
	let hit =  data["hit"] === 0 ? '-' : ( data["hit"] > 0 ? '+' + data["hit"]  : data["hit"] )
	let action =  data["action"] === 0 ? '-' : ( data["action"] > 0 ? '+' + data["action"]  : data["action"] )
	switch (data["type"]) {
		case "武器":
			code += '</ul><div class="skillTh2 clear">攻擊力</div><div class="skillTd2">' + data["physical_attack"] + '</div> ' +
				'<div class="skillTh2">魔力</div><div class="skillTd2">' + data["magic_attack"] + '</div>' +
				'<div class="skillTh2 clear">命中</div><div class="skillTd2">' + hit + '</div> ' +
				'<div class="skillTh2">行動</div><div class="skillTd2">' + action + '</div>' +
				'<div class="skillTh2 clear">射程</div><div class="skillTd2">' + data["range"] + '</div> ';
			break;
		case "防具":
		case "盾":
			code += '</ul><div class="skillTh2 clear">物理防御力</div><div class="skillTd2">' + data["physical_defense"] + '</div> ' +
				'<div class="skillTh2">魔法防御力</div><div class="skillTd2">' + data["magic_defense"] + '</div>' +
				'<div class="skillTh2 clear">行動</div><div class="skillTd2">' + action + '</div> ';
			break;
		case "補助":
			code += '</ul><div class="skillTh2 clear">魔力</div><div class="skillTd2" style="width:235px;">' + data["magic_attack"] + '</div>' +
				'</ul><div class="skillTh2 clear">物理防御力</div><div class="skillTd2">' + data["physical_defense"] + '</div> ' +
				'<div class="skillTh2">魔法防御力</div><div class="skillTd2">' + data["magic_defense"] + '</div>' +
				'<div class="skillTh2 clear">行動</div><div class="skillTd2">' + action + '</div> ';
			break;
		case "収納":
			let slot = 0;
			let lim = "";
			let myre = /([0-9]+)/giu;
			let tmp;
			while ((tmp = myre.exec(data["function"])) !== null) {
				slot += parseInt(tmp[0]);
			}
			myre = /(［.*］+)専用の所持品スロットを([0-9]+)/giu;
			while ((tmp = myre.exec(data["function"])) !== null) {
				lim += tmp[1].replace(/[［］]/giu, ' ') + " (" + tmp[2] + ") ";
			}
			if (!lim) lim = "\u00A0";
			code += '</ul><div class="skillTh2 clear">收納限制</div><div class="skillTd2" style="width:235px;">' + lim + '</div>' +
				'</ul><div class="skillTh2 clear">持有物品欄</div><div class="skillTd2">' + slot + '</div> ';
			break;
		default:
			code += '</ul><div class="skillTh2 clear">時機</div><div class="skillTd2" style="width:235px;">' + data["timing"] + '</div> ' +
				'<div class="skillTh2 clear">判定</div><div class="skillTd2" style="width:235px;">' + data["roll"] + '</div>' +
				'<div class="skillTh2 clear">對象</div><div class="skillTd2" style="width:235px;">' + data["target"] + '</div> ' +
				'<div class="skillTh2 clear">射程</div><div class="skillTd2">' + data["range"] + '</div> ';
			break;

	}
	code += '<div class="skillTh2">價格</div><div class="skillTd2">' + data["price"] + '</div>';
	if (data["recipe"]) {
		code += '<p class="skillFunction"><b>配方：</b>' + data["recipe"] + '</p><hr class="skillHr">\n\n';
	}
	code += '<p class="skillFunction"><b>效果・解說：</b>' + data["function"] + '</p>';
	if (data["prefix_function"]) {
		code += '<hr class="skillHr">\n\n<p class="skillFunction"><b>附魔效果：</b>' + data["prefix_function"] + '</p>';
	}
	code += '</div></div>';
	return code;
}

function write_skill(data) {
	let code = '<div class="skillWrap"><h3 class="skillTitle">' + data["name"] + '</h3><ul class="skillTags"><li class="skillType">' + data["type"] + '</li> ';
	data["tags"].forEach(tag => {
		code += '<li class="skillTag">' + tag + '</li>';
	});
	code += '</ul><div class="skillTh">SR</div><div class="skillTd" style="min-width:30px;">' + data["skill_rank"] + '/' + data["skill_max_rank"] + '</div> ' +
		'<div class="skillTh">時機</div><div class="skillTd" style="width:150px;">' + data["timing"] + '</div><br>' +
		'<div class="skillTh clear">判定</div><div class="skillTd" style="width:265px;">' + data["roll"] + '</div><br>' +
		'<div class="skillTh clear">對象</div><div class="skillTd">' + data["target"] + '</div> ' +
		'<div class="skillTh">射程</div><div class="skillTd">' + data["range"] + '</div><br>' +
		'<div class="skillTh clear">代價</div><div class="skillTd">' + data["cost"] + '</div> ' +
		'<div class="skillTh">限制</div><div class="skillTd">' + data["limit"] + '</div>\n\n' +
		'<p class="skillFunction"><b style="font-size:14px;">效果：</b>' + data["function"] + '</p>' +
		'<hr class="skillHr"><p class="skillFunction"><b style="font-size:14px;">解說：</b>' + data["explain"] + '</p></div>';
	return code;
}

class Item {
	constructor(id, price, mg) {
		this.id = id;
		this.price = price;
		this.mg = mg;
	}
}
function GetItems(chardata) {
	var items = GetItemInfos(chardata);
	if (isIgnoreMostExpensiveItem == true) {
		IgnoreMostExpensiveItem(items);
	}
	if (isIgnoreInitialItem == true) {
		IgnoreInitialItem(items);
	}
	return items;
}
function GetItemInfos(chardata) {
	var keys = ["hand1", "hand2", "armor", "support_item1", "support_item2", "support_item3", "bag"];
	var items = [];

	keys.forEach(key => {
		if (chardata[key]) {
			mg = 0;
			chardata[key]["tags"].forEach(tag => {
				let mgTag = /M([0-9]+)/.exec(tag);
				if (mgTag) {
					mg = parseInt(tag[1]);
				}
			});

			items.push(new Item(chardata[key]["id"], chardata[key]["price"], mg));
		}
	})

	var bagItems = chardata["items"];
	bagItems.forEach(item => {
		if (item) {
			mg = 0;
			item["tags"].forEach(tag => {
				let mgTag = /M([0-9]+)/.exec(tag);
				if (mgTag) {
					mg = parseInt(tag[1]);
				}
			});

			items.push(new Item(item["id"], item["price"], mg));
		}

	})
	return items;
}

function IgnoreMostExpensiveItem(items) {
	var index = 0;
	var price = 0;
	for (let i = 0; i < items.length; i++) {
		if (items[i].price > price) {
			index = i;
			price = items[i].price;
		}
	}
	items[index].price = 0;
}

function IgnoreInitialItem(items) {
	var initialItemList = [new Item(703, 50), new Item(801, 10), new Item(2003, 5)];
	initialItemList.forEach(initialItem => {
		for (let i = 0; i < items.length; i++) {
			if (items[i].id == initialItem.id) {
				items[i].price -= initialItem.price;
				break;
			}
		}
	})
}