console.log('transaction script loaded');
var bololo;

init.transaction = function(){
	bololo = 600;

	$('#page-content').on('click', '#testplus2', function(){
		bololo += 1;
		$('#test2').val(bololo);
	});
	$('#page-content').on('click', '#testminus2', function(){
		bololo -= 1;
		$('#test2').val(bololo);
	});
}

populate.transaction = function(){
	$('#test2').val(bololo);
}