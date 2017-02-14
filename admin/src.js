if(window.location.hash === ""){
	var firstNavHref = $(".nav-list").eq(0).children('a').attr('href');

	window.location.hash = firstNavHref;
}

var loadPage = function(pageName){
	var a_element = $('.nav-list>a[href="'+pageName+'"]');
	var viewDir = '/assets/views/admin/';

	$(".nav-list").removeClass('active');
	window.location.hash = pageName;
	document.title = a_element.children('span').html();
	$("#page-content").load(viewDir + pageName + '.html', function( response, status, xhr ){
		console.log(pageName + ' was loaded');
	});
	a_element.parent().addClass('active');
}

function loadScript(url, callback){

    var script = document.createElement("script")
    script.type = "text/javascript";

    if (script.readyState){  //IE
        script.onreadystatechange = function(){
            if (script.readyState == "loaded" ||
                    script.readyState == "complete"){
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {  //Others
        script.onload = function(){
            callback();
        };
    }

    script.src = url;
    document.getElementsByTagName("body")[0].appendChild(script);
}

$(document).ready(function(){
	
	loadPage(window.location.hash.substr(1));

	$(window).on('hashchange', function() {
		loadPage(window.location.hash.substr(1));
	});

	$(".nav-list a").on("click", function(e) {
		e.preventDefault();
        loadPage($(this).attr('href'));
    });

    
});