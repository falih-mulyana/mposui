console.log('user_management script loaded');

var setNewOrgBtn = function(_orgObj){
    window.geolocationObj = {};
    if(typeof _orgObj === "undefined"){
        $('#org-form-title').html('Create New Organization / Holder');
        $('#new-org-btn strong').html('Register');
        $('#email-input').attr('placeholder', 'Email');
        $('#phone-input').attr('placeholder', '+6281234567');
        delete localData.updateOrg;
    } else {
        localData.updateOrg = _orgObj;
        $('#org-form-title').html('Editing ' + _orgObj.name);
        $('#new-org-btn strong').html('Update');

        // populate form with existing object
        $('#name-input').val(_orgObj.name);
        $('#email-input').val('');
        $('#email-input').attr('placeholder', 'unchanged (' + (typeof _orgObj.email === 'undefined'? 'not defined' : _orgObj.email.value) + ')');
        // manually add data to the Select2 component and select it
        var newOption = new Option(_orgObj.orgType.name, _orgObj.orgType._id, true, true);
        $("#select-holder-type").append(newOption).trigger('change');
        
        //$("#select-holder-type").next().find('#select2-select-holder-type-container').append(_orgObj.orgType.name)
        $('#location-input').val(typeof _orgObj.location === 'undefined'? '' : typeof _orgObj.location.address === 'undefined'? '' : _orgObj.location.address);
        $('#lp-lat').val(typeof _orgObj.location === 'undefined'? '' : typeof _orgObj.location.lat === 'undefined'? '' : _orgObj.location.lat);
        $('#lp-lat').val(typeof _orgObj.location === 'undefined'? '' : typeof _orgObj.location.long === 'undefined'? '' : _orgObj.location.long);
        window.geolocationObj.country = typeof _orgObj.location === 'undefined'? '' : typeof _orgObj.location.country === 'undefined'? '' : _orgObj.location.country;
        window.geolocationObj.state = typeof _orgObj.location === 'undefined'? '' : typeof _orgObj.location.state === 'undefined'? '' : _orgObj.location.state;
        window.geolocationObj.postal_code = typeof _orgObj.location === 'undefined'? '' : typeof _orgObj.location.postal_code === 'undefined'? '' : _orgObj.location.postal_code;
        $('#tax-checks').iCheck(typeof _orgObj.taxes === 'undefined'? 'uncheck':_orgObj.taxes == true? 'check':'uncheck');
        $('#npwp-input').val(_orgObj.npwp);
        //$('#phone-input').attr(typeof _orgObj.phone === 'undefined'? '':_orgObj.phone.value);
        $('#phone-input').val('');
        $('#phone-input').attr('placeholder', 'unchanged (' + (typeof _orgObj.phone === 'undefined'? 'not defined':_orgObj.phone.value) + ')');
    }

    $('#new-org-btn').removeAttr('disabled');
}

var refreshTableData = function(){
    //disable any elements that may invoke server request
    $('#org-table-server-refresh').attr('disabled', 'disabled');
    $('#org-table-server-refresh').html('<span class="glyphicon glyphicon-refresh"></span> Reloading...');
    $('#org-table-server-pagesize').attr('disabled', 'disabled');
    $('#org-table-server-filter').attr('disabled', 'disabled');
    $('#org-table-server-previous').attr('disabled', 'disabled');
    $('#org-table-server-next').attr('disabled', 'disabled');

    loadOrg(function(error, data){
        if(!error){
            configTableHolder();
        }
        // re-enable the elements
        $('#org-table-server-refresh').removeAttr('disabled');
        $('#org-table-server-refresh').html('<span class="glyphicon glyphicon-refresh"></span> Refresh Data');
        $('#org-table-server-pagesize').removeAttr('disabled');
        $('#org-table-server-filter').removeAttr('disabled');
        $('#org-table-server-previous').removeAttr('disabled');
        $('#org-table-server-next').removeAttr('disabled');
    });

    //$('#org-list-table_info').html('Showing '+ localData.org.property.paging.page +' to '+ (localData.org.property.total < localData.org.property.paging.limit? localData.org.property.total:localData.org.property.paging.limit) +' of <strong>'+ localData.org.property.total +'</strong> entries');
}

