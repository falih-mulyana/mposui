console.log('menus_and_items script loaded');

init.menus_and_items = function(cb){
	cb({success:true});
}

populate.menus_and_items = function(){
	$('#user-list-table').DataTable({
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

    $("#select-holder").select2({
        placeholder: "Select Holder",
        allowClear: true
    });

    $("#select-merchant").select2({
        placeholder: "Select Merchant",
        allowClear: true
    });
}