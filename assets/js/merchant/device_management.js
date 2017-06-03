console.log('device management script loaded');

var registering = false;

var setNewDeviceBtn = function(_deviceObj){
    window.geolocationObj = {};
    if(typeof _deviceObj === "undefined"){
        $('#device-form-title').html('Create New Device');
        $('#wizard a[href="#finish"]').html('Register');
        $('#lp-lat').val('');
        $('#lp-lon').val('');

        delete localData.updateDevice;
    } else {
        localData.updateDevice = _deviceObj;
        $('#device-form-title').html('Editing ' + _deviceObj.name);
        $('#wizard a[href="#finish"]').html('Update');

        // populate form with existing object
        $('#name-input').val(_deviceObj.name);
        $('#lp-lat').val(typeof _deviceObj.location !== 'undefined'? (typeof _deviceObj.location.lat !== 'undefined'? _deviceObj.location.lat:'') : '');
        $('#lp-lon').val(typeof _deviceObj.location !== 'undefined'? (typeof _deviceObj.location.long !== 'undefined'? _deviceObj.location.long:'') : '');
        $('#serial-input').val(_deviceObj.property.number);
        $('#vendor-input').val(typeof _deviceObj.property.vendor !== 'undefined'? _deviceObj.property.vendor: '');
        $('#series-input').val(typeof _deviceObj.property.series !== 'undefined'? _deviceObj.property.series: '');
        $('#type-input').val(typeof _deviceObj.property.type !== 'undefined'? _deviceObj.property.type: '');
        $('#os-input').val(typeof _deviceObj.property.os !== 'undefined'? _deviceObj.property.os: '');
        $('#os-version-input').val(typeof _deviceObj.property.osVersion !== 'undefined'? _deviceObj.property.osVersion: '');
        $('#firmware-input').val(typeof _deviceObj.property.firmware !== 'undefined'? _deviceObj.property.firmware: '');
        $('#app-version-input').val(typeof _deviceObj.property.appVersion !== 'undefined'? _deviceObj.property.appVersion: '');
        $('#notes-input').val(typeof _deviceObj.property.notes !== 'undefined'? _deviceObj.property.notes: '');
        $('#lp-lat').val(typeof _deviceObj.location.lat !== 'undefined'? _deviceObj.location.lat: -6.913529241);
        $('#lp-lon').val(typeof _deviceObj.location.long !== 'undefined'? _deviceObj.location.long: 107.635387021);
    }

    registering = false;
}

var refreshDeviceTableData = function(){
    //disable any elements that may invoke server request
    $('#device-table-server-refresh').attr('disabled', 'disabled');
    $('#device-table-server-refresh').html('<span class="glyphicon glyphicon-refresh"></span> Reloading...');
    $('#device-table-server-pagesize').attr('disabled', 'disabled');
    $('#device-table-server-filter').attr('disabled', 'disabled');
    $('#device-table-server-previous').attr('disabled', 'disabled');
    $('#device-table-server-next').attr('disabled', 'disabled');

    loadDevice(function(error, data){
        if(!error){
            configTableDevice();
        }

        // re-enable the elements
        $('#device-table-server-refresh').removeAttr('disabled');
        $('#device-table-server-refresh').html('<span class="glyphicon glyphicon-refresh"></span> Refresh Data');
        $('#device-table-server-pagesize').removeAttr('disabled');
        $('#device-table-server-filter').removeAttr('disabled');
        $('#device-table-server-previous').removeAttr('disabled');
        $('#device-table-server-next').removeAttr('disabled');
    });
}

