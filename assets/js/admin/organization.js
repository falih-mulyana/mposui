///// TO DO:
// 1: populate form with existing object
// 2: implement update record function
// 3: implement delete record function
// 4: implement search record function


console.log('user_management script loaded');

var setNewOrgBtn = function(_state, _orgObj){
    localData.newOrgBtn = _state;
    if(_state){
        $('#org-form-title').html('Create New Organization / Holder');
        $('#new-org-btn strong').html('Register');
        window.geolocationObj = {};

    } else {
        if(typeof _name === "undefined"){
            setNewOrgBtn(true);
        } else {
            $('#org-form-title').html('Editing ' + _orgObj.name);
            //TODO: 1
        }
        $('#new-org-btn strong').html('Update');
    }
    $('#new-org-btn').removeAttr('disabled');
}

var refreshTableData = function(){
    //disable any elements that may invoke server request
    $('#org-table-server-refresh').attr('disabled', 'disabled');
    $('#org-table-server-refresh').html('<span class="glyphicon glyphicon-refresh"></span> Reloading...');
    $('#org-table-server-pagesize').attr('disabled', 'disabled');
    $('#org-table-server-filter').attr('disabled', 'disabled');
    $('#org-table-server-filter').attr('disabled', 'disabled');
    $('#org-table-server-previous').attr('disabled', 'disabled');
    $('#org-table-server-next').attr('disabled', 'disabled');

    loadOrg(function(error, data){
        if(!error){
            // re-enable the elements
            $('#org-table-server-refresh').removeAttr('disabled');
            $('#org-table-server-refresh').html('<span class="glyphicon glyphicon-refresh"></span> Refresh Data');
            $('#org-table-server-pagesize').removeAttr('disabled');
            $('#org-table-server-filter').removeAttr('disabled');
            $('#org-table-server-filter').removeAttr('disabled');
            $('#org-table-server-previous').removeAttr('disabled');
            $('#org-table-server-next').removeAttr('disabled');

            configTableHolder();
        } else {
            var msg = "Sorry but there was an error: ";
            toastr.options = {
                closeButton: true,
                progressBar: true,
                showMethod: 'slideDown',
                timeOut: 4000
            };
            toastr.error(status.responseJSON.trace, msg);
        }
    });

    //$('#org-list-table_info').html('Showing '+ localData.org.property.paging.page +' to '+ (localData.org.property.total < localData.org.property.paging.limit? localData.org.property.total:localData.org.property.paging.limit) +' of <strong>'+ localData.org.property.total +'</strong> entries');
}

var configSelectHolderType = function(){

    for(i=0; i<localData.orgType.data.length; i++){
        var el = '<option value="'+localData.orgType.data[i]._id+'">'+localData.orgType.data[i].name+'</option>';
        $('#select-holder-type').append(el);
    }

    $("#select-holder-type").select2({
        placeholder: "Select Holder",
        allowClear: true
    });
}

