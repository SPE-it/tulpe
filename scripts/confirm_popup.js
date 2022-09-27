window.addEventListener("load", function(){
	setBadgeTitle();
	document.getElementById("badge-red").addEventListener('click',function(){sendMessage("RED")});
	document.getElementById("badge-amber").addEventListener('click',function(){sendMessage("AMBER")});
	document.getElementById("badge-green").addEventListener('click',function(){sendMessage("GREEN")});
	document.getElementById("badge-white").addEventListener('click',function(){sendMessage("WHITE")});
	document.getElementById("badge-none").addEventListener('click',function(){sendMessage("NONE")});
});

async function setBadgeTitle(){
	var getValues = await browser.storage.local.get().then((res) => {
		document.getElementById("legend-red").innerText = res.tlp_red_message;
		document.getElementById("legend-amber").innerText = res.tlp_amber_message;
		document.getElementById("legend-green").innerText = res.tlp_green_message;
		document.getElementById("legend-white").innerText = res.tlp_white_message;
	});
}

async function sendMessage(color) {
	var get_param = window.location.search.substr(1);
	var start = get_param.indexOf("=");
	var tabId = parseInt(get_param.substr(start+1));
	var tab = await browser.tabs.get(tabId);
	// await è necessario altrimenti used rimane a true perchè si esegue dopo
	await writeTLPMessage(tab, color);
	// risetto used a false altrimenti quando scrivo la prossima mail
	// sarà inizializzato a true e manderà la mail senza tlp
	var used = false;
	browser.runtime.sendMessage({ tabId,  used});
	
	browser.runtime.sendMessage({ tabId, cancel:false });
	
	let tabs2 = await browser.tabs.query({ active: true, currentWindow: true });
	let windowId = tabs2[0].windowId;

	setTimeout(function(){
		browser.windows.remove(windowId);
	}, 400);
}