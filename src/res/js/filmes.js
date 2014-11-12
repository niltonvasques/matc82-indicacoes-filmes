var movies_data = "res/data/movies.html";
var database = null;

function listaFilmes(){
	var anoField 		= "Ano: " + $('#ano').val();
	var categoriaField 	= $( '#categoria' ).val();
	var atoresField 	= $( '#atores' ).val().split(",");
	var informacoesField 	= $( '#informacoes' ).val().split(" ");

	if(database == null){
		progress.showPleaseWait();
		setTimeout(function(){load_database();}, 1000);
	}else{
	        document.getElementById("resultados-header").innerHTML = "<th>NOME</th><th>DESCRIÇÃO</th>";
		$( '#resultados-body' ).empty();
		
/*
*		Varrendo toda a lista de filmes, através do parser do html.
*/
		$('div', database).each( 
			function( index, element ){
				
				var sinopse = $( '.sinopsis', element ).first().text();
				var elementAno = $( 'p', element ).first().text();
				var nome = $( 'h2', element ).text();
				var img = $( 'img', element ).first();
				var trailer = trailerYoutube(nome);

				var ulCategorias = $( '.categories', element );
				var categorias = [];
				$( 'li', ulCategorias).each( function( cIndex, cElement ){
					categorias.push( cElement.textContent );
				});
	
				var ulAtores = $( '.actors', element );
				var atores = [];
				$( 'li', ulAtores).each( function( aIndex, aElement ){
					atores.push( aElement.textContent.toUpperCase() );
				});
/*
*				Necessário criar a lógica para filtragem melhor dos filmes.
*				Permitindo campos vazios e adição de aleatóriedade.
*/				
				if( 	elementAno.contains( anoField ) && 
					filter_categories( categoriaField, categorias ) &&
					filter_actors( atoresField, atores ) > 0 &&
					sinopse.contains( informacoesField ) 
				){
					console.log(elementAno + " == "+ anoField );
					$( '#resultados-body' ).append( element.outerHTML );
				}
			}
		);
	}
}

function filter_actors( actors, movieActors ){
	if( actors.length == 1 && actors[0] == "" ) return 1;

	var count = 0;
	$.each( actors, function ( index, value ){
		$.each( movieActors, function( mIndex, mValue ){
			if( mValue.toUpperCase().trim().contains( value.toUpperCase().trim() ) ) count++;
		});
	});
	return count;
}

function filter_categories( categoriaField, categorias ){
	if( categoriaField == "Todas" ) return true;
	return $.inArray( categoriaField, categorias ) != -1;
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


function trailerYoutube(nome){


var nome = $(this).val();
var nomeFilme= encodeURIComponent(nome);
// chamada na Youtube API 

var yt_url='http://gdata.youtube.com/feeds/api/videos?q='+nomeFilme+'+trailer&format=5&max-results=1&v=2&alt=jsonc';

/* $.ajax
({
type: "GET",
url: yt_url,
dataType:"jsonp",
success: function(response)
{*/

$.each(response.data.items, function(i,data)
{
var filme_id=data.id;
var filme_title=data.title;

return filme_frame="<span <iframe width='210' height='90' src='http://www.youtube.com/embed/"+filme_id+"' frameborder='1' type='text/html'></iframe> >";

});
}
//});
//}

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
