// these three objects are used to store requested data from server so that the browser doesn't have to request the same page.

// init: this object holds code that executed during the first time client loads the script. what does it do? request data from the server, save them as global variables.
var init = {};

// populate: this object holds code that executed when the client changes page to the one that has been requested. what does it do? fill the forms, tables, graph etc with the data initialized before.
//The client can manually refresh the data.
var populate = {};

// view: this object holds HTML strings to be parsed when the client requested them.
var view = {};

// default hash, a homepage. automatically redirected to the first navigation on the list
if(window.location.hash === ""){
	var firstNavHref = $(".nav-list").eq(0).children('a').attr('href');

	window.location.hash = firstNavHref;
}

// this function governs how a new "page" is requested. By page it means new content
var loadPage = function(pageName){

	// the "a" element that the user clicked in the navigation
	var a_element = $('.nav-list>a[href="'+pageName+'"]');
	// assets directory
	var viewDir = '/assets/views/admin/';
	var scriptDir = '/assets/js/admin/';

	// remove all "active" element so that no indicator of where the page the user currently at.
	$(".nav-list").removeClass('active');

	// title on the (typically) tab bar of a browser
	document.title = a_element.children('span').html();

	// this line of code checks if the view from a hash URL has been requested before
	if(typeof view[window.location.hash.substr(1)] == 'undefined'){

		// if not, then this page had never been requested before. Request from server.
		$.get(viewDir + pageName + '.html', function(data) {

			// hold the parsed HTML string to the "view" global object
			view[window.location.hash.substr(1)] = data;

			// render the HTML strings.
		    $("#page-content").html(view[window.location.hash.substr(1)]);
			console.log(pageName + ' view loaded');

			// load the script
			loadScript(scriptDir+pageName+'.js', function(){

				// run "populate" function from the loaded script
				populate[window.location.hash.substr(1)]();
			});
		}).fail(function(e) {

			// error handling.
		    console.log(e);
		    var msg = "Sorry but there was an error: ";
			toastr.options = {
	            closeButton: true,
	            progressBar: true,
	            showMethod: 'slideDown',
	            timeOut: 4000
	        };
	        toastr.error(e.status + " <b>" + pageName + "</b> page " + e.statusText, msg);
	        window.history.back();
		});
	} else {

		// if the page is already saved before, just render it
		$("#page-content").html(view[window.location.hash.substr(1)]);
		// load the script
		loadScript(scriptDir+pageName+'.js', function(){

			// run "populate" function from the loaded script
			populate[window.location.hash.substr(1)]();
		});
	}
	
	// set "active" to the navigation list
	a_element.parent().addClass('active');
}

// this function governs how a new script is requested. A script is loaded and executed only after views have already been loaded and rendered.
function loadScript(url, callback){

	// first check if script is already loaded
	var src = $('script[src="'+url+'"]').length;
	if(src == 0){
		var script = document.createElement("script")
	    script.type = "text/javascript";

	    if (script.readyState){  //IE
	        script.onreadystatechange = function(){
	            if (script.readyState == "loaded" ||
	                    script.readyState == "complete"){
	                script.onreadystatechange = null;
	            	init[window.location.hash.substr(1)]();
	                callback();
	            }
	        };
	    } else {  //Others
	        script.onload = function(){
	        	init[window.location.hash.substr(1)]();
	            callback();
	        };
	    }

	    script.src = url;
	    document.getElementsByTagName("body")[0].appendChild(script);
	} else {
		console.log('script is already loaded. No need to reload.');
		callback();
	}
    
}

$(document).ready(function(){
	
	loadPage(window.location.hash.substr(1));

	$(window).on('hashchange', function() {
		loadPage(window.location.hash.substr(1));
	});

	$(".nav-list a").on("click", function(e) {
		e.preventDefault();
		window.location.hash = $(this).attr('href');
    });

    
});