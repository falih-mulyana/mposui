var setNewMerchantBtn = function(_merchantObj){
    window.geolocationObj = {};
    if(typeof _merchantObj === "undefined"){
        $('#merchant-form-title').html('Create New Merchant');
        $('#new-merchant-btn strong').html('Register');
        $('#email-input').attr('placeholder', 'Email');
        $('#phone-input').attr('placeholder', '+6281234567');
        delete localData.updateMerchant;
    } else {
        localData.updateMerchant = _merchantObj;
        $('#merchant-form-title').html('Editing ' + _merchantObj.name);
        $('#new-merchant-btn strong').html('Update');

        // populate form with existing object
        $('#name-input').val(_merchantObj.name);
        $('#email-input').val('');
        $('#email-input').attr('placeholder', 'unchanged (' + (typeof _merchantObj.email === 'undefined'? 'not defined' : _merchantObj.email.value) + ')');
        // manually add data to the Select2 component and select it
        var newOption = new Option(_merchantObj.orgType.name, _merchantObj.orgType._id, true, true);
        $("#select-merchant-type").append(newOption).trigger('change');
        
        $('#location-input').val(typeof _merchantObj.location === 'undefined'? '' : typeof _merchantObj.location.address === 'undefined'? '' : _merchantObj.location.address);
        $('#lp-lat').val(typeof _merchantObj.location === 'undefined'? '' : typeof _merchantObj.location.lat === 'undefined'? '' : _merchantObj.location.lat);
        $('#lp-lat').val(typeof _merchantObj.location === 'undefined'? '' : typeof _merchantObj.location.long === 'undefined'? '' : _merchantObj.location.long);
        window.geolocationObj.country = typeof _merchantObj.location === 'undefined'? '' : typeof _merchantObj.location.country === 'undefined'? '' : _merchantObj.location.country;
        window.geolocationObj.state = typeof _merchantObj.location === 'undefined'? '' : typeof _merchantObj.location.state === 'undefined'? '' : _merchantObj.location.state;
        window.geolocationObj.postal_code = typeof _merchantObj.location === 'undefined'? '' : typeof _merchantObj.location.postal_code === 'undefined'? '' : _merchantObj.location.postal_code;
        $('#tax-checks').iCheck(typeof _merchantObj.taxes === 'undefined'? 'uncheck':_merchantObj.taxes == true? 'check':'uncheck');
        $('#npwp-input').val(_merchantObj.npwp);
        //$('#phone-input').attr(typeof _merchantObj.phone === 'undefined'? '':_merchantObj.phone.value);
        $('#phone-input').val('');
        $('#phone-input').attr('placeholder', 'unchanged (' + (typeof _merchantObj.phone === 'undefined'? 'not defined':_merchantObj.phone.value) + ')');
    }

    $('#new-merchant-btn').removeAttr('disabled');
}

var refreshMerchantTableData = function(){
    //disable any elements that may invoke server request
    $('#merchant-table-server-refresh').attr('disabled', 'disabled');
    $('#merchant-table-server-refresh').html('<span class="glyphicon glyphicon-refresh"></span> Reloading...');
    $('#merchant-table-server-pagesize').attr('disabled', 'disabled');
    $('#merchant-table-server-filter').attr('disabled', 'disabled');
    $('#merchant-table-server-previous').attr('disabled', 'disabled');
    $('#merchant-table-server-next').attr('disabled', 'disabled');

    loadMerchant(getCookie('orgid'), function(error, data){
        if(!error){
            // re-enable the elements
            $('#merchant-table-server-refresh').removeAttr('disabled');
            $('#merchant-table-server-refresh').html('<span class="glyphicon glyphicon-refresh"></span> Refresh Data');
            $('#merchant-table-server-pagesize').removeAttr('disabled');
            $('#merchant-table-server-filter').removeAttr('disabled');
            $('#merchant-table-server-previous').removeAttr('disabled');
            $('#merchant-table-server-next').removeAttr('disabled');

            configTableMerchant();
        }
    });
}

