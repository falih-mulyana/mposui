console.log('user_management script loaded');

var refreshTableData = function(_page, _limit, _param){
    //$('#org-list-table_info').html('balabala');
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
    for(i=0; i<localData.org.data.length; i++){
        var type = 'undefined';
        var tax = localData.org.data[i].taxes == true? 'yes':'no';
        var phone = '-';
        var email = '-';
        var address = '-';
        if(localData.org.data[i].hasOwnProperty('phone')){
            phone = localData.org.data[i].phone.value;
        }
        if(localData.org.data[i].hasOwnProperty('email')){
            email = localData.org.data[i].email.value;
        }
        if(localData.org.data[i].hasOwnProperty('address')){
            address = localData.org.data[i].location.address;
        }
        
        for(j=0; j<localData.orgType.data.length; j++){
            if(localData.orgType.data[j]._id == localData.org.data[i].orgType._id){
                type = localData.orgType.data[j].name;
            }
        }
        var el = '<tr><td>'+localData.org.data[i].name+'</td><td>'+email+'</td><td>'+type+'</td><td>'+ address +'</td><td>'+ tax +'</td><td>'+localData.org.data[i].npwp+'</td><td>'+ phone +'</td></tr>';
        $('#org-list-table>tbody').append(el);
    }
    $('#org-list-table').DataTable({
        pageLength: 25,
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
            $("[name='org-list-table_length']").on('change', function(){
                localData.pageSize = parseInt($(this).val());
                console.log(localData.pageSize);
                refreshTableData();
            });

            $('#org-list-table_filter input[type="search"]').off('input');
            /*$('#org-list-table_filter input[type="search"]').on('change', function(){
                console.log("aaaa");
            });*/
        }
    });
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

var loadOrg = function(cb){
    $.ajax({
        method: 'GET',
        url: 'http://192.168.100.50:8000/rv1/org',
        beforeSend: function(request) {
            request.setRequestHeader("X-Token", getCookie('token'));
        },
        success: function(data, status, xhr){
            //console.log(data);
            localData.org = data;
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

init.organization = function(){
    // checking local data
    // because there's still no way of populate via rv1 route, we're only request org when we already got the orgType
    if(typeof localData.org == 'undefined'){
        if(typeof localData.orgType == 'undefined'){
            loadOrgType(function(error, data){
                if(!error){
                    configSelectHolderType();
                    loadOrg(function(error, data){
                        if(!error){
                            configTableHolder();
                        }
                    });
                }
            });
        } else {  
            configSelectHolderType();
            loadOrg(function(error, data){
                configTableHolder();
            });
        }
    } else {
        if(typeof localData.orgType == 'undefined'){
            loadOrgType(function(error, data){
                if(!error){
                    configSelectHolderType();
                }
            });
        } else {
            configSelectHolderType();
        }
        
        configTableHolder();
    }

	
}

populate.organization = function(){

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

    $('#new-org-btn').on('click', function(e){
        e.preventDefault();
        //console.log(geolocationObj);
        $.ajax({
            method: 'POST',
            url: 'http://192.168.100.50:8000/rv1/org',
            beforeSend: function(request) {
                request.setRequestHeader("X-Token", getCookie('token'));
            },
            data: {
                name: $('#name-input').val(),
                'orgType._id': $('#select-holder-type').val(),
                taxes: $('form [name="tax"]').prop("checked"),
                npwp: $('#npwp-input').val(),
                'email.value': $('#email-input').val(),
                location: {
                    address: $('#location-input').val(),
                    country: window.geolocationObj.country,
                    state: window.geolocationObj.state,
                    zipcode: window.geolocationObj.postal_code,
                    lat: $('#lp-lat').val(),
                    long: $('#lp-lon').val()
                },
                'phone.value': $('#phone-input').val()
            },
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
                    }
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
            }
        });
    });
}