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

function checkCookie(cb) {
    var tkn = getCookie("token");
    if (tkn != "") {

    	var loggedUser = {};
    	$.ajax({
			method: 'GET',
			url: 'http://192.168.100.50:8000/me',
			beforeSend: function(request) {
		    	request.setRequestHeader("X-Token", getCookie('token'));
		  	},
			success: function(data, status, xhr){
				loggedUser.userName = data.data.user.username;
				//var userRoleId = data.data.user.userRole._id;
				loggedUser.roleName = data.data.user.userRole.name;
				cb(loggedUser);
				
			},
			error: function(status, xhr, err){
				//console.log(status);
				if(status.status == 500){
					// token invalid. reset it
					document.cookie = 'token=; path=/';
					window.location = "/login";
				} else if (status.status == 0){
					$('body').html("<h2>Cannot connect to the server. Please try again later.</h2>");
				}
			}
		});
    } else {
        window.location = "/login";
    }
}