var configSelectMerchantTypeMerchant = function(){

    $("#select-merchant-type").select2({
        ajax: {
            url: "http://192.168.100.50:8000/rv1/orgType",
            dataType: 'json',
            delay: 500,
            beforeSend: function(request) {
                request.setRequestHeader("X-Token", getCookie('token'));
            },
            data: function (params) {
                return {
                    and: '{"org._id":"'+getCookie('orgid')+'","name":\'\'*'+params.term+'*\'\'}', // search term
                    page: params.page
                };
            },
            processResults: function (data, params) {
                // parse the results into the format expected by Select2
                // since we are using custom formatting functions we do not need to
                // alter the remote JSON data, except to indicate that infinite
                // scrolling can be used
                params.page = params.page || 1;
                var _data = [];
                for(var i = 0; i < data.data.length; i++){
                    _data.push({ id: data.data[i]._id, name: data.data[i].name});
                }
                return {
                    results: _data,
                    pagination: {
                        more: (params.page * 30) < data.property.total
                    }
                };
            },
            cache: true,
            error: function(status, xhr, err){
                var msg = errorRequestHandler(status);
                if( msg == expiredTokenMessage()){
                    document.cookie = 'token=; path=/';
                    location.reload();
                } else if(msg == serverErrorMessage()){
                    $('body').html('<h2 style="color: white;">'+msg+'</h2>');
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
            }
        },
        templateResult: function(data){
           return data.name || data.text;
        },
        templateSelection: function(data){
            return data.name || data.text;
        },
        placeholder: "Select Merchant",
        minimumInputLength: 3,
        allowClear: true
    });

    if(typeof localData.selectedMerchantType !== 'undefined'){
        // manually add data to the Select2 component and select it
        var newOption = new Option(localData.selectedMerchantType.name, localData.selectedMerchantType.id, true, true);
        $("#select-merchant-type").append(newOption).trigger('change');
    }

    $('#select-merchant-type').on('change', function(){
        if($('#select-merchant-type').val() !== null){
            localData.selectedMerchantType = {
                id: $("#select-merchant-type").val(),
                name: $("#select-merchant-type").select2('data')[0].name || $("#select-merchant-type").select2('data')[0].text
            }
        } else {
            delete localData.selectedMerchantType;
        }
    });
}

var configTableMerchant = function(){
    var table = $('#merchant-list-table');
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
                $("[name='merchant-list-table_length']").addClass('hidden');
                // make our own that identical to it
                $("[name='merchant-list-table_length']").after('<select id="merchant-table-server-pagesize" class="form-control input-sm"><option value="10">10</option><option value="25">25</option><option value="50">50</option></select>');
                // trigger the selection base on pageSize global variable
                $("#merchant-table-server-pagesize").val(localData.merchant.raw.property.paging.limit).trigger('change');
                // add manual refresh button
                $("#merchant-table-server-pagesize").parent().after('<a id="merchant-table-server-refresh" style="margin: 0 0 0 20px;" class="btn btn-info"><span class="glyphicon glyphicon-refresh"></span> Refresh Data</a>');
                // config the change event on the element
                $("#merchant-table-server-pagesize").on('change', function(){
                    localData.merchant.raw.property.paging.limit = parseInt($(this).val());
                    localData.merchant.raw.property.paging.page = 1;
                    console.log(localData.merchant.raw.property.paging.limit);
                    refreshMerchantTableData();
                });

                $('#merchant-table-server-refresh').on('click', function(){
                    refreshMerchantTableData();
                });

                $('#merchant-list-table_filter input[type="search"]').addClass('hidden');
                $('#merchant-list-table_filter input[type="search"]').after('<input class="form-control" id="merchant-table-server-filter" type="text">');
                $('#merchant-table-server-filter').val(typeof localData.merchant.searchparam === 'undefined'? '':localData.merchant.searchparam);
                $('#merchant-table-server-filter').on('keypress', function(e){
                    if(e.which == 13) {
                        if($('#merchant-table-server-filter').val() !== ''){
                            localData.merchant.searchparam = $('#merchant-table-server-filter').val();
                            console.log(localData.merchant.searchparam);
                        } else {
                            delete localData.merchant.searchparam;
                        }
                        refreshMerchantTableData();
                    }
                });

            }
        });
    }

    // clear previous rows
    table.DataTable().clear();

    // populate ze rows
    for(i=0; i<localData.merchant.raw.data.length; i++){
        //var type = 'undefined';
        var tax = localData.merchant.raw.data[i].taxes == true? 'yes':'no';
        var phone = '-';
        var email = '-';
        var address = '-';
        var npwp = '-';
        if(localData.merchant.raw.data[i].hasOwnProperty('phone')){
            phone = localData.merchant.raw.data[i].phone.value;
        }
        if(localData.merchant.raw.data[i].hasOwnProperty('email')){
            email = localData.merchant.raw.data[i].email.value;
        }
        if(localData.merchant.raw.data[i].hasOwnProperty('location')){
            if(localData.merchant.raw.data[i].location.hasOwnProperty('address')){
                address = localData.merchant.raw.data[i].location.address;
            }
        }
        if(localData.merchant.raw.data[i].hasOwnProperty('npwp')){
            npwp = localData.merchant.raw.data[i].npwp;
        }
        
        
        var additional_el = '<a class="btn btn-primary btn-merchant-edit" orgid="'+localData.merchant.raw.data[i]._id+'"><span class="glyphicon glyphicon-pencil"></span></a><a class="btn btn-danger btn-merchant-delete" data-toggle="modal" data-target="#deleteMerchantModal" orgid="'+localData.merchant.raw.data[i]._id+'"><span class="glyphicon glyphicon-remove-circle"></span></a>';

        table.DataTable().row.add([localData.merchant.raw.data[i].name, email, localData.merchant.raw.data[i].orgType.name, address, tax, npwp, phone, additional_el]);
    }

    // redraw ze rows
    table.DataTable().draw();

    //// because how Datatables redraw its elements on every page changes, 
    //// not all additional elements declared on initComplete function above.
    //// instead, we declare them on every data changes (when configTableMerchant is called)
    $('#merchant-list-table_wrapper .pagination').addClass('hidden');
    $('#merchant-list-table_wrapper .pagination').after('<ul class="pagination"><li class="paginate_button previous"><button id="merchant-table-server-previous" class="btn btn-default">Previous</button></li><li class="paginate_button next"><button id="merchant-table-server-next" class="btn btn-default">Next</button></li></ul>');
    
    $('#merchant-table-server-previous').on('click', function(){
        if(localData.merchant.raw.property.paging.page > 1){
            localData.merchant.raw.property.paging.page = localData.merchant.raw.property.paging.page-1;
            refreshMerchantTableData();
        }
    })
    $('#merchant-table-server-next').on('click', function(){
        if(localData.merchant.raw.property.total > localData.merchant.raw.property.paging.limit*localData.merchant.raw.property.paging.page){
            localData.merchant.raw.property.paging.page = localData.merchant.raw.property.paging.page+1;
            refreshMerchantTableData();
        }
    });
    $('#merchant-list-table_info').html('Showing '+ ((localData.merchant.raw.property.paging.page-1)*localData.merchant.raw.property.paging.limit+1) +' to '+ (localData.merchant.raw.property.paging.limit*localData.merchant.raw.property.paging.page < localData.merchant.raw.property.total? localData.merchant.raw.property.paging.limit*localData.merchant.raw.property.paging.page:localData.merchant.raw.property.total) +' of <strong>'+ localData.merchant.raw.property.total +'</strong> entries');    
}

