console.log('menus_and_items script loaded');

var setNewItemBtn = function(_itemObj){
    if(typeof _itemObj === "undefined"){
        $('#item-form-title').html('Create New Item');
        $('#new-item-btn strong').html('Register');
        
        delete localData.updateItem;
    } else {
        localData.updateItem = _itemObj;
        $('#item-form-title').html('Editing ' + _itemObj.code);
        $('#new-item-btn strong').html('Update');

        // populate form with existing object
        $('#code-input').val(_itemObj.code);
        $('#name-input').val(_itemObj.name);

        // manually add data to the Select2 component and select it
        var newOption = new Option(_itemObj.itemTag.name, _itemObj.itemTag._id, true, true);
        $("#select-itemtag-item").append(newOption).trigger('change');
        //var newOption = new Option("cannot be changed", null, true, true);
        //$("#select-holder-item").append(newOption).trigger('change');
        //$("#select-merchant-item").append(newOption).trigger('change');
        //$("#select-holder-item").attr('disabled', 'disabled');
        //$("#select-merchant-item").attr('disabled', 'disabled');
    }

    // check selected holder
    if($('#select-holder-item').val() !== null){
        $('#new-item-btn').removeAttr('disabled');
    }
}

var configSelectHolderItem = function(){
    $("#select-holder-item").select2({
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

    $("#select-holder-item").on('change', function(){
        if($(this).val() !== null){
            localData.item.searchFromHolder = {
                id: $("#select-holder-item").val(),
                name: $("#select-holder-item").select2('data')[0].name || $("#select-holder-item").select2('data')[0].text
            }
            //configSelectMerchantItem();
            refreshItemTableData();
            configSelectItemTagItem();

            //$('#new-merchant-btn').removeAttr('disabled');
        } else {
            delete localData.item.searchFromHolder;
            // check existing select2 element and destroy it if any
            /*if ($('#select-merchant-item').hasClass("select2-hidden-accessible")) {
                $("#select-merchant-item").select2('destroy'); 
            }

            $('#new-merchant-btn').attr('disabled', 'disabled');*/
        }
    });
}

/*var configSelectMerchantItem = function(){
    $("#select-merchant-item").select2({
        ajax: {
            url: 'http://192.168.100.50:8000/rv1/org',
            dataType: 'json',
            delay: 500,
            beforeSend: function(request) {
                request.setRequestHeader("X-Token", getCookie('token'));
            },
            data: function (params) {
                return {
                    and: '{"org._id":"'+localData.item.searchFromHolder.id+'","name":\'\'*'+params.term+'*\'\'}', // search term
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
            cache: true
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

    $("#select-merchant-item").on('change', function(){
        if($(this).val() !== null){
            localData.item.searchFromMerchant = {
                id: $("#select-merchant-item").val(),
                name: $("#select-merchant-item").select2('data')[0].name || $("#select-merchant-item").select2('data')[0].text
            }
            
            refreshItemTableData();
        } else {
            delete localData.item.searchFromMerchant;
        }
    });
}*/

var configSelectItemTagItem = function(){
    $("#select-itemtag-item").select2({
        ajax: {
            url: 'http://192.168.100.50:8000/rv1/itemTag',
            dataType: 'json',
            delay: 500,
            beforeSend: function(request) {
                request.setRequestHeader("X-Token", getCookie('token'));
            },
            data: function (params) {
                return {
                    and: '{"org._id":"'+localData.item.searchFromHolder.id+'","name":\'\'*'+params.term+'*\'\'}', // search term
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
            cache: true
        },
        templateResult: function(data){
           return data.name || data.text;
        },
        templateSelection: function(data){
            return data.name || data.text;
        },
        placeholder: "Select Item tag",
        minimumInputLength: 3,
        allowClear: true
    });

    $("#select-itemtag-item").on('change', function(){
        if($(this).val() !== null){
            localData.item.searchFromItemTag = {
                id: $("#select-itemtag-item").val(),
                name: $("#select-itemtag-item").select2('data')[0].name || $("#select-itemtag-item").select2('data')[0].text
            }
        } else {
            delete localData.item.searchFromItemTag;
        }
    });
}

var loadItems = function(_orgid, cb){
    var params = '';
    try {
        var searchkey = typeof localData.item.searchparam === 'undefined'?'':localData.item.searchparam;
        params = '&and={"org._id":"'+_orgid+'","name":%27%27*'+searchkey+'*%27%27}&page='+localData.item.raw.property.paging.page+'&limit='+localData.item.raw.property.paging.limit;
    } catch(err) {
        console.log('seems like item object not yet initialized');
        params = '&and={"org._id":"'+_orgid+'"}';
    }

    $.ajax({
        method: 'GET',
        url: 'http://192.168.100.50:8000/rv1/item?populate=org._id,itemTag._id'+params,
        beforeSend: function(request) {
            request.setRequestHeader("X-Token", getCookie('token'));
        },
        success: function(data, status, xhr){
            // retrieve the searchparam first before replace
            var _param = null;
            if(typeof localData.item !== 'undefined'){
                if(typeof localData.item.searchparam !== 'undefined'){
                    _param = localData.item.searchparam;
                }  
            }
            
            localData.item.raw = data;
            if(_param!==null) localData.item.searchparam = _param;
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

var refreshItemTableData = function(){
    //disable any elements that may invoke server request
    $('#item-table-server-refresh').attr('disabled', 'disabled');
    $('#item-table-server-refresh').html('<span class="glyphicon glyphicon-refresh"></span> Reloading...');
    $('#item-table-server-pagesize').attr('disabled', 'disabled');
    $('#item-table-server-filter').attr('disabled', 'disabled');
    $('#item-table-server-previous').attr('disabled', 'disabled');
    $('#item-table-server-next').attr('disabled', 'disabled');

    loadItems(localData.item.searchFromHolder.id, function(error, data){
        if(!error){
            // re-enable the elements
            $('#item-table-server-refresh').removeAttr('disabled');
            $('#item-table-server-refresh').html('<span class="glyphicon glyphicon-refresh"></span> Refresh Data');
            $('#item-table-server-pagesize').removeAttr('disabled');
            $('#item-table-server-filter').removeAttr('disabled');
            $('#item-table-server-previous').removeAttr('disabled');
            $('#item-table-server-next').removeAttr('disabled');

            configTableItems();
        }
    });
}

var configTableItems = function(){
    var table = $('#item-list-table');
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
                $("[name='item-list-table_length']").addClass('hidden');
                // make our own that identical to it
                $("[name='item-list-table_length']").after('<select id="item-table-server-pagesize" class="form-control input-sm"><option value="10">10</option><option value="25">25</option><option value="50">50</option></select>');
                // trigger the selection base on pageSize global variable
                $("#item-table-server-pagesize").val(localData.item.raw.property.paging.limit).trigger('change');
                // add manual refresh button
                $("#item-table-server-pagesize").parent().after('<a id="item-table-server-refresh" style="margin: 0 0 0 20px;" class="btn btn-info"><span class="glyphicon glyphicon-refresh"></span> Refresh Data</a>');
                // config the change event on the element
                $("#item-table-server-pagesize").on('change', function(){
                    localData.item.raw.property.paging.limit = parseInt($(this).val());
                    localData.item.raw.property.paging.page = 1;
                    console.log(localData.item.raw.property.paging.limit);
                    refreshItemTableData();
                });

                $('#merchant-table-server-refresh').on('click', function(){
                    refreshItemTableData();
                });

                $('#item-list-table_filter input[type="search"]').addClass('hidden');
                $('#item-list-table_filter input[type="search"]').after('<input class="form-control" id="item-table-server-filter" type="text">');
                $('#item-table-server-filter').val(typeof localData.item.searchparam === 'undefined'? '':localData.item.searchparam);
                $('#item-table-server-filter').on('keypress', function(e){
                    if(e.which == 13) {
                        if($('#item-table-server-filter').val() !== ''){
                            localData.item.searchparam = $('#item-table-server-filter').val();
                            console.log(localData.item.searchparam);
                        } else {
                            delete localData.item.searchparam;
                        }
                        refreshItemTableData();
                    }
                });

            }
        });
    }

    // clear previous rows
    table.DataTable().clear();

    // populate ze rows
    for(i=0; i<localData.item.raw.data.length; i++){
        //var type = 'undefined';
        var name = '';

        if(localData.item.raw.data[i].hasOwnProperty('name')){
            name = localData.item.raw.data[i].name;
        }

        
        
        var additional_el = '<a class="btn btn-primary btn-item-edit" itemid="'+localData.item.raw.data[i]._id+'"><span class="glyphicon glyphicon-pencil"></span></a><a class="btn btn-danger btn-item-delete" data-toggle="modal" data-target="#deleteItemModal" itemid="'+localData.item.raw.data[i]._id+'"><span class="glyphicon glyphicon-remove-circle"></span></a>';

        table.DataTable().row.add([localData.item.raw.data[i].code, name, localData.item.raw.data[i].org.name, localData.item.raw.data[i].itemTag.name, additional_el]);
    }

    // redraw ze rows
    table.DataTable().draw();

    //// because how Datatables redraw its elements on every page changes, 
    //// not all additional elements declared on initComplete function above.
    //// instead, we declare them on every data changes (when configTableMerchant is called)
    $('#item-list-table_wrapper .pagination').addClass('hidden');
    $('#item-list-table_wrapper .pagination').after('<ul class="pagination"><li class="paginate_button previous"><button id="item-table-server-previous" class="btn btn-default">Previous</button></li><li class="paginate_button next"><button id="item-table-server-next" class="btn btn-default">Next</button></li></ul>');
    
    $('#item-table-server-previous').on('click', function(){
        if(localData.item.raw.property.paging.page > 1){
            localData.item.raw.property.paging.page = localData.item.raw.property.paging.page-1;
            refreshItemTableData();
        }
    })
    $('#item-table-server-next').on('click', function(){
        if(localData.item.raw.property.total > localData.item.raw.property.paging.limit*localData.item.raw.property.paging.page){
            localData.item.raw.property.paging.page = localData.item.raw.property.paging.page+1;
            refreshItemTableData();
        }
    });
    $('#item-list-table_info').html('Showing '+ ((localData.item.raw.property.paging.page-1)*localData.item.raw.property.paging.limit+1) +' to '+ (localData.item.raw.property.paging.limit*localData.item.raw.property.paging.page < localData.item.raw.property.total? localData.item.raw.property.paging.limit*localData.item.raw.property.paging.page:localData.item.raw.property.total) +' of <strong>'+ localData.item.raw.property.total +'</strong> entries');  
}



init.menus_and_items = function(cb){
	localData.item = {};
    cb({success: true});
}

populate.menus_and_items = function(){
	if(typeof localData.updateItem === 'undefined'){
        setNewItemBtn();
    } else {
        setNewItemBtn(localData.updateItem);
    }

    // config select holder element
    configSelectHolderItem();

    $('#newtagmodal .modal-footer>button[confirm]').on('click', function(){
        var _el = $(this);
        _el.html('Creating...');
        _el.attr('disabled', 'disabled');
        var newItemTagName = $('#input-new-itemtag').val();
 
        $.ajax({
            method: 'POST',
            url: 'http://192.168.100.50:8000/rv1/itemTag',
            data: {
                name: newItemTagName,
                'org._id': $('#select-holder-item').val()
            },
            beforeSend: function(request) {
                request.setRequestHeader("X-Token", getCookie('token'));
            },
            success: function(data, status, xhr){
                //console.log(data);
                if(data.status==200 && data.message=="OK"){
                    var msg = "New item tag";
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
                $('#newtagmodal').modal('hide');
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
                    $('#newtagmodal').modal('hide');
                }

            }
        });
    });

    $('#new-item-btn').on('click', function(e){
        e.preventDefault();

        var itemData = {};

        if($('#select-holder-item').val() !== null && $('#select-holder-item').val() !== 'null'){
            itemData.org = {
                _id : $('#select-holder-item').val()
            }
        }
        if($('#code-input').val() != ''){
            itemData.code = $('#code-input').val();
        }
        if($('#name-input').val() != ''){
            itemData.name = $('#name-input').val();
        }
        if($('#select-itemtag-item').val() !== null && $('#select-itemtag-item').val() !== 'null'){
            itemData.itemTag = {
                _id : $('#select-itemtag-item').val()
            }
        }
        
        // this is either register button or update button according to the context
        if(typeof localData.updateItem === 'undefined'){
            // so this is a new record, huh? aight.
            $('#new-item-btn strong').html('Registering...');
            $('#new-item-btn').attr('disabled', 'disabled');

            $.ajax({
                method: 'POST',
                url: 'http://192.168.100.50:8000/rv1/item',
                beforeSend: function(request) {
                    request.setRequestHeader("X-Token", getCookie('token'));
                },
                data: itemData,
                success: function(data, status, xhr){
                    //console.log(data);
                    if(data.status==200 && data.message=="OK"){
                        $('form')[0].reset();
                        var msg = "New item";
                        toastr.options = {
                            closeButton: true,
                            progressBar: true,
                            showMethod: 'slideDown',
                            timeOut: 4000
                        };
                        toastr.success("has been inserted", msg);
                        refreshItemTableData();
                        setNewItemBtn();
                    } else {
                        var msg = "Sorry but there was an error: ";
                        toastr.options = {
                            closeButton: true,
                            progressBar: true,
                            showMethod: 'slideDown',
                            timeOut: 4000
                        };
                        toastr.error(data.trace, msg);
                        $('#new-item-btn strong').html('Register');
                        $('#new-item-btn').removeAttr('disabled');
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
                        $('#new-item-btn strong').html('Register');
                        $('#new-item-btn').removeAttr('disabled');
                    }
                    
                }
            });
        } else {
            // update existing record? roger.
            $('#new-item-btn strong').html('Updating...');
            $('#new-item-btn').attr('disabled', 'disabled');
            $.ajax({
                method: 'PUT',
                url: 'http://192.168.100.50:8000/rv1/item/' + localData.updateItem._id,
                beforeSend: function(request) {
                    request.setRequestHeader("X-Token", getCookie('token'));
                },
                data: itemData,
                success: function(data, status, xhr){
                    //console.log(data);
                    if(data.status==200 && data.message=="OK"){
                        $('form')[0].reset();
                        var msg = localData.updateItem.code;
                        toastr.options = {
                            closeButton: true,
                            progressBar: true,
                            showMethod: 'slideDown',
                            timeOut: 4000
                        };
                        toastr.success("has been updated", msg);
                        refreshItemTableData();
                        setNewItemBtn();
                    } else {
                        var msg = "Sorry but there was an error: ";
                        toastr.options = {
                            closeButton: true,
                            progressBar: true,
                            showMethod: 'slideDown',
                            timeOut: 4000
                        };
                        toastr.error(data.trace, msg);
                        $('#new-item-btn strong').html('Update');
                        $('#new-item-btn').removeAttr('disabled');
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
                        $('#new-item-btn strong').html('Update');
                        $('#new-item-btn').removeAttr('disabled');
                    }
                }
            });
        }
    
    });

    $('#item-list-table').on('click', '.btn-item-edit', function(){
        var id = $(this).attr('itemid');
        var obj = localData.item.raw.data.find(function(element){
            return element._id == id;
        });
        console.log(obj);
        setNewItemBtn(obj);
    });

    $('#item-list-table').on('click', '.btn-item-delete', function(){
        var id = $(this).attr('itemid');
        var obj = localData.item.raw.data.find(function(element){
            return element._id == id;
        });

        $('#deleteItemModal .modal-footer>button[confirm]').attr('itemid', id);

        $('#deleteItemModal h4.modal-title').html('Delete Confirmation');
        $('#deleteItemModal div.modal-body').html('Are you sure you want to delete this item? <h3>'+obj.code+'</h3>');
        
    });

    $('#deleteItemModal .modal-footer>button[confirm]').on('click', function(){
        var _el = $(this)
        _el.html('Deleting...');
        _el.attr('disabled', 'disabled');
        var id = $(this).attr('itemid');
        var obj = localData.item.raw.data.find(function(element){
            return element._id == id;
        });
        $.ajax({
            method: 'DELETE',
            url: 'http://192.168.100.50:8000/rv1/item/' + id,
            beforeSend: function(request) {
                request.setRequestHeader("X-Token", getCookie('token'));
            },
            success: function(data, status, xhr){
                //console.log(data);
                if(data.status==200 && data.message=="OK"){
                    var msg = obj.code;
                    toastr.options = {
                        closeButton: true,
                        progressBar: true,
                        showMethod: 'slideDown',
                        timeOut: 4000
                    };
                    toastr.success("has been deleted", msg);
                    refreshItemTableData();
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
                $('#deleteItemModal').modal('hide');
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
                    $('#deleteItemModal').modal('hide');
                }
                
            }
        });
    });

    $('#reset-item-btn').on('click', function(){
        setNewItemBtn();
    });
}