console.log('organization script loaded');

var loadOrg = function(cb){
	$.ajax({
        method: 'GET',
        url: 'http://192.168.100.50:8000/rv1/org/'+getCookie('orgid'),
        beforeSend: function(request) {
            request.setRequestHeader("X-Token", getCookie('token'));
        },
        success: function(data, status, xhr){
        	console.log(data);
            cb(false, data.data);    
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

var updateOrg = function(cb){

}

var populateForm = function(_orgData){
	
}

init.organization = function(cb){
	cb({success: true});
}

populate.organization = function(){
	loadOrg(function(error, data){
        if(!error){
            populateForm(data);
        }
    });
}