window.addEventListener("load", function(){
	getDefaultValues();
	document.getElementById("scarta").addEventListener('click',function(){scartaModifiche()});
	document.getElementById("salva").addEventListener('click',function(){salvaModifiche()});
});
async function getDefaultValues(){
	var getValues = browser.storage.local.get().then((res) => {
		document.getElementById("input-tlp-red").value = res.tlp_red_message;
		document.getElementById("input-tlp-amber").value = res.tlp_amber_message;
		document.getElementById("input-tlp-green").value = res.tlp_green_message;
		document.getElementById("input-tlp-white").value = res.tlp_white_message;
	});
}

function scartaModifiche(){
	getDefaultValues();
}

async function salvaModifiche(){
	await browser.storage.local.set({
		tlp_red_message:  document.getElementById("input-tlp-red").value,
		tlp_amber_message:  document.getElementById("input-tlp-amber").value,
		tlp_green_message:  document.getElementById("input-tlp-green").value,
		tlp_white_message:  document.getElementById("input-tlp-white").value,
	});
	document.getElementById("conferma").classList = "hide fade-in";
	setTimeout(function(){
		document.getElementById("conferma").classList = "hide fade-out";
		setTimeout(function(){
			document.getElementById("conferma").classList = "hide";
		}, 1500);
	}, 3000);
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