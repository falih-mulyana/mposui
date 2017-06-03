console.log('menus_and_items script loaded');

var setNewItemPriceBtn = function(_itemPriceObj){
    if(typeof _itemPriceObj === "undefined"){
        $('#item-form-title').html('Register New Item');
        $('#new-itemPrice-btn strong').html('Register');
        $('#code-input').val('');
        $('#name-input').val('');
        $('#price-input').val('');
        $('#new-itemPrice-btn').attr('disabled', 'disabled');
        delete localData.updateItemPrice;
    } else {
        localData.updateItemPrice = _itemPriceObj;
        $('#item-form-title').html('Editing ' + _itemPriceObj.item.code);
        $('#new-itemPrice-btn strong').html('Update');
        $('#new-itemPrice-btn').removeAttr('disabled');
        // populate form with existing object
        $('#itemId-input').val(_itemPriceObj._id);
        $('#code-input').val(_itemPriceObj.item.code);
        $('#name-input').val(_itemPriceObj.item.name);
        $('#price-input').val(_itemPriceObj.value);

    }
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

    loadItems(localData.parentOrg._id, function(error, data){
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

var refreshItemPriceTableData = function(){
    //disable any elements that may invoke server request
    $('#itemPrice-table-server-refresh').attr('disabled', 'disabled');
    $('#itemPrice-table-server-refresh').html('<span class="glyphicon glyphicon-refresh"></span> Reloading...');
    $('#itemPrice-table-server-pagesize').attr('disabled', 'disabled');
    $('#itemPrice-table-server-filter').attr('disabled', 'disabled');
    $('#itemPrice-table-server-previous').attr('disabled', 'disabled');
    $('#itemPrice-table-server-next').attr('disabled', 'disabled');

    loadItemPrice(function(error, data){
        if(!error){
            // re-enable the elements
            $('#itemPrice-table-server-refresh').removeAttr('disabled');
            $('#itemPrice-table-server-refresh').html('<span class="glyphicon glyphicon-refresh"></span> Refresh Data');
            $('#itemPrice-table-server-pagesize').removeAttr('disabled');
            $('#itemPrice-table-server-filter').removeAttr('disabled');
            $('#itemPrice-table-server-previous').removeAttr('disabled');
            $('#itemPrice-table-server-next').removeAttr('disabled');

            configTableItemPrices();
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

                $('#item-table-server-refresh').on('click', function(){
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

        
        
        var additional_el = '<a class="btn btn-primary btn-item-edit" itemid="'+localData.item.raw.data[i]._id+'"><span class="glyphicon glyphicon-plus"></span> Register Item</a>';

        table.DataTable().row.add([localData.item.raw.data[i].code, name, localData.item.raw.data[i].itemTag.name, additional_el]);
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

var configTableItemPrices = function(){
    var table = $('#itemPrice-list-table');
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
                $("[name='itemPrice-list-table_length']").addClass('hidden');
                // make our own that identical to it
                $("[name='itemPrice-list-table_length']").after('<select id="itemPrice-table-server-pagesize" class="form-control input-sm"><option value="10">10</option><option value="25">25</option><option value="50">50</option></select>');
                // trigger the selection base on pageSize global variable
                $("#itemPrice-table-server-pagesize").val(localData.itemPrice.raw.property.paging.limit).trigger('change');
                // add manual refresh button
                $("#itemPrice-table-server-pagesize").parent().after('<a id="itemPrice-table-server-refresh" style="margin: 0 0 0 20px;" class="btn btn-info"><span class="glyphicon glyphicon-refresh"></span> Refresh Data</a>');
                // config the change event on the element
                $("#itemPrice-table-server-pagesize").on('change', function(){
                    localData.itemPrice.raw.property.paging.limit = parseInt($(this).val());
                    localData.itemPrice.raw.property.paging.page = 1;
                    console.log(localData.itemPrice.raw.property.paging.limit);
                    refreshItemPriceTableData();
                });

                $('#itemPrice-table-server-refresh').on('click', function(){
                    refreshItemPriceTableData();
                });

                $('#itemPrice-list-table_filter input[type="search"]').addClass('hidden');
                $('#itemPrice-list-table_filter input[type="search"]').after('<input class="form-control" id="itemPrice-table-server-filter" type="text">');
                $('#itemPrice-table-server-filter').val(typeof localData.itemPrice.searchparam === 'undefined'? '':localData.itemPrice.searchparam);
                $('#itemPrice-table-server-filter').on('keypress', function(e){
                    if(e.which == 13) {
                        if($('#itemPrice-table-server-filter').val() !== ''){
                            localData.itemPrice.searchparam = $('#itemPrice-table-server-filter').val();
                            console.log(localData.itemPrice.searchparam);
                        } else {
                            delete localData.itemPrice.searchparam;
                        }
                        refreshItemPriceTableData();
                    }
                });

            }
        });
    }

    // clear previous rows
    table.DataTable().clear();

    // populate ze rows
    for(i=0; i<localData.itemPrice.raw.data.length; i++){
        //var type = 'undefined';
        var name = '';

        if(localData.itemPrice.raw.data[i].item.hasOwnProperty('name')){
            name = localData.itemPrice.raw.data[i].item.name;
        }

        
        
        var additional_el = '<a class="btn btn-primary btn-itemPrice-edit" itempriceid="'+localData.itemPrice.raw.data[i]._id+'"><span class="glyphicon glyphicon-pencil"></span></a><a class="btn btn-danger btn-itemPrice-delete" data-toggle="modal" data-target="#deleteItemPriceModal" itempriceid="'+localData.itemPrice.raw.data[i]._id+'"><span class="glyphicon glyphicon-remove-circle"></span></a>';

        table.DataTable().row.add([localData.itemPrice.raw.data[i].item.code, name, localData.itemPrice.raw.data[i].value, additional_el]);
    }

    // redraw ze rows
    table.DataTable().draw();

    //// because how Datatables redraw its elements on every page changes, 
    //// not all additional elements declared on initComplete function above.
    //// instead, we declare them on every data changes (when configTableMerchant is called)
    $('#itemPrice-list-table_wrapper .pagination').addClass('hidden');
    $('#itemPrice-list-table_wrapper .pagination').after('<ul class="pagination"><li class="paginate_button previous"><button id="itemPrice-table-server-previous" class="btn btn-default">Previous</button></li><li class="paginate_button next"><button id="itemPrice-table-server-next" class="btn btn-default">Next</button></li></ul>');
    
    $('#itemPrice-table-server-previous').on('click', function(){
        if(localData.itemPrice.raw.property.paging.page > 1){
            localData.itemPrice.raw.property.paging.page = localData.itemPrice.raw.property.paging.page-1;
            refreshItemPriceTableData();
        }
    })
    $('#itemPrice-table-server-next').on('click', function(){
        if(localData.itemPrice.raw.property.total > localData.itemPrice.raw.property.paging.limit*localData.itemPrice.raw.property.paging.page){
            localData.itemPrice.raw.property.paging.page = localData.itemPrice.raw.property.paging.page+1;
            refreshItemPriceTableData();
        }
    });
    $('#itemPrice-list-table_info').html('Showing '+ ((localData.itemPrice.raw.property.paging.page-1)*localData.itemPrice.raw.property.paging.limit+1) +' to '+ (localData.itemPrice.raw.property.paging.limit*localData.itemPrice.raw.property.paging.page < localData.itemPrice.raw.property.total? localData.itemPrice.raw.property.paging.limit*localData.itemPrice.raw.property.paging.page:localData.itemPrice.raw.property.total) +' of <strong>'+ localData.itemPrice.raw.property.total +'</strong> entries');
}

var loadParentOrg = function(_orgId, cb){
    $.ajax({
        method: 'GET',
        url: 'http://192.168.100.50:8000/rv1/org/' + _orgId,
        beforeSend: function(request) {
            request.setRequestHeader("X-Token", getCookie('token'));
        },
        success: function(data, status, xhr){
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

var loadItemPrice = function(cb){
    var params = '';
    try {
        var searchkey = typeof localData.itemPrice.searchparam === 'undefined'?'':localData.itemPrice.searchparam;
        params = '&and={%22org._id%22:%22'+getCookie('orgid')+'%22,%22name%22:%27%27*'+searchkey+'*%27%27}&page='+localData.org.property.paging.page+'&limit='+localData.org.property.paging.limit;
    } catch(err) {
        console.log('seems like org object not yet initialized');
        params = '&and={"org._id":"'+getCookie('orgid')+'"}';
    }

    $.ajax({
        method: 'GET',
        url: 'http://192.168.100.50:8000/rv1/itemPrice?populate=org._id,item._id'+params,
        beforeSend: function(request) {
            request.setRequestHeader("X-Token", getCookie('token'));
        },
        success: function(data, status, xhr){
            // retrieve the searchparam first before replace
            var _param = null;
            if(typeof localData.itemPrice !== 'undefined'){
                if(typeof localData.itemPrice.searchparam !== 'undefined'){
                    _param = localData.itemPrice.searchparam;
                }  
            }
            
            localData.itemPrice.raw = data;
            if(_param!==null) localData.itemPrice.searchparam = _param;
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

init.menus_and_items = function(cb){
    localData.itemPrice = {};
	localData.item = {};
    loadParentOrg(getCookie('orgid'), function(error, data){
        if(!error){
            localData.parentOrg = data.data.org;
            loadItems(localData.parentOrg._id, function(error, data){
                if(!error){
                    loadItemPrice(function(error, data){
                        if(!error){
                            cb({success: true}); 
                        } else {
                            cb({success: false, message: 'failed to get item price data'}); 
                        }
                    });
                } else {
                    cb({success: false, message: 'failed to get item data'}); 
                }
            });
        } else {
            cb({success: false, message: 'failed to get organization data'}); 
        }
    });
}

populate.menus_and_items = function(){
	if(typeof localData.updateItemPrice === 'undefined'){
        setNewItemPriceBtn();
    } else {
        setNewItemPriceBtn(localData.updateItemPrice);
    }

    configTableItems();
    configTableItemPrices();

    $('#new-itemPrice-btn').on('click', function(e){
        e.preventDefault();

        var itemPriceData = {
            item: {
                _id: $('#itemId-input').val()
            },
            org: {
                _id: getCookie('orgid')
            }
        };
        if($('#price-input').val() != ''){
            itemPriceData.value = $('#price-input').val();
        }
        
        // this is either register button or update button according to the context
        if(typeof localData.updateItemPrice === 'undefined'){
            // so this is a new record, huh? aight.
            $('#new-itemPrice-btn strong').html('Registering...');
            $('#new-itemPrice-btn').attr('disabled', 'disabled');

            $.ajax({
                method: 'POST',
                url: 'http://192.168.100.50:8000/rv1/itemPrice',
                beforeSend: function(request) {
                    request.setRequestHeader("X-Token", getCookie('token'));
                },
                data: itemPriceData,
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
                        toastr.success("has been registered", msg);
                        refreshItemPriceTableData();
                        setNewItemPriceBtn();
                    } else {
                        var msg = "Sorry but there was an error: ";
                        toastr.options = {
                            closeButton: true,
                            progressBar: true,
                            showMethod: 'slideDown',
                            timeOut: 4000
                        };
                        toastr.error(data.trace, msg);
                        $('#new-itemPrice-btn strong').html('Register');
                        $('#new-itemPrice-btn').removeAttr('disabled');
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
                        $('#new-itemPrice-btn strong').html('Register');
                        $('#new-itemPrice-btn').removeAttr('disabled');
                    }
                    
                }
            });
        } else {
            // update existing record? roger.
            $('#new-itemPrice-btn strong').html('Updating...');
            $('#new-itemPrice-btn').attr('disabled', 'disabled');
            $.ajax({
                method: 'PUT',
                url: 'http://192.168.100.50:8000/rv1/itemPrice/' + localData.updateItemPrice._id,
                beforeSend: function(request) {
                    request.setRequestHeader("X-Token", getCookie('token'));
                },
                data: itemPriceData,
                success: function(data, status, xhr){
                    //console.log(data);
                    if(data.status==200 && data.message=="OK"){
                        $('form')[0].reset();
                        var msg = localData.updateItemPrice.item.code;
                        toastr.options = {
                            closeButton: true,
                            progressBar: true,
                            showMethod: 'slideDown',
                            timeOut: 4000
                        };
                        toastr.success("has been updated", msg);
                        refreshItemPriceTableData();
                        setNewItemPriceBtn();
                    } else {
                        var msg = "Sorry but there was an error: ";
                        toastr.options = {
                            closeButton: true,
                            progressBar: true,
                            showMethod: 'slideDown',
                            timeOut: 4000
                        };
                        toastr.error(data.trace, msg);
                        $('#new-itemPrice-btn strong').html('Update');
                        $('#new-itemPrice-btn').removeAttr('disabled');
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
                        $('#new-itemPrice-btn strong').html('Update');
                        $('#new-itemPrice-btn').removeAttr('disabled');
                    }
                }
            });
        }
    
    });

    $('#itemPrice-list-table').on('click', '.btn-itemPrice-edit', function(){
        var id = $(this).attr('itempriceid');
        var obj = localData.itemPrice.raw.data.find(function(element){
            return element._id == id;
        });
        console.log(obj);
        setNewItemPriceBtn(obj);
    });

    $('#item-list-table').on('click', '.btn-item-edit', function(){
        var id = $(this).attr('itemid');
        var obj = localData.item.raw.data.find(function(element){
            return element._id == id;
        });
        
        $('#itemId-input').val(obj._id);
        $('#code-input').val(obj.code);
        $('#name-input').val(obj.name);

        $('#new-itemPrice-btn').removeAttr('disabled');
    });

    $('#itemPrice-list-table').on('click', '.btn-itemPrice-delete', function(){
        var id = $(this).attr('itempriceid');
        var obj = localData.itemPrice.raw.data.find(function(element){
            return element._id == id;
        });
        console.log(obj);
        $('#deleteItemPriceModal .modal-footer>button[confirm]').attr('itempriceid', id);

        $('#deleteItemPriceModal h4.modal-title').html('Delete Confirmation');
        $('#deleteItemPriceModal div.modal-body').html('Are you sure you want to unregister this item? <h3>'+obj.item.code+'</h3>');
        
    });

    $('#deleteItemPriceModal .modal-footer>button[confirm]').on('click', function(){
        var _el = $(this)
        _el.html('Deleting...');
        _el.attr('disabled', 'disabled');
        var id = $(this).attr('itempriceid');
        var obj = localData.itemPrice.raw.data.find(function(element){
            return element._id == id;
        });
        $.ajax({
            method: 'DELETE',
            url: 'http://192.168.100.50:8000/rv1/itemPrice/' + id,
            beforeSend: function(request) {
                request.setRequestHeader("X-Token", getCookie('token'));
            },
            success: function(data, status, xhr){
                //console.log(data);
                if(data.status==200 && data.message=="OK"){
                    var msg = obj.item.code;
                    toastr.options = {
                        closeButton: true,
                        progressBar: true,
                        showMethod: 'slideDown',
                        timeOut: 4000
                    };
                    toastr.success("has been unregistered", msg);
                    refreshItemPriceTableData();
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
                $('#deleteItemPriceModal').modal('hide');
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
                    $('#deleteItemPriceModal').modal('hide');
                }
                
            }
        });
    });

    $('#reset-itemPrice-btn').on('click', function(){
        setNewItemPriceBtn();
    });
}