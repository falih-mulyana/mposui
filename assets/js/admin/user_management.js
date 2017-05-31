console.log('user_management script loaded');

var setNewUserBtn = function(_usrObj){
    if(typeof _usrObj === "undefined"){
        $('#user-form-title').html('Create New User');
        $('#new-user-btn strong').html('Register');
        $('#email-input').attr('placeholder', 'Email');
        $('#phone-input').attr('placeholder', '+6281234567');
        $('#username-input').attr('placeholder', 'username to be logged in');
        $('#email-input').attr('placeholder', 'email');
        $('#idnumber-input').attr('placeholder', 'e.g. driver license, passport');
        // check existing select2 element and destroy it if any
        if ($('#select-holder-user').hasClass("select2-hidden-accessible")) {
            $("#select-holder-user").select2("val", ""); 
        }
        
        $("#select-holder-user").removeAttr('disabled');
        $("#select-merchant-user").removeAttr('disabled');
        $("#select-holder-user").html('');
        $("#select-merchant-user").html('');
        delete localData.updateUser;
    } else {
        localData.updateUser = _usrObj;
        $('#user-form-title').html('Editing ' + _usrObj.username);
        $('#new-user-btn strong').html('Update');

        // populate form with existing object
        $('#first-name-input').val(typeof _usrObj.name === 'undefined'? '' : typeof _usrObj.name.first === 'undefined'? '' : _usrObj.name.first);
        $('#last-name-input').val(typeof _usrObj.name === 'undefined'? '' : typeof _usrObj.name.last === 'undefined'? '' : _usrObj.name.last);
        $('#username-input').val('');
        $('#username-input').attr('placeholder', 'unchanged (' + _usrObj.username + ')');
        $('#email-input').val('');
        $('#email-input').attr('placeholder', 'unchanged (' + (typeof _usrObj.email === 'undefined'? 'not defined' : _usrObj.email.value) + ')');
        $('#idnumber-input').val('');
        $('#idnumber-input').attr('placeholder', 'unchanged (' + _usrObj.nin + ')');
        if(_usrObj.sex == "male"){
            $('input[value="male"]').iCheck('check');
        } else {
            $('input[value="female"]').iCheck('check');
        }
        // manually add data to the Select2 component and select it
        var newOption = new Option("cannot be changed", null, true, true);
        $("#select-holder-user").append(newOption).trigger('change');
        $("#select-merchant-user").append(newOption).trigger('change');
        $("#select-identity-type").val(_usrObj.notes).trigger('change');
        $("#select-holder-user").attr('disabled', 'disabled');
        $("#select-merchant-user").attr('disabled', 'disabled');

        $('#phone-input').val('');
        $('#phone-input').attr('placeholder', 'unchanged (' + (typeof _usrObj.phone === 'undefined'? 'not defined':_usrObj.phone.value) + ')');
    }

    $('#new-user-btn').removeAttr('disabled');
}

var refreshUserTableData = function(){
    //disable any elements that may invoke server request
    $('#user-table-server-refresh').attr('disabled', 'disabled');
    $('#user-table-server-refresh').html('<span class="glyphicon glyphicon-refresh"></span> Reloading...');
    $('#user-table-server-pagesize').attr('disabled', 'disabled');
    $('#user-table-server-filter').attr('disabled', 'disabled');
    $('#user-table-server-previous').attr('disabled', 'disabled');
    $('#user-table-server-next').attr('disabled', 'disabled');

    loadUsers(function(error, data){
        if(!error){
            // re-enable the elements
            $('#user-table-server-refresh').removeAttr('disabled');
            $('#user-table-server-refresh').html('<span class="glyphicon glyphicon-refresh"></span> Refresh Data');
            $('#user-table-server-pagesize').removeAttr('disabled');
            $('#user-table-server-filter').removeAttr('disabled');
            $('#user-table-server-previous').removeAttr('disabled');
            $('#user-table-server-next').removeAttr('disabled');

            configTableUsers();
        }
    });
}

