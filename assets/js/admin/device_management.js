console.log('device management script loaded');
var bululu;

init.device_management = function(){
	bululu = 700;

	$('#page-content').on('click', '#testplus3', function(){
		bululu += 1;
		$('#test3').val(bululu);
	});
	$('#page-content').on('click', '#testminus3', function(){
		bululu -= 1;
		$('#test3').val(bululu);
	});
}

populate.device_management = function(){
	$('#test3').val(bululu);
}