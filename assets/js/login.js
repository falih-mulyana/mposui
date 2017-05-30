var kuki = getCookie('token');
if(kuki !== ''){
	checkCookie(function(loggedUser){
		switch(loggedUser.roleName){
			case 'DEV':
				window.location = "/admin";
				break;
			case 'Administrator':
				window.location = "/admin";
				break;
			case 'Holder':
				window.location = "/holder";
				break;
			case 'merchant':
				window.location = "/merchant";
				break;
			default:
				break;
		}
	});
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
					password: 'rootvd235'*/
					username: $('#username').val(),
					password: $('#password').val()
				},
				success: function(data, status, xhr){
					console.log(data);
					var token = data.data.token;
					//document.cookie = "token="+token+"; path=/";
					setCookie('token', token, 1);
					
					$.ajax({
						method: 'GET',
						url: 'http://192.168.100.50:8000/me',
						beforeSend: function(request) {
					    	request.setRequestHeader("X-Token", token);
					  	},
						success: function(data, status, xhr){
							console.log(data);
							setCookie('username', data.data.user.username, 1);
							setCookie('orgid', data.data.user.org._id, 1);
							var roleName = data.data.user.userRole.name;
							// look, i'm doing hardcode because the scope is limited. if somehow in the future the use of user role will be extended, by any means please do revise this.
							switch(roleName){
								case 'DEV':
									window.location = "/admin";
									break;
								case 'Administrator':
									window.location = "/admin";
									break;
								case 'Holder':
									window.location = "/holder";
									break;
								case 'Merchant':
									window.location = "/merchant";
									break;
								default:
									break;
							}
						},
						error: function(status, xhr, err){
							alert(status.responseJSON.trace);
							$("#login-btn").html("Login");
							$("#login-btn").removeAttr("disabled")
						}
					});
				},
				error: function(status, xhr, err){
					alert(status.responseJSON.trace);
					$("#login-btn").html("Login");
					$("#login-btn").removeAttr("disabled")
				}
			});
		});
	});
}