/*var configSelectHolderMerchant = function(){

    $("#select-holder").select2({
        ajax: {
            url: 'http://192.168.100.50:8000/rv1/org',
            dataType: 'json',
            delay: 500,
            beforeSend: function(request) {
                request.setRequestHeader("X-Token", getCookie('token'));
            },
            data: function (params) {
                return {
                    and: '{"org._id":"'+getCookie('orgid')+'","name":\'\'*'+params.term+'*\'\'}', // search term
                    page: params.page
                };
            },
            processResults: function (data, params) {
                params.page = params.page || 1;
                var _data = [];
                for(var i = 0; i < data.data.length; i++){
                    _data.push({ id: data.data[i]._id, name: data.data[i].name});
                }
                return {
                    results: _data,
                    pagination: {
                        more: (params.page * 30) < data.property.total
                    }
                };
            },
            cache: true,
            error: function(status, xhr, err){
                var msg = errorRequestHandler(status);
                if( msg == expiredTokenMessage()){
                    document.cookie = 'token=; path=/';
                    location.reload();
                } else if(msg == serverErrorMessage()){
                    $('body').html('<h2 style="color: white;">'+msg+'</h2>');
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
            }
        },
        templateResult: function(data){
           return data.name || data.text;
        },
        templateSelection: function(data){
            return data.name || data.text;
        },
        placeholder: "Select Holder",
        minimumInputLength: 3,
        allowClear: true
    });

    $("#select-holder").on('change', function(){
        if($(this).val() !== null){
            localData.merchant.searchFromHolder = {
                id: $("#select-holder").val(),
                name: $("#select-holder").select2('data')[0].name || $("#select-holder").select2('data')[0].text
            }
            configSelectMerchantTypeMerchant();
            loadMerchant(localData.merchant.searchFromHolder.id, function(err, data){
                if(!err){
                    // re-enable the elements
                    $('#merchant-table-server-refresh').removeAttr('disabled');
                    $('#merchant-table-server-refresh').html('<span class="glyphicon glyphicon-refresh"></span> Refresh Data');
                    $('#merchant-table-server-pagesize').removeAttr('disabled');
                    $('#merchant-table-server-filter').removeAttr('disabled');
                    $('#merchant-table-server-previous').removeAttr('disabled');
                    $('#merchant-table-server-next').removeAttr('disabled');

                    configTableMerchant();
                }
            });

            $('#new-merchant-btn').removeAttr('disabled');
        } else {
            delete localData.merchant.searchFromHolder;
            // check existing select2 element and destroy it if any
            if ($('#select-merchant-type').hasClass("select2-hidden-accessible")) {
                $("#select-merchant-type").select2('destroy'); 
            }

            $('#merchant-list-table').DataTable().clear();
            $('#merchant-list-table').DataTable().destroy();

            $('#new-merchant-btn').attr('disabled', 'disabled');
        }
        
        
    });
}*/

