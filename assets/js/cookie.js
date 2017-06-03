function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkCookie() {
    var tkn = getCookie("token");
    if (tkn != "") {
		return { userName: getCookie("userName"), orgId: getCookie("orgid"), userRole: getCookie("userRole")};
    } else {
        window.location = "/login";
        return;
    }
}

var getCookieInfoFromServer = function(cb){
	var loggedUser = {};
	$.ajax({
		method: 'GET',
		url: 'http://192.168.100.50:8000/me',
		beforeSend: function(request) {
	    	request.setRequestHeader("X-Token", getCookie('token'));
	  	},
		success: function(data, status, xhr){
			loggedUser = data.data.user;
			cb(loggedUser);
			
		},
		error: function(status, xhr, err){
			//console.log(status);
			if(status.status == 500){
				// token invalid. reset it
				document.cookie = 'token=; path=/';
				window.location = "/login";
			} else if (status.status == 0){
				$('body').html(serverErrorMessage());
			}
		}
	});
}

var redirectToPage = function(roleName){
	switch(roleName){
		// look, i'm doing hardcode because the scope is limited. 
		// if somehow in the future the use of user role will be 
		// extended, by any means please do revise this.
		case 'DEV':
			window.location = "/admin";
			break;
		case 'super':
			window.location = "/admin";
			break;
		case 'holder':
			window.location = "/holder";
			break;
		case 'merchant':
			window.location = "/merchant";
			break;
		default:
			break;
	}
}

var waitingMessage = function(){
	return 'Checking session, please wait..';
}

var serverErrorMessage = function(){
	return 'Cannot connect to the server. Please try again later.';
}

var expiredTokenMessage = function(){
	return 'Session expired. Please login again.';
}

// connection handler
var  errorRequestHandler = function(status){
	if(status.readyState == 0){
		return serverErrorMessage();
	} else if(status.responseJSON.trace.indexOf('Invalid lookup for token') !== -1){
        return expiredTokenMessage();
    } else {
    	return status.responseJSON.trace;
    }
}