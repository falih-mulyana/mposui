console.log('dashboard script loaded');
var balala;

init.dashboard = function(){
	balala = 500;

	$('#page-content').on('click', '#testplus1', function(){
		balala += 1;
		$('#test1').val(balala);
	});
	$('#page-content').on('click', '#testminus1', function(){
		balala -= 1;
		$('#test1').val(balala);
	});
}

populate.dashboard = function(){
	$('#test1').val(balala);
}