var loadMerchant = function(_orgid, cb){
    var params = '';
    try {
        var searchkey = typeof localData.merchant.searchparam === 'undefined'?'':localData.merchant.searchparam;
        params = '&and={"org._id":"'+_orgid+'","name":%27%27*'+searchkey+'*%27%27}&page='+localData.merchant.raw.property.paging.page+'&limit='+localData.merchant.raw.property.paging.limit;
    } catch(err) {
        console.log('seems like merchant object not yet initialized');
        params = '&and={"org._id":"'+_orgid+'"}';
    }

    $.ajax({
        method: 'GET',
        url: 'http://192.168.100.50:8000/rv1/org?populate=orgType._id'+params,
        beforeSend: function(request) {
            request.setRequestHeader("X-Token", getCookie('token'));
        },
        success: function(data, status, xhr){
            // retrieve the searchparam first before replace
            var _param = null;
            if(typeof localData.merchant !== 'undefined'){
                if(typeof localData.merchant.searchparam !== 'undefined'){
                    _param = localData.merchant.searchparam;
                }  
            }
            
            localData.merchant.raw = data;
            if(_param!==null) localData.merchant.searchparam = _param;
            console.log(localData);
            cb(false, data);    
        },
        error: function(status, xhr, err){
            var msg = errorRequestHandler(status);
            if( msg == expiredTokenMessage()){
                document.cookie = 'token=; path=/';
                location.reload();
            } else if(msg == serverErrorMessage()){
                $('body').html('<h2 style="color: white;">'+msg+'</h2>');
            } else {
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
        }
    });
}



init.merchant = function(cb){
    localData.merchant = {};
	loadMerchant(getCookie('orgid'), function(error, data){
        if(!error){
            cb({success: true});
        } else {
            cb({success: false, message: "Error fetching org data from server"});
        }
    });
}

populate.merchant = function(){

    if(typeof localData.updateMerchant === 'undefined'){
        setNewMerchantBtn();
    } else {
        setNewMerchantBtn(localData.updateMerchant);
    }
	// config select element
	configSelectMerchantTypeMerchant();
    configTableMerchant();

    $('#newtypemodal .modal-footer>button[confirm]').on('click', function(){
        var _el = $(this);
        _el.html('Creating...');
        _el.attr('disabled', 'disabled');
        var newTypeName = $('#input-new-org-type').val();
 
        $.ajax({
            method: 'POST',
            url: 'http://192.168.100.50:8000/rv1/orgType',
            data: {
                name: newTypeName,
                'org._id': getCookie('orgid')
            },
            beforeSend: function(request) {
                request.setRequestHeader("X-Token", getCookie('token'));
            },
            success: function(data, status, xhr){
                //console.log(data);
                if(data.status==200 && data.message=="OK"){
                    var msg = "New Type";
                    toastr.options = {
                        closeButton: true,
                        progressBar: true,
                        showMethod: 'slideDown',
                        timeOut: 4000
                    };
                    toastr.success("has been created", msg);
                    
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

                _el.html('Save Changes');
                _el.removeAttr('disabled');
                $('#newtypemodal').modal('hide');
            },
            error: function(status, xhr, err){
                var msg = errorRequestHandler(status);
                if( msg == expiredTokenMessage()){
                    document.cookie = 'token=; path=/';
                    location.reload();
                } else if(msg == serverErrorMessage()){
                    $('body').html('<h2 style="color: white;">'+msg+'</h2>');
                } else {
                    var msg = "Sorry but there was an error: ";
                    toastr.options = {
                        closeButton: true,
                        progressBar: true,
                        showMethod: 'slideDown',
                        timeOut: 4000
                    };
                    toastr.error(status.responseJSON.trace, msg);
                    _el.html('Save Changes');
                    _el.removeAttr('disabled');
                    $('#newtypemodal').modal('hide');
                }

            }
        });
    });

    $('#new-merchant-btn').on('click', function(e){
        e.preventDefault();

        var merchantData = {
            name: $('#name-input').val(),
            taxes: $('form [name="tax"]').prop("checked"),
            'org._id': getCookie('orgid')
        };

        if($('#email-input').val() != ''){
            merchantData.email = {
                value : $('#email-input').val()
            }
        }
        if($('#select-merchant-type').val() !== null && $('#select-merchant-type').val() !== 'null'){
            merchantData.orgType = {
                _id : $('#select-merchant-type').val()
            }
        }
        if($('#npwp-input').val() != ''){
            merchantData.npwp = $('#npwp-input').val();
        }
        if($('#phone-input').val() != ''){
            merchantData['phone.value'] = $('#phone-input').val();
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
        if(typeof window.geolocationObj.postal_code != 'undefined'){
            location.zipcode = window.geolocationObj.postal_code;
        }
        if(($('#lp-lat').val() == '')&&($('#lp-lon').val() == '')){
            location.lat = $('#lp-lat').val();
            location.long = $('#lp-lon').val();
        }

        if(!$.isEmptyObject(location)){
            merchantData.location = location;
        }
        
        // this is either register button or update button according to the context
        if(typeof localData.updateMerchant === 'undefined'){
            // so this is a new record, huh? aight.
            $('#new-merchant-btn strong').html('Registering...');
            $('#new-merchant-btn').attr('disabled', 'disabled');

            $.ajax({
                method: 'POST',
                url: 'http://192.168.100.50:8000/rv1/org',
                beforeSend: function(request) {
                    request.setRequestHeader("X-Token", getCookie('token'));
                },
                data: merchantData,
                success: function(data, status, xhr){
                    //console.log(data);
                    if(data.status==200 && data.message=="OK"){
                        $('form')[0].reset();
                        var msg = "New merchant";
                        toastr.options = {
                            closeButton: true,
                            progressBar: true,
                            showMethod: 'slideDown',
                            timeOut: 4000
                        };
                        toastr.success("has been inserted", msg);
                        refreshMerchantTableData();
                        setNewMerchantBtn();
                    } else {
                        var msg = "Sorry but there was an error: ";
                        toastr.options = {
                            closeButton: true,
                            progressBar: true,
                            showMethod: 'slideDown',
                            timeOut: 4000
                        };
                        toastr.error(data.trace, msg);
                        $('#new-merchant-btn strong').html('Register');
                        $('#new-merchant-btn').removeAttr('disabled');
                    }
                },
                error: function(status, xhr, err){
                    var msg = errorRequestHandler(status);
                    if( msg == expiredTokenMessage()){
                        document.cookie = 'token=; path=/';
                        location.reload();
                    } else if(msg == serverErrorMessage()){
                        $('body').html('<h2 style="color: white;">'+msg+'</h2>');
                    } else {
                        var msg = "Sorry but there was an error: ";
                        toastr.options = {
                            closeButton: true,
                            progressBar: true,
                            showMethod: 'slideDown',
                            timeOut: 4000
                        };
                        toastr.error(status.responseJSON.trace, msg);
                        $('#new-merchant-btn strong').html('Register');
                        $('#new-merchant-btn').removeAttr('disabled');
                    }
                    
                }
            });
        } else {
            // update existing record? roger.
            $('#new-merchant-btn strong').html('Updating...');
            $('#new-merchant-btn').attr('disabled', 'disabled');
            $.ajax({
                method: 'PUT',
                url: 'http://192.168.100.50:8000/rv1/org/' + localData.updateMerchant._id,
                beforeSend: function(request) {
                    request.setRequestHeader("X-Token", getCookie('token'));
                },
                data: merchantData,
                success: function(data, status, xhr){
                    //console.log(data);
                    if(data.status==200 && data.message=="OK"){
                        $('form')[0].reset();
                        var msg = localData.updateMerchant.name;
                        toastr.options = {
                            closeButton: true,
                            progressBar: true,
                            showMethod: 'slideDown',
                            timeOut: 4000
                        };
                        toastr.success("has been updated", msg);
                        refreshMerchantTableData();
                        setNewMerchantBtn();
                    } else {
                        var msg = "Sorry but there was an error: ";
                        toastr.options = {
                            closeButton: true,
                            progressBar: true,
                            showMethod: 'slideDown',
                            timeOut: 4000
                        };
                        toastr.error(data.trace, msg);
                        $('#new-merchant-btn strong').html('Update');
                        $('#new-merchant-btn').removeAttr('disabled');
                    }
                },
                error: function(status, xhr, err){
                    var msg = errorRequestHandler(status);
                    if( msg == expiredTokenMessage()){
                        document.cookie = 'token=; path=/';
                        location.reload();
                    } else if(msg == serverErrorMessage()){
                        $('body').html('<h2 style="color: white;">'+msg+'</h2>');
                    } else {
                        var msg = "Sorry but there was an error: ";
                        toastr.options = {
                            closeButton: true,
                            progressBar: true,
                            showMethod: 'slideDown',
                            timeOut: 4000
                        };
                        toastr.error(status.responseJSON.trace, msg);
                        $('#new-merchant-btn strong').html('Update');
                        $('#new-merchant-btn').removeAttr('disabled');
                    }
                }
            });
        }
    
    });

    $('button[data-target="#picklocationmodal"]').on('click', function(){
        setTimeout(function(){
            $('#lp').locationpicker({
                location: {
                    latitude: $('#lp-lat').val() !== ''? $('#lp-lat').val():-6.913529241,
                    longitude: $('#lp-lon').val() !== ''? $('#lp-lon').val():107.635387021
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

    $('#merchant-list-table').on('click', '.btn-merchant-edit', function(){
        var id = $(this).attr('orgid');
        var obj = localData.merchant.raw.data.find(function(element){
            return element._id == id;
        });
        console.log(obj);
        setNewMerchantBtn(obj);
    });

    $('#merchant-list-table').on('click', '.btn-merchant-delete', function(){
        var id = $(this).attr('orgid');
        var obj = localData.merchant.raw.data.find(function(element){
            return element._id == id;
        });

        $('#deleteMerchantModal .modal-footer>button[confirm]').attr('orgid', id);

        $('#deleteMerchantModal h4.modal-title').html('Delete Confirmation');
        $('#deleteMerchantModal div.modal-body').html('Are you sure you want to delete this merchant? <h3>'+obj.name+'</h3>');
        
    });

    $('#deleteMerchantModal .modal-footer>button[confirm]').on('click', function(){
        var _el = $(this)
        _el.html('Deleting...');
        _el.attr('disabled', 'disabled');
        var id = $(this).attr('orgid');
        var obj = localData.merchant.raw.data.find(function(element){
            return element._id == id;
        });
        $.ajax({
            method: 'DELETE',
            url: 'http://192.168.100.50:8000/rv1/org/' + id,
            beforeSend: function(request) {
                request.setRequestHeader("X-Token", getCookie('token'));
            },
            success: function(data, status, xhr){
                //console.log(data);
                if(data.status==200 && data.message=="OK"){
                    var msg = obj.name;
                    toastr.options = {
                        closeButton: true,
                        progressBar: true,
                        showMethod: 'slideDown',
                        timeOut: 4000
                    };
                    toastr.success("has been deleted", msg);
                    refreshMerchantTableData();
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

                _el.html('Confirm');
                _el.removeAttr('disabled');
                $('#deleteMerchantModal').modal('hide');
            },
            error: function(status, xhr, err){
                var msg = errorRequestHandler(status);
                if( msg == expiredTokenMessage()){
                    document.cookie = 'token=; path=/';
                    location.reload();
                } else if(msg == serverErrorMessage()){
                    $('body').html('<h2 style="color: white;">'+msg+'</h2>');
                } else {
                    var msg = "Sorry but there was an error: ";
                    toastr.options = {
                        closeButton: true,
                        progressBar: true,
                        showMethod: 'slideDown',
                        timeOut: 4000
                    };
                    toastr.error(status.responseJSON.trace, msg);
                    _el.html('Confirm');
                    _el.removeAttr('disabled');
                    $('#deleteMerchantModal').modal('hide');
                }
                
            }
        });
    });

    $('#reset-merchant-btn').on('click', function(){
        setNewMerchantBtn();
    });
}