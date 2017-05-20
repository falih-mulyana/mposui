console.log('dashboard script loaded');
var rendered;

function initMap() {

	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 3,
		center: {lat: -28.024, lng: 140.887}
	});

// Create an array of alphabetical characters used to label the markers.
var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Add some markers to the map.
// Note: The code uses the JavaScript Array.prototype.map() method to
// create an array of markers based on a given "locations" array.
// The map() method here has nothing to do with the Google Maps API.
var markers = locations.map(function(location, i) {
	return new google.maps.Marker({
		position: location,
		label: labels[i % labels.length]
	});
});

// Add a marker clusterer to manage the markers.
var markerCluster = new MarkerClusterer(map, markers,
	{imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
}


var locations = [
	{lat: -31.563910, lng: 147.154312},
	{lat: -33.718234, lng: 150.363181},
	{lat: -33.727111, lng: 150.371124},
	{lat: -33.848588, lng: 151.209834},
	{lat: -33.851702, lng: 151.216968},
	{lat: -34.671264, lng: 150.863657},
	{lat: -35.304724, lng: 148.662905},
	{lat: -36.817685, lng: 175.699196},
	{lat: -36.828611, lng: 175.790222},
	{lat: -37.750000, lng: 145.116667},
	{lat: -37.759859, lng: 145.128708},
	{lat: -37.765015, lng: 145.133858},
	{lat: -37.770104, lng: 145.143299},
	{lat: -37.773700, lng: 145.145187},
	{lat: -37.774785, lng: 145.137978},
	{lat: -37.819616, lng: 144.968119},
	{lat: -38.330766, lng: 144.695692},
	{lat: -39.927193, lng: 175.053218},
	{lat: -41.330162, lng: 174.865694},
	{lat: -42.734358, lng: 147.439506},
	{lat: -42.734358, lng: 147.501315},
	{lat: -42.735258, lng: 147.438000},
	{lat: -43.999792, lng: 170.463352}
	]

var manualreload = function(){

}

var getList = function(){
	$.ajax({
		method: 'GET',
		url: 'http://192.168.100.50:8000/list',
		beforeSend: function(xhr){
			xhr.setRequestHeader('X-Token', getCookie('token'));
		},
		/*xhrFields: {
	  		withCredentials: true
	   	},*/
		success: function(data, status, xhr){
			console.log(data);
		},
		error: function(status, xhr, err){
			console.log(err);
		}
	});
}

var renderElements = function(tabsName){
	switch(tabsName){
		case 'tab-holder':
			c3.generate({
		        bindto: '#lineChart-holder',
		        data:{
		            columns: [
		                ['data1', 30, 200, 100, 400, 150, 250],
		                ['data2', 50, 20, 10, 40, 15, 25]
		            ],
		            colors:{
		                data1: '#1ab394',
		                data2: '#23c6c8'
		            }
		        }
		    });

		    c3.generate({
		        bindto: '#pie-holder',
		        data:{
		            columns: [
		                ['data1', 30],
		                ['data2', 120]
		            ],
		            colors:{
		                data1: '#1ab394',
		                data2: '#23c6c8'
		            },
		            type : 'pie'
		        }
		    });

		    c3.generate({
		        bindto: '#barhorizontal1-holder',
		        padding: {
		            left: 60
		        },
		        data: {
		            columns:
		            [
		                ['data1', 5],
			            ['data2', 8]
		            ],
		            type: 'bar',
		            colors:{
		                data1: '#1ab394',
		                data2: '#23c6c8'
		            }
		        },
		        axis: {
		            rotated: true,
		            x: {
			        	label: {
			          		text: 'Minimum',
			          		position: 'outer-middle'
			        	},

				      	tick: {
					      	//values: ["Aa", "bB", "Cc"]
					      	values: [""]
					    }
			      	},
			      	y: {
			      		tick: {
			      			values: [0, 50, 100]
			      		}
			      	}
		        },
		        tooltip: {
			        format: {
			            //title: function (d) { return 'Data ' + d; },
			            title: function (d) { return 'Payment Channel Minimum'; },
			            /*value: function (value, ratio, id) {
			                var format = id === 'data1' ? d3.format(',') : d3.format('$');
			                return format(value);
			            }*/
			//          value: d3.format(',') // apply this format to both y and y2
			        }
			    }
			});

			c3.generate({
		    	bindto: '#bar-holder',
			    data: {
			        columns: [
			            ['data1', 30, 200, 100, 400, 150, 250],
			            ['data2', 130, 100, 140, 200, 150, 50]
			        ],
			        type: 'bar',
			        colors:{
		                data1: '#1ab394',
		                data2: '#23c6c8'
		            }
			    },
			    bar: {
			        width: {
			            ratio: 0.5 // this makes bar width 50% of length between ticks
			        }
			        // or
			        //width: 100 // this makes bar width 100px
			    }
			});

		    c3.generate({
		        bindto: '#barhorizontal3-holder',
		        padding: {
		            left: 60
		        },
		        data: {
		            columns:
		            [
		                ['data1', 30],
			            ['data2', 42]
		            ],
		            type: 'bar',
		            colors:{
		                data1: '#1ab394',
		                data2: '#23c6c8'
		            }
		        },
		        axis: {
		            rotated: true,
		            x: {
			        	label: {
			          		text: 'Average',
			          		position: 'outer-middle'
			        	},

				      	tick: {
					      	values: [""]
					    }
			      	},
			      	y: {
			      		tick: {
			      			values: [0, 50, 100]
			      		}
			      	}
		        },
		        tooltip: {
			        format: {
			            title: function (d) { return 'Payment Channel Average'; }
			        }
			    }
			});

			c3.generate({
		        bindto: '#barhorizontal2-holder',
		        padding: {
		            left: 60
		        },
		        data: {
		            columns:
		            [
		                ['data1', 120],
			            ['data2', 94]
		            ],
		            type: 'bar',
		            colors:{
		                data1: '#1ab394',
		                data2: '#23c6c8'
		            }
		        },
		        axis: {
		            rotated: true,
		            x: {
			        	label: {
			          		text: 'Maximum',
			          		position: 'outer-middle'
			        	},

				      	tick: {
					      	values: [""]
					    }
			      	},
			      	y: {
			      		tick: {
			      			values: [0, 50, 100]
			      		}
			      	}
		        },
		        tooltip: {
			        format: {
			            title: function (d) { return 'Payment Channel Maximum'; }
			        }
			    }
			});
			break;
		case 'tab-maps':
			initMap();
			break;
		case 'tab-merchant':
			c3.generate({
		        bindto: '#lineChart-merchant',
		        data:{
		            columns: [
		                ['data1', 30, 200, 100, 400, 150, 250],
		                ['data2', 50, 20, 10, 40, 15, 25]
		            ],
		            colors:{
		                data1: '#1ab394',
		                data2: '#23c6c8'
		            }
		        }
		    });

		    c3.generate({
		    	bindto: '#bar-merchant',
			    data: {
			        columns: [
			            ['data1', 30, 200, 100, 400, 150, 250],
			            ['data2', 130, 100, 140, 200, 150, 50]
			        ],
			        type: 'bar',
			        colors:{
		                data1: '#1ab394',
		                data2: '#23c6c8'
		            }
			    },
			    bar: {
			        width: {
			            ratio: 0.5 // this makes bar width 50% of length between ticks
			        }
			        // or
			        //width: 100 // this makes bar width 100px
			    }
			});

			Morris.Donut({
		        element: 'donut-merchant',
		        data: [{ label: "Download Sales", value: 12 },
		            { label: "In-Store Sales", value: 30 },
		            { label: "Mail-Order Sales", value: 20 } ],
		        resize: true,
		        colors: ['#87d6c6', '#54cdb4','#1ab394'],
		    });
			break;
	}
}

init.dashboard = function(){
	/*balala = 500;

	$('#page-content').on('click', '#testplus1', function(){
		balala += 1;
		$('#test1').val(balala);
	});
	$('#page-content').on('click', '#testminus1', function(){
		balala -= 1;
		$('#test1').val(balala);
	});*/

	$('#page-content').on('click', '.collapse-link', function () {
        var ibox = $(this).closest('div.ibox');
        var button = $(this).find('i');
        var content = ibox.find('div.ibox-content');
        content.slideToggle(200);
        button.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
        ibox.toggleClass('').toggleClass('border-bottom');
        setTimeout(function () {
            ibox.resize();
            ibox.find('[id^=map-]').resize();
        }, 50);
    });


	manualreload();
}

populate.dashboard = function(){
	rendered = {};
	$('#page-content').on('click', '.tabs-container>.nav-tabs>li:not(:first)>a', function(e){
		if(rendered.hasOwnProperty($(this).attr('href').substr(1))) {
			//nothung to do
			console.log("already rendered");
		} else {
			//render new
			console.log("rendering elements");
			var n = $(this).attr('href').substr(1);
			setTimeout(function(){
				renderElements(n);
				rendered[n] = true;
			}, 100);
		}
	});

	getList();

	// graphs and charts
	c3.generate({
        bindto: '#lineChart',
        data:{
            columns: [
                ['data1', 30, 200, 100, 400, 150, 250],
                ['data2', 50, 20, 10, 40, 15, 25]
            ],
            colors:{
                data1: '#1ab394',
                data2: '#23c6c8'
            }
        }
    });
    

    c3.generate({
        bindto: '#pie',
        data:{
            columns: [
                ['data1', 30],
                ['data2', 120]
            ],
            colors:{
                data1: '#1ab394',
                data2: '#23c6c8'
            },
            type : 'pie'
        }
    });
    

    c3.generate({
    	bindto: '#bar',
	    data: {
	        columns: [
	            ['data1', 30, 200, 100, 400, 150, 250],
	            ['data2', 130, 100, 140, 200, 150, 50]
	        ],
	        type: 'bar',
	        colors:{
                data1: '#1ab394',
                data2: '#23c6c8'
            }
	    },
	    bar: {
	        width: {
	            ratio: 0.5 // this makes bar width 50% of length between ticks
	        }
	        // or
	        //width: 100 // this makes bar width 100px
	    }
	});
	

	c3.generate({
        bindto: '#barhorizontal1',
        padding: {
            left: 60
        },
        data: {
            columns:
            [
                ['data1', 5],
	            ['data2', 8]
            ],
            type: 'bar',
            colors:{
                data1: '#1ab394',
                data2: '#23c6c8'
            }
        },
        axis: {
            rotated: true,
            x: {
	        	label: {
	          		text: 'Minimum',
	          		position: 'outer-middle'
	        	},

		      	tick: {
			      	//values: ["Aa", "bB", "Cc"]
			      	values: [""]
			    }
	      	},
	      	y: {
	      		tick: {
	      			values: [0, 50, 100]
	      		}
	      	}
        },
        tooltip: {
	        format: {
	            //title: function (d) { return 'Data ' + d; },
	            title: function (d) { return 'Payment Channel Minimum'; },
	            /*value: function (value, ratio, id) {
	                var format = id === 'data1' ? d3.format(',') : d3.format('$');
	                return format(value);
	            }*/
	//          value: d3.format(',') // apply this format to both y and y2
	        }
	    }
	});
	

	c3.generate({
        bindto: '#barhorizontal2',
        padding: {
            left: 60
        },
        data: {
            columns:
            [
                ['data1', 120],
	            ['data2', 94]
            ],
            type: 'bar',
            colors:{
                data1: '#1ab394',
                data2: '#23c6c8'
            }
        },
        axis: {
            rotated: true,
            x: {
	        	label: {
	          		text: 'Maximum',
	          		position: 'outer-middle'
	        	},

		      	tick: {
			      	values: [""]
			    }
	      	},
	      	y: {
	      		tick: {
	      			values: [0, 50, 100]
	      		}
	      	}
        },
        tooltip: {
	        format: {
	            title: function (d) { return 'Payment Channel Maximum'; }
	        }
	    }
	});
	

	c3.generate({
        bindto: '#barhorizontal3',
        padding: {
            left: 60
        },
        data: {
            columns:
            [
                ['data1', 30],
	            ['data2', 42]
            ],
            type: 'bar',
            colors:{
                data1: '#1ab394',
                data2: '#23c6c8'
            }
        },
        axis: {
            rotated: true,
            x: {
	        	label: {
	          		text: 'Average',
	          		position: 'outer-middle'
	        	},

		      	tick: {
			      	values: [""]
			    }
	      	},
	      	y: {
	      		tick: {
	      			values: [0, 50, 100]
	      		}
	      	}
        },
        tooltip: {
	        format: {
	            title: function (d) { return 'Payment Channel Average'; }
	        }
	    }
	});
}