var configTableUsers = function(){

    var table = $('#user-list-table');
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
                $("[name='user-list-table_length']").addClass('hidden');
                // make our own that identical to it
                $("[name='user-list-table_length']").after('<select id="user-table-server-pagesize" class="form-control input-sm"><option value="10">10</option><option value="25">25</option><option value="50">50</option></select>');
                // trigger the selection base on pageSize global variable
                $("#user-table-server-pagesize").val(localData.user.property.paging.limit).trigger('change');
                // add manual refresh button
                $("#user-table-server-pagesize").parent().after('<a id="user-table-server-refresh" style="margin: 0 0 0 20px;" class="btn btn-info"><span class="glyphicon glyphicon-refresh"></span> Refresh Data</a>');
                // config the change event on the element
                $("#user-table-server-pagesize").on('change', function(){
                    localData.user.property.paging.limit = parseInt($(this).val());
                    localData.user.property.paging.page = 1;
                    console.log(localData.user.property.paging.limit);
                    refreshUserTableData();
                });

                $('#user-table-server-refresh').on('click', function(){
                    refreshUserTableData();
                });

                $('#user-list-table_filter input[type="search"]').addClass('hidden');
                $('#user-list-table_filter input[type="search"]').after('<input class="form-control" id="user-table-server-filter" type="text">');
                $('#user-table-server-filter').val(typeof localData.user.searchparam === 'undefined'? '':localData.user.searchparam);
                $('#user-table-server-filter').on('keypress', function(e){
                    if(e.which == 13) {
                        if($('#user-table-server-filter').val() !== ''){
                            localData.user.searchparam = $('#user-table-server-filter').val();
                            console.log(localData.user.searchparam);
                        } else {
                            delete localData.user.searchparam;
                        }
                        refreshUserTableData();
                    }
                });

            }
        });
    }

    // clear previous rows
    table.DataTable().clear();

    // populate ze rows
    for(i=0; i<localData.user.data.length; i++){
        
        var name = '';
        var email = '-';
        var phone = '-';

        if(localData.user.data[i].hasOwnProperty('name')){
            if(localData.user.data[i].name.hasOwnProperty('first')){
                name = localData.user.data[i].name.first;
            }

            if(localData.user.data[i].name.hasOwnProperty('last')){
                name += ' '+localData.user.data[i].name.last;
            }
        }
        if(localData.user.data[i].hasOwnProperty('email')){
            email = localData.user.data[i].email.value;
        }
        if(localData.user.data[i].hasOwnProperty('phone')){
            phone = localData.user.data[i].phone.value;
        }


        var additional_el = '<a class="btn btn-primary btn-user-edit" userid="'+localData.user.data[i]._id+'"><span class="glyphicon glyphicon-pencil"></span></a><a class="btn btn-danger btn-user-delete" data-toggle="modal" data-target="#deleteUserModal" userid="'+localData.user.data[i]._id+'"><span class="glyphicon glyphicon-remove-circle"></span></a>';

        table.DataTable().row.add([name, localData.user.data[i].username, localData.user.data[i].org.name, localData.user.data[i].userRole.name, email, phone, additional_el]);
    }

    

    // redraw ze rows
    table.DataTable().draw();

    //// because how Datatables redraw its elements on every page changes, 
    //// not all additional elements declared on initComplete function above.
    //// instead, we declare them on every data changes (when configTableMerchant is called)
    $('#user-list-table_wrapper .pagination').addClass('hidden');
    $('#user-list-table_wrapper .pagination').after('<ul class="pagination"><li class="paginate_button previous"><button id="user-table-server-previous" class="btn btn-default">Previous</button></li><li class="paginate_button next"><button id="user-table-server-next" class="btn btn-default">Next</button></li></ul>');
    
    $('#user-table-server-previous').on('click', function(){
        if(localData.user.property.paging.page > 1){
            localData.user.property.paging.page = localData.user.property.paging.page-1;
            refreshUserTableData();
        }
    })
    $('#user-table-server-next').on('click', function(){
        if(localData.user.property.total > localData.user.property.paging.limit*localData.user.property.paging.page){
            localData.user.property.paging.page = localData.user.property.paging.page+1;
            refreshUserTableData();
        }
    });
    $('#user-list-table_info').html('Showing '+ ((localData.user.property.paging.page-1)*localData.user.property.paging.limit+1) +' to '+ (localData.user.property.paging.limit*localData.user.property.paging.page < localData.user.property.total? localData.user.property.paging.limit*localData.user.property.paging.page:localData.user.property.total) +' of <strong>'+ localData.user.property.total +'</strong> entries');    
}

