var movies_data = "res/data/movies.html";
var isLocalHost = true;
function listaFilmes(){
	var data;
	var request = $.ajax({
		url: movies_data,
		type: "GET",
		dataType: "html"
	});
	request.done(function( msg ) {
		console.log("finished" );
		data = msg;
//		var movie = $("#1", $(msg));
//		var movies = document.createElement( "div" );
		var movies = $('<div></div>');
		movies.html(msg);
		var divs = $('div[id="3"]', movies);
//		movies.innerHTML = msg;
//		var m = movies.getElementsByTagName("movie");
		document.getElementById("resultados-body").innerHTML = divs.html();

	});
	request.fail(function( jqXHR, textStatus ) {
		alert( "Request failed: " + textStatus );
	});

	document.getElementById("resultados-header").innerHTML = "<th>NOME</th><th>DESCRIÇÃO</th>";
}


function fillCors(xhr, funcaoCallback, errorCallback){
  	xhr.onload = funcaoCallback;
	xhr.onerror = errorCallback;
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
}


function createCORSRequest(method, url) {
	return createCORSRequest(method, url, true);
}

function createCORSRequest(method, url, async) {
//	if (isLocalHost){
//		if (typeof(netscape) != 'undefined' && typeof(netscape.security) != 'undefined'){
//			netscape.security.PrivilegeManager.enablePrivilege('UniversalBrowserRead');
//		}
//	}
	var xhr = new XMLHttpRequest();
	if ("withCredentials" in xhr) {
	// XHR for Chrome/Firefox/Opera/Safari.
	xhr.open(method, url, true);
	} else if (typeof XDomainRequest != "undefined") {
	// XDomainRequest for IE.
	xhr = new XDomainRequest();
	xhr.open(method, url);
	} else {
	// CORS not supported.
	xhr = null;
	}
	return xhr;
}
