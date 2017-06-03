var kuki = getCookie('token');
if(kuki !== ''){
	$('body').html('<h2>'+waitingMessage()+'</h2>');
	var kuki = checkCookie();
	redirectToPage(kuki.userRole);
} else {
	$(document).ready(function(){
		$("#login-btn").on("click", function(e){
			e.preventDefault();
			$(this).html("Logging in...");
			$(this).attr("disabled", "");
			$.ajax({
				method: 'POST',
				url: 'http://192.168.100.50:8000/auth',
				data: {
					/*username: 'root',
					password: 'rootxjciw'*/
					username: $('#username').val(),
					password: $('#password').val()
				},
				success: function(data, status, xhr){
					console.log(data);
					var token = data.data.token;
					//document.cookie = "token="+token+"; path=/";
					setCookie('token', token, 1);
					
					getCookieInfoFromServer(function(loggedUser){
						console.log(loggedUser);
						setCookie('userName', loggedUser.username, 1);
						setCookie('orgid', loggedUser.org._id, 1);
						setCookie('userRole', loggedUser.userRole.name, 1);
						redirectToPage(checkCookie().userRole);
					});
				},
				error: function(status, xhr, err){
					var msg = errorRequestHandler(status);
	                if(msg == serverErrorMessage()){
	                    $('body').html('<h2 style="color: black;">'+msg+'</h2>');
	                } else {
	                    alert(status.responseJSON.trace);
						$("#login-btn").html("Login");
						$("#login-btn").removeAttr("disabled");
	                }
				}
			});
		});
	});
}