console.log('transaction script loaded');
var bololo;

init.transaction = function(cb){
	bololo = 600;

	$('#page-content').on('click', '#testplus2', function(){
		bololo += 1;
		$('#test2').val(bololo);
	});
	$('#page-content').on('click', '#testminus2', function(){
		bololo -= 1;
		$('#test2').val(bololo);
	});

    cb({success:true});
}

populate.transaction = function(){
	
	$('#datepicker').datepicker({
        keyboardNavigation: false,
        forceParse: false,
        autoclose: true
    });

    $("#select-holder").select2({
        placeholder: "Select Holder",
        allowClear: true
    });

    $("#select-merchant").select2({
        placeholder: "Select Merchant",
        allowClear: true
    });

    $('#trans-list-table').dataTable();
}