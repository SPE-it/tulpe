async function getComposeTab(){
	var tabs = await browser.tabs.query({active: true, windowId: browser.windows.WINDOW_ID_CURRENT});
	var tab = await browser.tabs.get(tabs[0].id);
	return tab;
}

window.addEventListener("load", async function(){
	var tab = await getComposeTab();
	document.getElementById("badge-red").addEventListener('click',function(){writeTLPMessage(tab, "RED")});
	document.getElementById("badge-amber").addEventListener('click',function(){writeTLPMessage(tab, "AMBER")});
	document.getElementById("badge-green").addEventListener('click',function(){writeTLPMessage(tab, "GREEN")});
	document.getElementById("badge-white").addEventListener('click',function(){writeTLPMessage(tab, "WHITE")});
	document.getElementById("badge-none").addEventListener('click',function(){writeTLPMessage(tab, "NONE")});
});
