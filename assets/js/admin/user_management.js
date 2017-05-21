console.log('user_management script loaded');

init.user_management = function(){
	cb({success:true});
}

populate.user_management = function(){
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