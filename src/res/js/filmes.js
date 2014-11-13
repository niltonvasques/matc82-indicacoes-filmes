var movies_data = "res/data/movies.html";
var database = null;

function listaFilmes(){
	var anoField 		= "Ano: " + $('#ano').val();
	var categoriaField 	= $( '#categoria' ).val();
	var atoresField 	= $( '#atores' ).val().split(",");
	var informacoesField 	= $( '#informacoes' ).val().split(" ");

	if(database == null){
		show_popup( 'progress' );
		setTimeout(function(){load_database();}, 1000);
	}else{
		show_popup( 'wait' );
	        document.getElementById("resultados-header").innerHTML = "<th>CAPA</th><th>DESCRIÇÃO</th>";
		$( '#resultados-body' ).empty();
	
		var movies_choosed = 0;	
/*
*		Varrendo toda a lista de filmes, através do parser do html.
*/
		setTimeout( function() {
			$('div', database).each( 
				function( index, element ){
					if(movies_choosed > 2) return;

					var id 	= element.id;	
					var sinopse = $( '.sinopsis', element ).first().text();
					var elementAno = $( 'p', element ).first().text();
					var nome = $( 'h2', element ).text();
					var img = $( 'img', element ).get(0);

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
					* 	Necessário criar a lógica para filtragem melhor dos filmes.
					* 	Permitindo campos vazios e adição de aleatóriedade.
					*/				
					if( 	elementAno.contains( anoField ) && 
						filter_categories( categoriaField, categorias ) &&
						filter_actors( atoresField, atores ) > 0 &&
						sinopse.contains( informacoesField ) 
					){
						console.log(elementAno + " == "+ anoField );
						var row = create_result_row( img, nome, elementAno, sinopse, ulCategorias.get(0), ulAtores.get(0) );
						$( '#resultados-body' ).append( row );
						movies_choosed ++;
					}
				}
			);
			hide_popup( 'wait' );
		}, 500 );
	}
}

function create_result_row( img, titulo, ano, sinopse, categorias, atores  ){
	var row = "<tr class='result_row'> <td class='col-md-1'>"+img.outerHTML+"</td>"+
			"<td class='col-md-8'>" +
				"<h2> "+titulo+" </h2>"+
				"<p > "+ano+" </p>"+
				"<p> "+sinopse+" </p>"+
				"<h3 > Categorias </h3>"+
				"<p> "+categorias.outerHTML+" </p>"+
				"<h3 > Atores </h3>"+
				"<p> "+atores.outerHTML+" </p>"+
				"<p> <button id='trailer' class='btn' onclick='watch_trailer(\""+titulo+"\")' >Assistir Trailer</button> </p>"+
			"</td> "+
		  "</tr>";
	return row; 
} 

function watch_trailer(titulo){
	search_youtube_trailer( titulo, function( filme_id ){
			var content = $('#popup-div');
			content.empty( );
			content.append( "<iframe class='youtube' width='640' height='385' align='middle' "+
						 "src='http://www.youtube.com/embed/"+filme_id+"' frameborder='1' type='text/html'></iframe>" );
			show_popup( 'popup' );
		}
	 );
//	$('popup-content').append('<div> Assistindo Trailer </div>');
//	show_popup( 'popup-content' );
// 	alert( "Assistindo trailer: "+titulo );
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
		setTimeout( function(){ hide_popup( 'progress' ); }, 2000 );
	});
	request.fail(function( jqXHR, textStatus ) {
		alert( "Request failed: " + textStatus );
		hide_popup( 'progress' );
		setTimeout( function(){ hide_popup( 'progress' ); }, 2000 );
	});

}


function fillCors(xhr, funcaoCallback, errorCallback){
  	xhr.onload = funcaoCallback;
	xhr.onerror = errorCallback;
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
}


function search_youtube_trailer( titulo, callback ){
	var nomeFilme= encodeURIComponent( titulo );
	// chamada na Youtube API 

	var yt_url='http://gdata.youtube.com/feeds/api/videos?q='+nomeFilme+'+trailer&format=5&max-results=1&v=2&alt=jsonc';
	var request = $.ajax({
		url: yt_url,
		type: "GET",
		dataType: "jsonp",
	});
	request.done(function( response ) {
		$.each(response.data.items, function(i,data){
			var filme_id=data.id;
			var filme_title=data.title;
			console.log( "Trailer "+nomeFilme+"filme_id" );
	//		var filmeDiv = $('#'+div_id).get(0);
			callback( filme_id );
	//		filmeDiv.innerHTML += "<iframe width='210' height='90' src='http://www.youtube.com/embed/"+filme_id+"' frameborder='1' type='text/html'></iframe>";
		});
	});
	request.fail(function( jqXHR, textStatus ) {
		console.log( "Youtube search trailler error "+textStatus );
	});

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


function show_popup( popup_id ){

	var el = document.getElementById( popup_id + "-overlay" );
	el.style.display = 'block';

	el = document.getElementById( popup_id + "-content" );
	el.style.display = 'block';

}


function hide_popup( popup_id ){

	var el = document.getElementById( popup_id + "-overlay" );
	el.style.display = 'none';

	el = document.getElementById( popup_id + "-content" );
	el.style.display = 'none';


}