var configTableHolder = function(){

    var table = $('#org-list-table');
    // check if datatable is initialized
    if(!table.hasClass('initialized')){
        table.not('.initialized').addClass('initialized').DataTable({
            pageLength: 50,
            lengthMenu: [[10, 25, 50], [10, 25, 50]],
            responsive: true,
            dom: '<"html5buttons"B>lTfgitp',
            buttons: [
                { extend: 'copy'},
                { extend: 'csv'},
                { extend: 'excel', title: 'ExampleFile'},
                { extend: 'pdf', title: 'ExampleFile'},

                {
                    extend: 'print',
                    customize: function (win){
                        $(win.document.body).addClass('white-bg');
                        $(win.document.body).css('font-size', '10px');

                        $(win.document.body).find('table')
                                .addClass('compact')
                                .css('font-size', 'inherit');
                    }
                }
            ],
            "initComplete": function(settings, json) {

                console.log('datatable initiated');
                // because technical differences between the way DataTables fetch data from server and how our server handle requests,
                // we have to custom some of the component to fit our protocol. This is client side Datatables, but technically we
                // handle pagination and filters from server.

                // hide the DataTable original pagesize selection
                $("[name='org-list-table_length']").addClass('hidden');
                // make our own that identical to it
                $("[name='org-list-table_length']").after('<select id="org-table-server-pagesize" class="form-control input-sm"><option value="10">10</option><option value="25">25</option><option value="50">50</option></select>');
                // trigger the selection base on pageSize global variable
                $("#org-table-server-pagesize").val(localData.org.property.paging.limit).trigger('change');
                // add manual refresh button
                $("#org-table-server-pagesize").parent().after('<a id="org-table-server-refresh" style="margin: 0 0 0 20px;" class="btn btn-info"><span class="glyphicon glyphicon-refresh"></span> Refresh Data</a>');
                // config the change event on the element
                $("#org-table-server-pagesize").on('change', function(){
                    localData.org.property.paging.limit = parseInt($(this).val());
                    localData.org.property.paging.page = 1;
                    console.log(localData.org.property.paging.limit);
                    refreshTableData();
                });

                $('#org-table-server-refresh').on('click', function(){
                    refreshTableData();
                });

                $('#org-list-table_filter input[type="search"]').addClass('hidden');
                $('#org-list-table_filter input[type="search"]').after('<input class="form-control" id="org-table-server-filter" type="text">');
                $('#org-table-server-filter').val(localData.filter);
                $('#org-table-server-filter').on('keypress', function(e){
                    if(e.which == 13) {
                        localData.org.searchparam = $('#org-table-server-filter').val();
                        console.log(localData.org.searchparam);
                        refreshTableData();
                    }
                });

            }
        });
    }

    // clear previous rows
    table.DataTable().clear();

    // populate ze rows
    for(i=0; i<localData.org.data.length; i++){
        var type = 'undefined';
        var tax = localData.org.data[i].taxes == true? 'yes':'no';
        var phone = '-';
        var email = '-';
        var address = '-';
        var npwp = '-';
        if(localData.org.data[i].hasOwnProperty('phone')){
            phone = localData.org.data[i].phone.value;
        }
        if(localData.org.data[i].hasOwnProperty('email')){
            email = localData.org.data[i].email.value;
        }
        if(localData.org.data[i].hasOwnProperty('location')){
            if(localData.org.data[i].location.hasOwnProperty('address')){
                address = localData.org.data[i].location.address;
            }
        }
        if(localData.org.data[i].hasOwnProperty('npwp')){
            npwp = localData.org.data[i].npwp;
        }
        
        for(j=0; j<localData.orgType.data.length; j++){
            if(localData.orgType.data[j]._id == localData.org.data[i].orgType._id){
                type = localData.orgType.data[j].name;
            }
        }
        var additional_el = '<a class="btn btn-primary btn-org-edit" orgid="'+localData.org.data[i]._id+'"><span class="glyphicon glyphicon-pencil"></span></a><a class="btn btn-danger btn-org-delete" orgid="'+localData.org.data[i]._id+'"><span class="glyphicon glyphicon-remove-circle"></span></a>';

        table.DataTable().row.add([localData.org.data[i].name, email, type, address, tax, npwp, phone, additional_el]);
    }

    

    // redraw ze rows
    table.DataTable().draw();

    $('#org-list-table_wrapper .pagination').addClass('hidden');
    $('#org-list-table_wrapper .pagination').after('<ul class="pagination"><li class="paginate_button previous"><button id="org-table-server-previous" class="btn btn-default">Previous</button></li><li class="paginate_button next"><button id="org-table-server-next" class="btn btn-default">Next</button></li></ul>');
    
    $('#org-table-server-previous').on('click', function(){
        if(localData.org.property.paging.page > 1){
            localData.org.property.paging.page = localData.org.property.paging.page-1;
            refreshTableData();
        }
    })
    $('#org-table-server-next').on('click', function(){
        if(localData.org.property.total > localData.org.property.paging.limit*localData.org.property.paging.page){
            localData.org.property.paging.page = localData.org.property.paging.page+1;
            refreshTableData();
        }
    });
    $('#org-list-table_info').html('Showing '+ ((localData.org.property.paging.page-1)*localData.org.property.paging.limit+1) +' to '+ (localData.org.property.paging.limit*localData.org.property.paging.page < localData.org.property.total? localData.org.property.paging.limit*localData.org.property.paging.page:localData.org.property.total) +' of <strong>'+ localData.org.property.total +'</strong> entries');    
}

