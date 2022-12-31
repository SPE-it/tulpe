async function writeTLPMessage(tab, color){
	var details = await browser.compose.getComposeDetails(tab.id);
	
	var subject = details.subject;
	var new_subject = getSubjectMessage(color, subject);
	var tlp_message = await getTlpMessage(color);
	console.log(tlp_message);

	if(details.isPlainText){
		var key = "plainTextBody";
		var message = details.plainTextBody;
		var new_message = getBodyTextMessage(color, message, tlp_message);
	} else {
		var key = "body";
		var message = details.body;
		var new_message = getBodyHtmlMessage(color, message, tlp_message);
	}
	
	browser.compose.setComposeDetails(tab.id, {subject: new_subject, [key]: new_message});
	
	var used = color !== "NONE";
	var tabId = tab.id;
	browser.runtime.sendMessage({ tabId,  used});
}

function getSubjectMessage(color, subject){
	var array_subjects = getArraySubjects();
	var message = array_subjects[color];
	var new_subject = subject;
	
	var start = subject.indexOf("[TLP:");
	var end = subject.indexOf("]");
	if(end !== -1){
		end = end+1;
	}
	
	// se start è -1 vuol dire non lo ha trovato
	// se start è 0 significa che lo sto modificando al momento
	// se start è >0 significa è nel messaggio e lo modifico solo se il colore è diverso
	if(start === -1){
		if(color !== "NONE"){
			new_subject = message+" "+subject;
		}
	}else{
		if(start === 0){
			subject = subject.substr(end+1); // includo lo spazio
		}
		if(color !== "NONE" && subject.indexOf(message) === -1){
			subject = message+" "+subject;
		}
		new_subject = subject;
	}
	return new_subject;
}

function getBodyTextMessage(color, message,tlp_message){
	// cerco di capire se è presente un messaggio tulpe 
	// e lo rimuovo solo se a inizio corpo
	var start = message.indexOf(browser.i18n.getMessage("classification_prefix"));
	if(start === 0){
		var end = message.indexOf(";", start);
		// +3 per rimuovere anche ;\n
		message = message.substr(end+3);
	}
	if(color !== "NONE"){
		// aggiungo il ; per capire dove finisce il messaggio
		var new_message = tlp_message+";\n"+message;
	} else {
		var new_message = message;
	}
	return new_message;
}

function getBodyHtmlMessage(color, message,tlp_message){
	var array_colors = getArrayHtmlColors();
	
	// visto che è in HTML per prima cosa faccio il parse
	var temp_doc = new DOMParser().parseFromString(message, "text/html");
	
	// se trovo un messaggio tulpe come primo elemento
	// lo rimuovo, gli altri non li tocco(in caso di reply)
	var firstEl = temp_doc.body.firstElementChild;
	if(firstEl.classList.contains("tulpe-message")){
		firstEl.remove();
	}
	
	if(color !== "NONE"){
		// creo il messaggio all'interno di un paragrafo
		var el = document.createElement("p");
		el.textContent = tlp_message;
		el.style["color"] = array_colors[color];
		el.style["background"] = "#000000";
		el.style["font-weight"] = "bold";
		el.className = "tulpe-message";
		
		temp_doc.body.insertBefore(el, temp_doc.body.firstChild);
	}
	
	// ritrasformo il documento ad HTML per mandarlo all'editor
    var html = new XMLSerializer().serializeToString(temp_doc);
	
	return html;
}

function getArraySubjects(){
	var array_subjects = {
		"RED"   : "[TLP:RED]",
		"AMBER" : "[TLP:AMBER]",
		"GREEN" : "[TLP:GREEN]",
		"CLEAR" : "[TLP:CLEAR]",
	};
	return array_subjects;
}
async function getTlpMessage(color){
	var storage_key = getStorageKey(color);
	console.log(storage_key);
	var message = await browser.storage.local.get().then((res) => {
		return res[storage_key];
	});
	var tlp_message = browser.i18n.getMessage("classification_prefix") + color + " - " + message;
	return tlp_message;
}

function getStorageKey(color){
	var array_keys = {
		"RED"  : "tlp_red_message",
		"AMBER": "tlp_amber_message",
		"GREEN": "tlp_green_message",
		"CLEAR": "tlp_white_message"
	};
	
	return array_keys[color];
}

function getArrayHtmlColors() {
	/* Colors as defined in TLP 2.0 https://www.first.org/tlp/ */
	var array_colors = {
		"RED"  : "#FF2B2B",
		"AMBER": "#FFC000",
		"GREEN": "#33FF00",
		"CLEAR": "#FFFFFF"
	};
	
	return array_colors;
}