var loadDevice = function(cb){
    var params = '';
    try {
        var searchkey = typeof localData.device.searchparam === 'undefined'?'':localData.device.searchparam;
        params = '&and={%22name%22:%27%27*'+searchkey+'*%27%27}&page='+localData.device.property.paging.page+'&limit='+localData.device.property.paging.limit;
    } catch(err) {
        console.log('seems like device object not yet initialized');
    }

    $.ajax({
        method: 'GET',
        url: 'http://192.168.100.50:8000/rv1/device?populate=org._id'+params,
        beforeSend: function(request) {
            request.setRequestHeader("X-Token", getCookie('token'));
        },
        success: function(data, status, xhr){
            // retrieve the searchparam first before replace
            var _param = null;
            if(typeof localData.device !== 'undefined'){
                if(typeof localData.device.searchparam !== 'undefined'){
                    _param = localData.device.searchparam;
                }  
            }
            
            localData.device = data;
            if(_param!==null) localData.device.searchparam = _param;
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

var configTableDevice = function(){
    var table = $('#device-list-table');
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
                $("[name='device-list-table_length']").addClass('hidden');
                // make our own that identical to it
                $("[name='device-list-table_length']").after('<select id="device-table-server-pagesize" class="form-control input-sm"><option value="10">10</option><option value="25">25</option><option value="50">50</option></select>');
                // trigger the selection base on pageSize global variable
                $("#device-table-server-pagesize").val(localData.device.property.paging.limit).trigger('change');
                // add manual refresh button
                $("#device-table-server-pagesize").parent().after('<a id="device-table-server-refresh" style="margin: 0 0 0 20px;" class="btn btn-info"><span class="glyphicon glyphicon-refresh"></span> Refresh Data</a>');
                // config the change event on the element
                $("#device-table-server-pagesize").on('change', function(){
                    localData.device.property.paging.limit = parseInt($(this).val());
                    localData.device.property.paging.page = 1;
                    console.log(localData.device.property.paging.limit);
                    refreshDeviceTableData();
                });

                $('#device-table-server-refresh').on('click', function(){
                    refreshDeviceTableData();
                });

                $('#device-list-table_filter input[type="search"]').addClass('hidden');
                $('#device-list-table_filter input[type="search"]').after('<input class="form-control" id="device-table-server-filter" type="text">');
                $('#device-table-server-filter').val(typeof localData.device.searchparam === 'undefined'? '':localData.device.searchparam);
                $('#device-table-server-filter').on('keypress', function(e){
                    if(e.which == 13) {
                        if($('#device-table-server-filter').val() !== ''){
                            localData.device.searchparam = $('#device-table-server-filter').val();
                            console.log(localData.device.searchparam);
                        } else {
                            delete localData.device.searchparam;
                        }
                        refreshDeviceTableData();
                    }
                });

            }
        });
    }

    // clear previous rows
    table.DataTable().clear();

    // populate ze rows
    for(i=0; i<localData.device.data.length; i++){

        var additional_el = '<a class="btn btn-primary btn-device-edit" deviceid="'+localData.device.data[i]._id+'"><span class="glyphicon glyphicon-pencil"></span></a><a class="btn btn-danger btn-device-delete" data-toggle="modal" data-target="#deleteDeviceModal" deviceid="'+localData.device.data[i]._id+'"><span class="glyphicon glyphicon-remove-circle"></span></a>';

        table.DataTable().row.add([localData.device.data[i].name, localData.device.data[i].property.number, (typeof localData.device.data[i].property.vendor === 'undefined'? '':localData.device.data[i].property.vendor), (typeof localData.device.data[i].property.series === 'undefined'? '':localData.device.data[i].property.series), additional_el]);
    }

    

    // redraw ze rows
    table.DataTable().draw();

    //// because how Datatables redraw its elements on every page changes, 
    //// not all additional elements declared on initComplete function above.
    //// instead, we declare them on every data changes (when configTableMerchant is called)
    $('#device-list-table_wrapper .pagination').addClass('hidden');
    $('#device-list-table_wrapper .pagination').after('<ul class="pagination"><li class="paginate_button previous"><button id="device-table-server-previous" class="btn btn-default">Previous</button></li><li class="paginate_button next"><button id="device-table-server-next" class="btn btn-default">Next</button></li></ul>');
    
    $('#device-table-server-previous').on('click', function(){
        if(localData.device.property.paging.page > 1){
            localData.device.property.paging.page = localData.device.property.paging.page-1;
            refreshDeviceTableData();
        }
    })
    $('#device-table-server-next').on('click', function(){
        if(localData.device.property.total > localData.device.property.paging.limit*localData.device.property.paging.page){
            localData.device.property.paging.page = localData.device.property.paging.page+1;
            refreshDeviceTableData();
        }
    });
    $('#device-list-table_info').html('Showing '+ ((localData.device.property.paging.page-1)*localData.device.property.paging.limit+1) +' to '+ (localData.device.property.paging.limit*localData.device.property.paging.page < localData.device.property.total? localData.device.property.paging.limit*localData.device.property.paging.page:localData.device.property.total) +' of <strong>'+ localData.device.property.total +'</strong> entries');    
}