var loadOrgType = function(cb){
    $.ajax({
        method: 'GET',
        url: 'http://192.168.100.50:8000/rv1/orgType',
        beforeSend: function(request) {
            request.setRequestHeader("X-Token", getCookie('token'));
        },
        success: function(data, status, xhr){
            //console.log(data);
            localData.orgType = data;
            cb(false, data);       
        },
        error: function(status, xhr, err){
            //alert(status.responseJSON.trace);
            var msg = "Sorry but there was an error: ";
            toastr.options = {
                closeButton: true,
                progressBar: true,
                showMethod: 'slideDown',
                timeOut: 4000
            };
            toastr.error(status.responseJSON.trace, msg);
            cb(true, status.responseJSON.trace);
        }
    });
}

var loadOrg = function(cb){
    var params = '';
    try {
        params = '?page='+localData.org.property.paging.page+'&limit='+localData.org.property.paging.limit;
    } catch(err) {
        console.log('seems like org object not yet initialized');
    }

    $.ajax({
        method: 'GET',
        url: 'http://192.168.100.50:8000/rv1/org'+params,
        beforeSend: function(request) {
            request.setRequestHeader("X-Token", getCookie('token'));
        },
        success: function(data, status, xhr){
            localData.org = data;
            console.log(localData);
            cb(false, data);    
        },
        error: function(status, xhr, err){
            alert(status.responseJSON.trace);
            var msg = "Sorry but there was an error: ";
            toastr.options = {
                closeButton: true,
                progressBar: true,
                showMethod: 'slideDown',
                timeOut: 4000
            };
            toastr.error(status.responseJSON.trace, msg);
            cb(true, status.responseJSON.trace);
        }
    });
}

init.organization = function(cb){
    //localData.pageSize = 25;
    //localData.page = 1;
    //localData.org.searchparam = null;
    setNewOrgBtn(true);

    // load to local data
    // because there's still no way of populate via rv1 route, we're only request org when we already got the orgType
    loadOrgType(function(error, data){
        if(!error){
            loadOrg(function(error, data){
                if(!error){
                    cb({success: true});
                } else {
                    cb({success: false, message: "Error fetching org data from server"});
                }
            });
        } else {
            cb({success: false, message: "Error fetching orgType data from server"});
        }
    });

}

