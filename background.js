let promiseMap = new Map();
let usedTLP = [];
let idMap = {};

browser.compose.onBeforeSend.addListener(async function(tab, details){
	let pos = usedTLP.indexOf(tab.id);
	const res = await browser.storage.local.get();
	if (pos >= 0 || res.dont_ask) {
		usedTLP = usedTLP.filter(t => t !== tab.id);
		return {cancel: false};
	}
	var window_details = {
		allowScriptsToClose: false,
		type: "panel",
		url: browser.extension.getURL("confirm_popup.html?id="+tab.id),
		width: 450,
		height: 200
	};
	
	var wnd = await browser.windows.create(window_details);
	idMap[wnd.id] = tab.id;
	
	return new Promise(function(resolve){
		promiseMap.set(tab.id, resolve);
	});
});

browser.windows.onRemoved.addListener(async function(windowId){
	var tabId = null;
	// deve entrare per forza in questo if
	if(idMap.hasOwnProperty(windowId)){
		tabId = idMap[windowId];
		delete idMap[windowId];
	}
	
	let resolve = promiseMap.get(tabId);
	if(resolve){
		resolve({ cancel: true });
	}
})

browser.runtime.onMessage.addListener(function(message){
	if(message.hasOwnProperty("used")){
		usedTLP.push(message.tabId);
	} else {
		let resolve = promiseMap.get(message.tabId);
		if (!resolve) {
			// non dovrebbe essere possibile entrare qua
			return;
		}
		resolve({ cancel: message.cancel });
	}
});

async function SetDefaultMessages(){
	var res = await browser.storage.local.get();
	if(typeof(res.tlp_red_message) === "undefined"){
		browser.storage.local.set({
			tlp_red_message:  "personal for named recipients only",
			tlp_amber_message:  "Organisation: - limited distribution",
			tlp_green_message:  "community wide",
			tlp_white_message:  "unlimited, subject to copyright rules",
		});
	}
}
SetDefaultMessages();