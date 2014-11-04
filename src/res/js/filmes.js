var movies_data = "res/data/movies.html";
var database = null;

function listaFilmes(){
	var anoField 		= "Ano: " + $('#ano').val();
	var categoriaField 	= $( '#categoria' ).val();
	var atoresField 	= $( '#atores' ).val();
	var informacoesField 	= $( '#informacoes' ).val();

	if(database == null){
		progress.showPleaseWait();
		setTimeout(function(){load_database();}, 1000);
	}else{
	        document.getElementById("resultados-header").innerHTML = "<th>NOME</th><th>DESCRIÇÃO</th>";
		$( '#resultados-body' ).empty();
		var divs = $('div', database);
		divs.each( function( index, element ){
				var elementAno = $( 'p', element ).first().text();
				var nome = $( 'h2', element ).text();
				var img = $( 'img', element ).first();

				var ulCategorias = $( '.categories', element );
				var categorias = [];
				$( 'li', ulCategorias).each( function( cIndex, cElement ){
					categorias.push( cElement.textContent );
				});
	
				var ulAtores = $( '.actors', element );
				var atores = [];
				$( 'li', ulAtores).each( function( aIndex, aElement ){
					atores.push( aElement.textContent );
				});

				if( elementAno.contains( anoField ) && 
					$.inArray(categoriaField, categorias) != -1){
					console.log(elementAno + " == "+ anoField );
					$( '#resultados-body' ).append( element.outerHTML );
				}
			}
		);
	}
}

function load_database(){
	var request = $.ajax({
		url: movies_data,
		type: "GET",
		dataType: "html",
	});
	request.done(function( msg ) {
		console.log("finished" );
		database = $('<div></div>');
		database.html(msg);
		progress.hidePleaseWait();
	});
	request.fail(function( jqXHR, textStatus ) {
		alert( "Request failed: " + textStatus );
		progress.hidePleaseWait();
	});

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