// helper function to dynamically change form height
function resizeJquerySteps() {
     $('.wizard .content').css('height', $('.body.current').outerHeight());
}

init.device_management = function(cb){
    loadDevice(function(error, data){
        if(!error){
            cb({success: true});
        } else {
            cb({success: false, message: "Error fetching org data from server"});
        }
    });
}

populate.device_management = function(){

    configTableDevice();
    // config form steps
    $("#wizard").steps({
        labels: {
            cancel: "reset form",
            current: "current step:",
            pagination: "Pagination",
            finish: "Register",
            next: "Next",
            previous: "Previous",
            loading: "Loading ..."
        },
        enableAllSteps: true,
        onStepChanging: function(event, currentIndex, newIndex) {
            resizeJquerySteps();
            return true;
        },
        onStepChanged: function (event, currentIndex, priorIndex) {
            resizeJquerySteps();
        }
    });

    // for steps initialization, coz sum bug.
    setTimeout(resizeJquerySteps, 200);

    // map the "reset button"
    $('#wizard a[href="#cancel"]').off('click');
    $('#wizard a[href="#cancel"]').on('click', function(e){
        e.preventDefault();
        $('form')[0].reset();
        setNewDeviceBtn();
    });

    if(typeof localData.updateDevice === 'undefined'){
        setNewDeviceBtn();
    } else {
        setNewDeviceBtn(localData.updateDevice);
    }

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
        //$('#location-input').val($('#lp-address').val());
    });

    // map the "register button"
    $('#wizard a[href="#finish"]').off('click');
    $('#wizard a[href="#finish"]').on('click', function(e){
        e.preventDefault();

        if(registering){
            return;
        }

        registering = true;
        
        var deviceData = {
            name: $('#name-input').val(),
            property: {
                number: $('#serial-input').val(),
                vendor: $('#vendor-input').val(),
                series: $('#series-input').val(),
                type: $('#type-input').val(),
                os: $('#os-input').val(),
                osVersion: $('#os-version-input').val(),
                firmware: $('#firmware-input').val(),
                appVersion: $('#app-version-input').val(),
                notes: $('#notes-input').val()
            },
            org: {
                _id: getCookie('orgid')
            }
        };

        if($('#lp-lat').val() !== '' && $('#lp-lon').val() !== ''){
            deviceData.location = {
                lat: $('#lp-lat').val(),
                long: $('#lp-lon').val()
            }
        }
        
        if(typeof localData.updateDevice === 'undefined'){
            // so this is a new record, huh? aight.

            //validation
            if($('#name-input').val() == ''){
                var msg = "Name should not be empty";
                toastr.options = {
                    closeButton: true,
                    progressBar: true,
                    showMethod: 'slideDown',
                    timeOut: 4000
                };
                toastr.error('', msg);
                registering = false;
                return;
            }
            if($('#name-input').val() == ''){
                var msg = "Name should not be empty";
                toastr.options = {
                    closeButton: true,
                    progressBar: true,
                    showMethod: 'slideDown',
                    timeOut: 4000
                };
                toastr.error('', msg);
                registering = false;
                return;
            }
            if($('#serial-input').val() == ''){
                var msg = "Serial number should not be empty";
                toastr.options = {
                    closeButton: true,
                    progressBar: true,
                    showMethod: 'slideDown',
                    timeOut: 4000
                };
                toastr.error('', msg);
                registering = false;
                return;
            }

            if($('#app-version-input').val() == ''){
                var msg = "App version should not be empty";
                toastr.options = {
                    closeButton: true,
                    progressBar: true,
                    showMethod: 'slideDown',
                    timeOut: 4000
                };
                toastr.error('', msg);
                registering = false;
                return;
            }

            if($('#lp-lat').val() == '' && $('#lp-lon').val() == ''){
                var msg = "Location required";
                toastr.options = {
                    closeButton: true,
                    progressBar: true,
                    showMethod: 'slideDown',
                    timeOut: 4000
                };
                toastr.error('', msg);
                registering = false;
                return;
            }

            $('#wizard a[href="#finish"]').html('Registering...');

            $.ajax({
                method: 'POST',
                url: 'http://192.168.100.50:8000/rv1/device',
                beforeSend: function(request) {
                    request.setRequestHeader("X-Token", getCookie('token'));
                },
                data: deviceData,
                success: function(data, status, xhr){
                    //console.log(data);
                    if(data.status==200 && data.message=="OK"){
                        $('form')[0].reset();
                        var msg = "New device";
                        toastr.options = {
                            closeButton: true,
                            progressBar: true,
                            showMethod: 'slideDown',
                            timeOut: 4000
                        };
                        toastr.success("has been inserted", msg);
                        refreshDeviceTableData();
                        setNewDeviceBtn();
                    } else {
                        var msg = "Sorry but there was an error: ";
                        toastr.options = {
                            closeButton: true,
                            progressBar: true,
                            showMethod: 'slideDown',
                            timeOut: 4000
                        };
                        toastr.error(data.trace, msg);
                        $('#wizard a[href="#finish"]').html('Register');
                        registering = false;
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
                        $('#wizard a[href="#finish"]').html('Register');
                        registering = false;
                    }
                    
                }
            });
        } else {
            $('#wizard a[href="#finish"]').html('Updating...');
            // update existing record? roger.
            $.ajax({
                method: 'PUT',
                url: 'http://192.168.100.50:8000/rv1/device/' + localData.updateDevice._id,
                beforeSend: function(request) {
                    request.setRequestHeader("X-Token", getCookie('token'));
                },
                data: deviceData,
                success: function(data, status, xhr){
                    //console.log(data);
                    if(data.status==200 && data.message=="OK"){
                        $('form')[0].reset();
                        var msg = localData.updateDevice.name;
                        toastr.options = {
                            closeButton: true,
                            progressBar: true,
                            showMethod: 'slideDown',
                            timeOut: 4000
                        };
                        toastr.success("has been updated", msg);
                        refreshDeviceTableData();
                        setNewDeviceBtn();
                    } else {
                        var msg = "Sorry but there was an error: ";
                        toastr.options = {
                            closeButton: true,
                            progressBar: true,
                            showMethod: 'slideDown',
                            timeOut: 4000
                        };
                        toastr.error(data.trace, msg);
                        $('#wizard a[href="#finish"]').html('Update');
                        registering = false;
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
                        $('#wizard a[href="#finish"]').html('Update');
                        registering = false;
                    }
                }
            });
        }
    });

    $('#device-list-table').on('click', '.btn-device-edit', function(){
        var id = $(this).attr('deviceid');
        var obj = localData.device.data.find(function(element){
            return element._id == id;
        });
        console.log(obj);
        setNewDeviceBtn(obj);
    });

    $('#device-list-table').on('click', '.btn-device-delete', function(){
        var id = $(this).attr('deviceid');
        var obj = localData.device.data.find(function(element){
            return element._id == id;
        });

        $('#deleteDeviceModal .modal-footer>button[confirm]').attr('deviceid', id);

        $('#deleteDeviceModal h4.modal-title').html('Delete Confirmation');
        $('#deleteDeviceModal div.modal-body').html('Are you sure you want to delete this device? <h3>'+obj.name+'</h3>');
        
    });

    $('#deleteDeviceModal .modal-footer>button[confirm]').on('click', function(){
        var _el = $(this)
        _el.html('Deleting...');
        _el.attr('disabled', 'disabled');
        var id = $(this).attr('deviceid');
        var obj = localData.device.data.find(function(element){
            return element._id == id;
        });
        $.ajax({
            method: 'DELETE',
            url: 'http://192.168.100.50:8000/rv1/device/' + id,
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
                    refreshDeviceTableData();
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
                $('#deleteDeviceModal').modal('hide');
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
                    $('#deleteDeviceModal').modal('hide');
                }
            }
        });
    });
}