var configSelectHolderUser = function(){

    $("#select-holder-user").select2({
        ajax: {
            url: "http://192.168.100.50:8000/rv1/org",
            dataType: 'json',
            delay: 500,
            beforeSend: function(request) {
                request.setRequestHeader("X-Token", getCookie('token'));
            },
            data: function (params) {
                return {
                    and: '{"org._id":"'+getCookie('orgid')+'", "name":\'\'*'+params.term+'*\'\'}', // search term
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
            cache: true
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

    if(typeof localData.selectedOrg !== 'undefined'){
        // manually add data to the Select2 component and select it
        var newOption = new Option(localData.selectedOrg.name, localData.selectedOrg.id, true, true);
        $("#select-holder-user").append(newOption).trigger('change');
    }

    $('#select-holder-user').on('change', function(){
        if($('#select-holder-user').val() !== null){
            localData.selectedOrg = {
                id: $("#select-holder-user").val(),
                name: $("#select-holder-user").select2('data')[0].name || $("#select-holder-user").select2('data')[0].text
            }
            //init merchant selection
            configSelectMerchantUser();
        } else {
            delete localData.selectedOrg;
            //destroy existing merchant selection
            if ($('#select-merchant-user').hasClass("select2-hidden-accessible")) {
                $("#select-merchant-user").select2('destroy'); 
            }
        }
    });
}

var configSelectMerchantUser = function(){

    $("#select-merchant-user").select2({
        ajax: {
            url: "http://192.168.100.50:8000/rv1/org",
            dataType: 'json',
            delay: 500,
            beforeSend: function(request) {
                request.setRequestHeader("X-Token", getCookie('token'));
            },
            data: function (params) {
                return {
                    and: '{"org._id":"'+ $('#select-holder-user').val() +'", "name":\'\'*'+params.term+'*\'\'}', // search term
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

    $("#select-merchant-user").select2("val", "");

    if(typeof localData.selectedMerchant !== 'undefined'){
        // manually add data to the Select2 component and select it
        var newOption = new Option(localData.selectedMerchant.name, localData.selectedMerchant.id, true, true);
        $("#select-merchant-user").append(newOption).trigger('change');
    }

    $('#select-merchant-user').on('change', function(){
        if($('#select-merchant-user').val() !== null){
            localData.selectedMerchant = {
                id: $("#select-merchant-user").val(),
                name: $("#select-merchant-user").select2('data')[0].name || $("#select-merchant-user").select2('data')[0].text
            }
        } else {
            delete localData.selectedMerchant;
        }
    });
}

var loadUsers = function(cb){
    var params = '';
    var notInOrg = '["592078ace247e7264d2146e1","'+ getCookie('orgid') +'"]' // 592078ace247e7264d2146e1 is dev. TODO: move logic to server.
    try {
        var searchkey = typeof localData.user.searchparam === 'undefined'?'':localData.user.searchparam;
        params = '&and={%22org._id%22:{%22%24nin%22:'+ notInOrg +'}, %22username%22:%27%27*'+searchkey+'*%27%27}&page='+localData.user.property.paging.page+'&limit='+localData.user.property.paging.limit;
    } catch(err) {
        console.log('seems like user object not yet initialized');
        params = '&and={%22org._id%22:{%22%24nin%22:'+ notInOrg +'}}';
    }

    $.ajax({
        method: 'GET',
        url: 'http://192.168.100.50:8000/rv1/user?populate=org._id,userRole._id'+params,
        beforeSend: function(request) {
            request.setRequestHeader("X-Token", getCookie('token'));
        },
        success: function(data, status, xhr){
            // retrieve the searchparam first before replace
            var _param = null;
            if(typeof localData.user !== 'undefined'){
                if(typeof localData.user.searchparam !== 'undefined'){
                    _param = localData.user.searchparam;
                }  
            }
            
            localData.user = data;
            if(_param!==null) localData.user.searchparam = _param;
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

init.user_management = function(cb){
	loadUsers(function(error, data){
        if(!error){
            cb({success: true});
        } else {
            cb({success: false, message: "Error fetching user data from server"});
        }
    });
}

populate.user_management = function(){

    if(typeof localData.updateUser === 'undefined'){
        setNewUserBtn();
    } else {
        setNewUserBtn(localData.updateUser);
    }

    configSelectHolderUser();
    configTableUsers();

    $('#reset-user-btn').on('click', function(){
        setNewUserBtn();
    });

    $('#new-user-btn').on('click', function(e){
        e.preventDefault();

        var userData = {
            sex: $('input[value="female"]').parent().hasClass('checked') == true? $('input[value="female"]').val():$('input[value="male"]').val(),
            notes: $('#select-identity-type').val()
        };
        if($('#username-input').val() != ''){
            userData.username = $('#username-input').val();
        }
        if($('#password-input').val() != ''){
            userData.password = $('#password-input').val();
        }
        if($('#idnumber-input').val() != ''){
            userData.nin = $('#idnumber-input').val();
        }
        if($('#select-holder-user').val() !== null && $('#select-holder-user').val() !== "null"){
            userData.org = {
                _id: $('#select-holder-user').val()
            };
            userData['userRole._id'] = '59275761e0b44e7566a78947';
        }
        if($('#select-merchant-user').val() !== null && $('#select-merchant-user').val() !== "null"){
            userData.org = {
                _id: $('#select-merchant-user').val()
            }
            userData['userRole._id'] = '592757ede0b44e7566a789f7';
        }
        if($('#first-name-input').val() != ''){
            userData.name = {
                first : $('#first-name-input').val()
            }
        }
        if($('#last-name-input').val() != ''){
            if(typeof userData.name === 'undefined'){
                userData.name = {};
            }
            userData.name.last = $('#last-name-input').val();
        }
        if($('#email-input').val() != ''){
            userData.email = {
                value: $('#email-input').val()
            }
        }
        if($('#phone-input').val() != ''){
            userData['phone.value'] = $('#phone-input').val();
        }
        
        // this is either register button or update button according to the context
        if(typeof localData.updateUser === 'undefined'){
            // so this is a new record, huh? aight.

            //validation
            if($('#username-input').val() == ''){
                var msg = "Username should not be empty";
                toastr.options = {
                    closeButton: true,
                    progressBar: true,
                    showMethod: 'slideDown',
                    timeOut: 4000
                };
                toastr.error("", msg);
                return;
            }
            if(userData.org._id === null){
                var msg = "Holder and merchant should not be empty";
                toastr.options = {
                    closeButton: true,
                    progressBar: true,
                    showMethod: 'slideDown',
                    timeOut: 4000
                };
                toastr.error("", msg);
                return;
            }
            if($('#password-input').val() !== $('#confirm-password-input').val()){
                var msg = "Password confirmation invalid";
                toastr.options = {
                    closeButton: true,
                    progressBar: true,
                    showMethod: 'slideDown',
                    timeOut: 4000
                };
                toastr.error("", msg);
                return;
            }
            if($('#idnumber-input').val() == ''){
                var msg = "ID number should not be empty";
                toastr.options = {
                    closeButton: true,
                    progressBar: true,
                    showMethod: 'slideDown',
                    timeOut: 4000
                };
                toastr.error("", msg);
                return;
            }
            $('#new-user-btn strong').html('Registering...');
            $('#new-user-btn').attr('disabled', 'disabled');

            $.ajax({
                method: 'POST',
                url: 'http://192.168.100.50:8000/rv1/user',
                beforeSend: function(request) {
                    request.setRequestHeader("X-Token", getCookie('token'));
                },
                data: userData,
                success: function(data, status, xhr){
                    //console.log(data);
                    if(data.status==200 && data.message=="OK"){
                        $('form')[0].reset();
                        var msg = "New user";
                        toastr.options = {
                            closeButton: true,
                            progressBar: true,
                            showMethod: 'slideDown',
                            timeOut: 4000
                        };
                        toastr.success("has been inserted", msg);
                        refreshUserTableData();
                        setNewUserBtn();
                    } else {
                        var msg = "Sorry but there was an error: ";
                        toastr.options = {
                            closeButton: true,
                            progressBar: true,
                            showMethod: 'slideDown',
                            timeOut: 4000
                        };
                        toastr.error(data.trace, msg);
                        $('#new-user-btn strong').html('Register');
                        $('#new-user-btn').removeAttr('disabled');
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
                    $('#new-user-btn strong').html('Register');
                    $('#new-user-btn').removeAttr('disabled');
                }
            });
        } else {
            // update existing record? roger.

            //validation
            if($('#password-input').val() !== $('#confirm-password-input').val()){
                var msg = "Password confirmation invalid";
                toastr.options = {
                    closeButton: true,
                    progressBar: true,
                    showMethod: 'slideDown',
                    timeOut: 4000
                };
                toastr.error("", msg);
                return;
            }

            $('#new-user-btn strong').html('Updating...');
            $('#new-user-btn').attr('disabled', 'disabled');

            //existing user cannot change org
            if(typeof delete userData.org !== 'undefined'){
                delete userData.org;
            }
            $.ajax({
                method: 'PUT',
                url: 'http://192.168.100.50:8000/rv1/user/' + localData.updateUser._id,
                beforeSend: function(request) {
                    request.setRequestHeader("X-Token", getCookie('token'));
                },
                data: userData,
                success: function(data, status, xhr){
                    //console.log(data);
                    if(data.status==200 && data.message=="OK"){
                        $('form')[0].reset();
                        var msg = localData.updateUser.username;
                        toastr.options = {
                            closeButton: true,
                            progressBar: true,
                            showMethod: 'slideDown',
                            timeOut: 4000
                        };
                        toastr.success("has been updated", msg);
                        refreshUserTableData();
                        setNewUserBtn();
                    } else {
                        var msg = "Sorry but there was an error: ";
                        toastr.options = {
                            closeButton: true,
                            progressBar: true,
                            showMethod: 'slideDown',
                            timeOut: 4000
                        };
                        toastr.error(data.trace, msg);
                        $('#new-user-btn strong').html('Update');
                        $('#new-user-btn').removeAttr('disabled');
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
                    $('#new-user-btn strong').html('Update');
                    $('#new-user-btn').removeAttr('disabled');
                }
            });
        }
    
    });

    $('input[name="gender-input"]').iCheck({
        checkboxClass: 'icheckbox_square-green',
        radioClass: 'iradio_square-green',
    });

    $('#user-list-table').on('click', '.btn-user-edit', function(){
        var id = $(this).attr('userid');
        var obj = localData.user.data.find(function(element){
            return element._id == id;
        });
        console.log(obj);
        setNewUserBtn(obj);
    });

    $('#user-list-table').on('click', '.btn-user-delete', function(){
        var id = $(this).attr('userid');
        var obj = localData.user.data.find(function(element){
            return element._id == id;
        });

        $('#deleteUserModal .modal-footer>button[confirm]').attr('userid', id);

        $('#deleteUserModal h4.modal-title').html('Delete Confirmation');
        $('#deleteUserModal div.modal-body').html('Are you sure you want to delete this user? <h3>'+obj.username+'</h3>');
        
    });

    $('#deleteUserModal .modal-footer>button[confirm]').on('click', function(){
        var _el = $(this)
        _el.html('Deleting...');
        _el.attr('disabled', 'disabled');
        var id = $(this).attr('userid');
        var obj = localData.user.data.find(function(element){
            return element._id == id;
        });
        $.ajax({
            method: 'DELETE',
            url: 'http://192.168.100.50:8000/rv1/user/' + id,
            beforeSend: function(request) {
                request.setRequestHeader("X-Token", getCookie('token'));
            },
            success: function(data, status, xhr){
                //console.log(data);
                if(data.status==200 && data.message=="OK"){
                    var msg = obj.username;
                    toastr.options = {
                        closeButton: true,
                        progressBar: true,
                        showMethod: 'slideDown',
                        timeOut: 4000
                    };
                    toastr.success("has been deleted", msg);
                    refreshUserTableData();
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
                $('#deleteUserModal').modal('hide');
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
                _el.html('Confirm');
                _el.removeAttr('disabled');
                $('#deleteUserModal').modal('hide');
            }
        });
    });
}