var configSelectHolderTypeOrg = function(){

    /*for(i=0; i<localData.orgType.data.length; i++){
        var el = '<option value="'+localData.orgType.data[i]._id+'">'+localData.orgType.data[i].name+'</option>';
        $('#select-holder-type').append(el);
    }*/

    // additional element for undefined
    //$('#select-holder-type').append('<option value=null>General or not defined</option>');

    $("#select-holder-type").select2({
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
        placeholder: "Select Holder",
        minimumInputLength: 3,
        allowClear: true
    });

    if(typeof localData.selectedOrgType !== 'undefined'){
        // manually add data to the Select2 component and select it
        var newOption = new Option(localData.selectedOrgType.name, localData.selectedOrgType.id, true, true);
        $("#select-holder-type").append(newOption).trigger('change');
    }

    $('#select-holder-type').on('change', function(){
        if($('#select-holder-type').val() !== null){
            localData.selectedOrgType = {
                id: $("#select-holder-type").val(),
                name: $("#select-holder-type").select2('data')[0].name || $("#select-holder-type").select2('data')[0].text
            }
        } else {
            delete localData.selectedOrgType;
        }
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
                $('#org-table-server-filter').val(typeof localData.org.searchparam === 'undefined'? '':localData.org.searchparam);
                $('#org-table-server-filter').on('keypress', function(e){
                    if(e.which == 13) {
                        if($('#org-table-server-filter').val() !== ''){
                            localData.org.searchparam = $('#org-table-server-filter').val();
                            console.log(localData.org.searchparam);
                        } else {
                            delete localData.org.searchparam;
                        }
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
        //var type = 'undefined';
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
        
        /*for(j=0; j<localData.orgType.data.length; j++){
            if(localData.orgType.data[j]._id == localData.org.data[i].orgType._id){
                type = localData.orgType.data[j].name;
            }
        }*/
        var additional_el = '<a class="btn btn-primary btn-org-edit" orgid="'+localData.org.data[i]._id+'"><span class="glyphicon glyphicon-pencil"></span></a><a class="btn btn-danger btn-org-delete" data-toggle="modal" data-target="#deleteOrgModal" orgid="'+localData.org.data[i]._id+'"><span class="glyphicon glyphicon-remove-circle"></span></a>';

        table.DataTable().row.add([localData.org.data[i].name, email, localData.org.data[i].orgType.name, address, tax, npwp, phone, additional_el]);
    }

    

    // redraw ze rows
    table.DataTable().draw();

    //// because how Datatables redraw its elements on every page changes, 
    //// not all additional elements declared on initComplete function above.
    //// instead, we declare them on every data changes (when configTableMerchant is called)
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

var loadOrg = function(cb){
    var params = '';
    try {
        var searchkey = typeof localData.org.searchparam === 'undefined'?'':localData.org.searchparam;
        params = '&and={%22name%22:%27%27*'+searchkey+'*%27%27}&page='+localData.org.property.paging.page+'&limit='+localData.org.property.paging.limit;
    } catch(err) {
        console.log('seems like org object not yet initialized');
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
            if(typeof localData.org !== 'undefined'){
                if(typeof localData.org.searchparam !== 'undefined'){
                    _param = localData.org.searchparam;
                }  
            }
            
            localData.org = data;
            if(_param!==null) localData.org.searchparam = _param;
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

init.organization = function(cb){
    
    loadOrg(function(error, data){
        if(!error){
            cb({success: true});
        } else {
            cb({success: false, message: "Error fetching org data from server"});
        }
    });

}

populate.organization = function(){

    if(typeof localData.updateOrg === 'undefined'){
        setNewOrgBtn();
    } else {
        setNewOrgBtn(localData.updateOrg);
    }

    configSelectHolderTypeOrg();
    configTableHolder();

    $('#tax-checks').iCheck({
        checkboxClass: 'icheckbox_square-green',
        radioClass: 'iradio_square-green',
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
        setNewOrgBtn();
    });

    $('#new-org-btn').on('click', function(e){
        e.preventDefault();
        //console.log(geolocationObj);

        var orgData = {
            name: $('#name-input').val(),
            taxes: $('form [name="tax"]').prop("checked")
        };

        if($('#email-input').val() != ''){
            orgData.email = {
                value : $('#email-input').val()
            }
        }
        if($('#select-holder-type').val() !== null && $('#select-holder-type').val() !== 'null'){
            orgData.orgType = {
                _id : $('#select-holder-type').val()
            }
        }
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
        if(typeof window.geolocationObj.postal_code != 'undefined'){
            location.zipcode = window.geolocationObj.postal_code;
        }
        if(($('#lp-lat').val() == '')&&($('#lp-lon').val() == '')){
            location.lat = $('#lp-lat').val();
            location.long = $('#lp-lon').val();
        }

        if(!$.isEmptyObject(location)){
            orgData.location = location;
        }
        
        // this is either register button or update button according to the context
        if(typeof localData.updateOrg === 'undefined'){
            // so this is a new record, huh? aight.
            $('#new-org-btn strong').html('Registering...');
            $('#new-org-btn').attr('disabled', 'disabled');

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
                        setNewOrgBtn();
                    } else {
                        var msg = "Sorry but there was an error: ";
                        toastr.options = {
                            closeButton: true,
                            progressBar: true,
                            showMethod: 'slideDown',
                            timeOut: 4000
                        };
                        toastr.error(data.trace, msg);
                        $('#new-org-btn strong').html('Register');
                        $('#new-org-btn').removeAttr('disabled');
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
                        $('#new-org-btn strong').html('Register');
                        $('#new-org-btn').removeAttr('disabled');
                    }
                    
                }
            });
        } else {
            // update existing record? roger.
            $('#new-org-btn strong').html('Updating...');
            $('#new-org-btn').attr('disabled', 'disabled');
            $.ajax({
                method: 'PUT',
                url: 'http://192.168.100.50:8000/rv1/org/' + localData.updateOrg._id,
                beforeSend: function(request) {
                    request.setRequestHeader("X-Token", getCookie('token'));
                },
                data: orgData,
                success: function(data, status, xhr){
                    //console.log(data);
                    if(data.status==200 && data.message=="OK"){
                        $('form')[0].reset();
                        var msg = localData.updateOrg.name;
                        toastr.options = {
                            closeButton: true,
                            progressBar: true,
                            showMethod: 'slideDown',
                            timeOut: 4000
                        };
                        toastr.success("has been updated", msg);
                        refreshTableData();
                        setNewOrgBtn();
                    } else {
                        var msg = "Sorry but there was an error: ";
                        toastr.options = {
                            closeButton: true,
                            progressBar: true,
                            showMethod: 'slideDown',
                            timeOut: 4000
                        };
                        toastr.error(data.trace, msg);
                        $('#new-org-btn strong').html('Update');
                        $('#new-org-btn').removeAttr('disabled');
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
                        $('#new-org-btn strong').html('Update');
                        $('#new-org-btn').removeAttr('disabled');
                    }
                    
                }
            });
        }
    
    });

    $('#org-list-table').on('click', '.btn-org-edit', function(){
        var id = $(this).attr('orgid');
        var obj = localData.org.data.find(function(element){
            return element._id == id;
        });
        console.log(obj);
        setNewOrgBtn(obj);
    });

    $('#org-list-table').on('click', '.btn-org-delete', function(){
        var id = $(this).attr('orgid');
        var obj = localData.org.data.find(function(element){
            return element._id == id;
        });

        $('#deleteOrgModal .modal-footer>button[confirm]').attr('orgid', id);

        $('#deleteOrgModal h4.modal-title').html('Delete Confirmation');
        $('#deleteOrgModal div.modal-body').html('Are you sure you want to delete this organization? <h3>'+obj.name+'</h3>');
        
    });

    $('#deleteOrgModal .modal-footer>button[confirm]').on('click', function(){
        var _el = $(this)
        _el.html('Deleting...');
        _el.attr('disabled', 'disabled');
        var id = $(this).attr('orgid');
        var obj = localData.org.data.find(function(element){
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
                    refreshTableData();
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
                $('#deleteOrgModal').modal('hide');
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
                    $('#deleteOrgModal').modal('hide');
                }
                
            }
        });
    });

    $('#newtypemodal .modal-footer>button[confirm]').on('click', function(){
        var _el = $(this);
        _el.html('Creating...');
        _el.attr('disabled', 'disabled');
        var newTypeName = $('#input-new-org-type').val();
 
        $.ajax({
            method: 'POST',
            url: 'http://192.168.100.50:8000/rv1/orgType',
            data: {
                name: newTypeName
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
}