populate.organization = function(){

    configSelectHolderType();
    configTableHolder();

    $("#select-merchant").select2({
        placeholder: "Select Merchant",
        allowClear: true
    });

    $('.i-checks').iCheck({
        checkboxClass: 'icheckbox_square-green',
        radioClass: 'iradio_square-green',
    });
    $('.i-checks').on('ifChecked', function (event){
        $(this).closest("input").attr('checked', true);          
    });
    $('.i-checks').on('ifUnchecked', function (event) {
        $(this).closest("input").attr('checked', false);
    });
    //check value: $('form [name="tax"]').prop("checked");

    $('button[data-target="#picklocationmodal"]').on('click', function(){
        setTimeout(function(){
            $('#lp').locationpicker({
                location: {
                    latitude: -6.913529241,
                    longitude: 107.635387021
                },
                radius: 1,
                inputBinding: {
                    latitudeInput: $('#lp-lat'),
                    longitudeInput: $('#lp-lon'),
                    //radiusInput: $('#lp-radius'),
                    locationNameInput: $('#lp-address')
                },
                enableAutocomplete: true
            });
        }, 200);
    });
    
    $('#lp-save-btn').on('click', function(){
        $('#location-input').val($('#lp-address').val());
    });

    $('#select-image-btn').on('click', function(){
        var file = $('#select-image-input');
        file.trigger('click');
    });
    $('#select-image-input').on('change', function(){
        var filename = $('#select-image-input').val().replace(/C:\\fakepath\\/i, '');
        if(filename!==''){
            $('#select-image-btn').html(filename);
        } else {
            $('#select-image-btn').html('Select Image');
        }
        
    });

    $('#reset-org-btn').on('click', function(){
        setNewOrgBtn(true);
    });

    $('#new-org-btn').on('click', function(e){
        e.preventDefault();
        //console.log(geolocationObj);
        
        // this is either register button or update button according to the context
        if(localData.newOrgBtn){
            // so this is a new record, huh? aight.
            $('#new-org-btn strong').html('Registering...');
            $('#new-org-btn').attr('disabled', 'disabled');

            var orgData = {
                name: $('#name-input').val(),
                'orgType._id': $('#select-holder-type').val(),
                taxes: $('form [name="tax"]').prop("checked"),
                'email.value': $('#email-input').val()
            };

            if($('#npwp-input').val() != ''){
                orgData.npwp = $('#npwp-input').val();
            }
            if($('#phone-input').val() != ''){
                orgData['phone.value'] = $('#phone-input').val();
            }
            var location = {};
            if($('#location-input').val() != ''){
                location.address = $('#location-input').val();
            }
            if(typeof window.geolocationObj.country != 'undefined'){
                location.country = window.geolocationObj.country;
            }
            if(typeof window.geolocationObj.state != 'undefined'){
                location.state = window.geolocationObj.state;
            }
            if(typeof window.geolocationObj.state != 'undefined'){
                location.zipcode = window.geolocationObj.postal_code;
            }
            if(($('#lp-lat').val() == '')&&($('#lp-lon').val())){
                location.lat = $('#lp-lat').val();
                location.long = $('#lp-lon').val();
            }

            if(!$.isEmptyObject(location)){
                orgData.location = location;
            }

            $.ajax({
                method: 'POST',
                url: 'http://192.168.100.50:8000/rv1/org',
                beforeSend: function(request) {
                    request.setRequestHeader("X-Token", getCookie('token'));
                },
                data: orgData,
                success: function(data, status, xhr){
                    //console.log(data);
                    if(data.status==200 && data.message=="OK"){
                        $('form')[0].reset();
                        var msg = "New organization";
                        toastr.options = {
                            closeButton: true,
                            progressBar: true,
                            showMethod: 'slideDown',
                            timeOut: 4000
                        };
                        toastr.success("has been inserted", msg);
                        refreshTableData();
                        setNewOrgBtn(true);
                    } else {
                        var msg = "Sorry but there was an error: ";
                        toastr.options = {
                            closeButton: true,
                            progressBar: true,
                            showMethod: 'slideDown',
                            timeOut: 4000
                        };
                        toastr.error(data.trace, msg);
                    }
                },
                error: function(status, xhr, err){
                    var msg = "Sorry but there was an error: ";
                    toastr.options = {
                        closeButton: true,
                        progressBar: true,
                        showMethod: 'slideDown',
                        timeOut: 4000
                    };
                    toastr.error(status.responseJSON.trace, msg);
                }
            });
        } else {
            // update existing record? roger.
            $('#new-org-btn strong').html('Updating...');
            $('#new-org-btn').attr('disabled', 'disabled');
            setNewOrgBtn(true);
        }
    
    });

    $('#org-list-table').on('click', '.btn-org-edit', function(){
        var id = $(this).attr('orgid');
        var obj = localData.org.data.find(function(element){
            return element._id == id;
        });
        console.log('editing ' + obj.name);
        setNewOrgBtn(false, obj);
    });
}