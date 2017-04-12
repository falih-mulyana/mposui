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

	$('#device-list-table').DataTable({
        pageLength: 25,
        responsive: true,
        dom: '<"html5buttons"B>lTfgitp',
        buttons: [
            { extend: 'copy'},
            {extend: 'csv'},
            {extend: 'excel', title: 'ExampleFile'},
            {extend: 'pdf', title: 'ExampleFile'},

            {extend: 'print',
             customize: function (win){
                    $(win.document.body).addClass('white-bg');
                    $(win.document.body).css('font-size', '10px');

                    $(win.document.body).find('table')
                            .addClass('compact')
                            .css('font-size', 'inherit');
            }
            }
        ]
    });

    /*$("#select-holder").select2({
        placeholder: "Select Holder",
        allowClear: true
    });

    $("#select-merchant").select2({
        placeholder: "Select Merchant",
        allowClear: true
    });*/
}