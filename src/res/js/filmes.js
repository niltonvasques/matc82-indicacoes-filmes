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
	
		var movies_matched = [];
/*
*		Varrendo toda a lista de filmes, através do parser do html.
*/
		setTimeout( function() {
			$('div', database).each( 
				function( index, element ){
					var movie = new Object();

					movie.id 	= element.id;	
					movie.sinopse = $( '.sinopsis', element ).first().text();
					movie.elementAno = $( 'p', element ).first().text();
					movie.nome = $( 'h2', element ).text();
					movie.img = $( 'img', element ).get(0);

					movie.ulCategorias = $( '.categories', element );
					movie.categorias = [];
					$( 'li', movie.ulCategorias).each( function( cIndex, cElement ){
						movie.categorias.push( cElement.textContent );
					});
		
					movie.ulAtores = $( '.actors', element );
					movie.atores = [];
					$( 'li', movie.ulAtores).each( function( aIndex, aElement ){
						movie.atores.push( aElement.textContent.toUpperCase() );
					});

					/*
					* 	Necessário criar a lógica para filtragem melhor dos filmes.
					* 	Permitindo campos vazios e adição de aleatóriedade.
					*/				
					if( 	movie.elementAno.contains( anoField ) && 
						filter_categories( categoriaField, movie.categorias ) &&
						filter_actors( atoresField, movie.atores ) > 0 &&
						movie.sinopse.contains( informacoesField ) 
					){
						console.log(movie.elementAno + " == "+ anoField );
						movie.row = create_result_row( movie.img, movie.nome, movie.elementAno, movie.sinopse, movie.ulCategorias.get(0), movie.ulAtores.get(0) );
						movies_matched.push( movie );	
					}
				}
			);
		 	if( movies_matched.length > 0 ){
				var random = randomFromInterval( 0, movies_matched.length-1 ) | 0;
				$( '#resultados-body' ).append( movies_matched[ random ].row );
					
				search_youtube_trailer( movies_matched[ random ].nome, function( filme_id ){
						var content = $('#trailer');
						content.empty( );
						content.append( "<iframe class='youtube' width='640' height='385' align='middle' "+
									 "src='http://www.youtube.com/embed/"+filme_id+"' frameborder='1' type='text/html'></iframe>" );
						show_popup( 'popup' );
					}
				 );
			}else{
				$( '#resultados-header' ).empty();
				show_popup( 'message' );
			}	
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
				"<table>"+
					"<tr>"+
					"<td>"+
					"<h3 > Atores </h3>"+
					"<p> "+atores.outerHTML+" </p>"+
					"</td>"+
					"<td id='trailer'>"+
					"</td>"+
					"</tr>"+
				"</table>"+
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


function randomFromInterval(max, min){
         return (Math.random()*(max-min)+min);
}
