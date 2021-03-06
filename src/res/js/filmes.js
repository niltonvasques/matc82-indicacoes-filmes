/*

Universidade Federal da Bahia
Disciplina: Sistemas Web - MATC82
Prof. Leandro Andrade
Semestre: 2014.2

Trabalho Prático 1

Autores: Nilton Vasques Carvalho e Vinícius Lins Gesteira

*/
var movies_data = "res/data/movies.html";
var database = null;
var movies_matched = [];

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
		
		$( '#resultados-grid' ).empty();
		
		movies_matched = [];
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

					movie.ano = movie.elementAno.split(" ")[1];

					movie.ulCategorias = $( '.categories', element );
					movie.categorias = [];
					$( 'li', movie.ulCategorias).each( function( cIndex, cElement ){
						movie.categorias.push( cElement.textContent );
					});
		
					movie.ulAtores = $( '.actors', element );
					movie.atores = [];
					$( 'li', movie.ulAtores).each( function( aIndex, aElement ){
						movie.atores.push( aElement.textContent );
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
						movie.row = create_result_row( movie );
						movies_matched.push( movie );	
					}
				}
			);
		 		
			sort_movie();
			show_after_search_panel();
			hide_popup( 'wait' );
		}, 500 );
	}
}

function show_after_search_panel(){
	$( '#after-search-panel' ).get(0).style = "display: block;";
	$( '#search' ).get(0).style = "display: none;";
}

function hide_after_search_panel(){
	$( '#after-search-panel' ).get(0).style = "display: none;";
	$( '#search' ).get(0).style = "display: block;";
	$( '#resultados-grid' ).empty();
}


function sort_movie(){
	$( '#resultados-grid' ).empty();
	if( movies_matched.length > 0 ){
		var random = randomFromInterval( 0, movies_matched.length-1 ) | 0;
		$( '#resultados-grid' ).append( movies_matched[ random ].row );
		search_youtube_trailer( movies_matched[ random ].nome, function( filme_id ){
				var content = $('#trailer');
				content.empty( );
				content.append( "<iframe class='youtube' width='640' height='385' align='middle' "+
							 "src='http://www.youtube.com/embed/"+filme_id+"' frameborder='1' type='text/html'></iframe>" );
			}
		 );

		movies_matched.splice( random, 1 );	
	}else{
		$( '#resultados-grid' ).empty();
		show_popup( 'message' );
	}
}

function create_result_row( movie ){
	
	if( !movie.img.src.contains("movies_images") ){
		movie.img.src = "res/images/movie.png" ;
	}
	movie.img.style  = "width: 100%;";
	var atores = "";
	for( var i = 0; i < movie.atores.length; i++ ){
		atores += movie.atores[i];
		if( i < movie.atores.length - 1 ) atores += ", ";
	}
	var categorias = "";
	for( var i = 0; i < movie.categorias.length; i++ ){
		categorias += movie.categorias[i];
		if( i < movie.categorias.length - 1 ) categorias += ", ";
	}
	var atoresTitle = ( movie.atores.length > 1 ? "Atores:" : "Ator:" );
	var categoriasTitle = ( movie.categorias.length > 1 ? "Categorias:" : "Categoria:" );
	var row = "<div class='row'>"+
			"<div class='col-1'>"+movie.img.outerHTML+"</div>"+
			"<div class='col-5'>" +
				"<h2> "+movie.nome+" ("+movie.ano+")</h2>"+
				"<div style='margin-top: 10px;'><b>Sinopse: </b>"+movie.sinopse+" </div>"+
				"<div style='margin-top: 10px;'> <b>"+categoriasTitle+" </b> "+categorias+"</div>"+
				"<div style='margin-top: 10px;'> <b>"+atoresTitle+" </b> "+atores+"</div>"+
				"<div id='trailer' style='margin-top: 10px;'><div>"+
			"</div> "+
		  "</div>";
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

