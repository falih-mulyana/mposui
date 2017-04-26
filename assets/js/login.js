var kuki = getCookie('token');
if(kuki !== ''){
	checkCookie(function(roleName){
		switch(roleName){
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
					document.cookie = "token="+token+"; path=/";
					console.log(document.cookie.substr(6));
					
					$.ajax({
						method: 'GET',
						url: 'http://192.168.100.50:8000/me',
						beforeSend: function(request) {
					    	request.setRequestHeader("X-Token", document.cookie.substr(6));
					  	},
						success: function(data, status, xhr){
							console.log(data);
							var userRoleId = data.data.user.userRole._id;

							$.ajax({
								method: 'GET',
								url: 'http://192.168.100.50:8000/rv1/userRole/' + userRoleId,
								beforeSend: function(request) {
							    	request.setRequestHeader("X-Token", document.cookie.substr(6));
							  	},
								success: function(data, status, xhr){
									console.log(data);
									var roleName = data.data.name;

									// look, i'm doing hardcode because the scope is limited. if somehow in the future the use of user role will be extended, by any means please do revise this.
									switch(roleName){
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
									console.log(err);
								}
							});
						},
						error: function(status, xhr, err){
							console.log(err);
						}
					});
				},
				error: function(status, xhr, err){
					console.log(err);
				}
			});
		});
	});
}