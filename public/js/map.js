define(function () {
	var map = function () {

		var infoWindow = new google.maps.InfoWindow();
		var coins = [];
		var coinsMarker = [];
		var init = 0;
		var position = {
			lat: 0,
			lng: 0,
			me: new google.maps.Marker(),
			id: 0,
			sum: 0,
			name: ''
		};
		var highlights = [];

		var dirService = new google.maps.DirectionsService();
		var dirRenderer = new google.maps.DirectionsRenderer();

		var getPosition = function () {
			navigator.geolocation.watchPosition(function(pos){
				var lat = pos.coords.latitude;
				var lng = pos.coords.longitude;
				if(!init) {
					setMapOrigin(lat, lng);
					setCurrentPos(lat, lng);
					setTimeout(function(){
						generateCoins(lat, lng);
						highlightClosestBounty();
					}, 1000);
					position.lat = lat;
					position.lng = lng;
					position.id = document.querySelector('.id').id;
					position.name = document.querySelector('.id').innerHTML;

					setTimeout(function(){
						setArtefacts();
					}, 1000);
				} else {
					position.lat = lat;
					position.lng = lng;
					setCurrentPos(lat, lng);
					map.panTo(new google.maps.LatLng(lat, lng));
					highlightClosestBounty();
				}
				init = 1;
			});
		};
		var setMapOrigin = function (lat, lng) {
			var mapOptions = {
				zoom: 18,
				center: new google.maps.LatLng(lat, lng),
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};
			map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

		};

		var setArtefacts = function () {
			var artefacts = JSON.parse(document.querySelector('.artefacts').innerHTML);
			for (var i = 0; i < artefacts.length; i++) {
				
				var pos = new google.maps.LatLng(artefacts[i].lat, artefacts[i].lng);

				var marker = new google.maps.Marker({
					position: pos,
					map: map,
					title: artefacts[i].name,
					icon: 'img/artifact.png'
				});
				
				(function(artf, name, marker){
					
					var content = '<h2>'+name+'</h2>' + '<h4>'+ artf.pret +' leptons</h4>';
					content += '<a href="#" id="'+ name +'" class="conquer">Conquer</a>';

					artf.bids.forEach(function(b){
						console.log(b);
						content += '<p>' +b.name+ ' ('+b.sum+' / '+((b.sum/artf.pret)*100)+'%)</p>';
					});

					if(!artf.bids.length)
						content += '<h4>No attempts to conquer this artefact</h4>';

					google.maps.event.addListener(marker, 'click', function(event){
						infoWindow.setOptions({
							position: new google.maps.LatLng(artf.lat, artf.lng),
							title: 'Infowindow',
							content: content
						});
							
						google.maps.event.addListener(infoWindow, 'domready', function() {
							var c = document.querySelector('.conquer');
							c.addEventListener('click', function(){
								console.log(this.id, position.id, position.sum);
								var xhr = new XMLHttpRequest();
								xhr.open('GET', '/bid/' + this.id + '/' + position.id + '/' + position.sum + '/' + position.name, true);
								xhr.onload = function(e) {
									if (this.status == 200) {
										console.log(this.responseText);
										setSum(0);
									}
								};
								xhr.send();
							}, false);
						});
						
						infoWindow.open(map, marker);

					});
				})(artefacts[i], artefacts[i].name, marker);

				var zone = new google.maps.Circle({
					map: map,
					center: pos,
					radius: 100,
					strokeColor: 'black',
					strokeOpacity: 0.8,
					strokeWeight: 2,
					fillColor: 'green',
					fillOpacity: 0.4
				});
			}
		};

		var setSum = function (sum) {
			var leptons = document.querySelector('#leptons');
			var span = leptons.querySelectorAll('span')[0];
			var badge = leptons.querySelectorAll('span')[1];
			span.innerText = sum;
			badge.innerHTML = 0;
		};

		function highlightClosestBounty() {
			// var i;
			// // for (i = 0; i < highlights.length; i++) {
			// // 	highlights[i].setMap(null);
			// // }
			var leptons = document.querySelector('#leptons');
			var span = leptons.querySelectorAll('span')[0];
			var badge = leptons.querySelectorAll('span')[1];

			for (i = 0; i < coins.length; i++) {

				var dist = norm(position, coins[i].pos);
				
				if (dist < 1.5*coins[i].radius) {
					var html = parseInt(badge.innerHTML) || 0;
					badge.innerHTML = '+' + (html+5); 
					coinsMarker[i].setMap(null);
					var sum = parseInt(span.innerHTML)+5;
					span.innerHTML = sum;
					position.sum = sum;
					var cn = parseInt(localStorage.getItem('coins'));
					cn--;
					localStorage.setItem('coins', cn);
					var xhr = new XMLHttpRequest();
					xhr.open('GET', '/updatesum/' + sum + '/' + position.id, true);
					xhr.onload = function(e) {
					if (this.status == 200) {
						console.log(this.responseText);
						}
					};
					xhr.send();
				}
			}

			// 	// 	highlights.push(c);
			// 	// }

			// 	// var dist = norm(position, coins[i].pos);
			// 	// if (dist < 1.5*coins[i].radius)
			// 	// 	(function(marker, pos){
			// 	// 		google.maps.event.addListener(marker, 'click', function(event){
			// 	// 			infoWindow.setOptions({
			// 	// 				position: new google.maps.LatLng(pos.lat, pos.lng),
			// 	// 				title: 'Infowindow',
			// 	// 				content: '<h2><a href="#">Collect</a></h2>'
			// 	// 			});
			// 	// 			var dist = norm(position, coins[coins.length-1].pos);
			// 	// 			console.log(dist);
			// 	// 			infoWindow.open(map, marker);
			// 	// 		});
			// 	// 	})(coinsMarker[i], coins[i].pos);

			// }
		}

		function norm(point1, point2) {
			var R = 6371; // km
			var dLat = radians(point2.lat - point1.lat);
			var dLon = radians(point2.lng - point1.lng);
			var lat1 = radians(point1.lat);
			var lat2 = radians(point2.lat);

			var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
			        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
			var d = R * c * 1000;
			return d;
		}

		function radians(degrees) {
			return (Math.PI * degrees) / 180;
		}
		
		var setCurrentPos = function(lat, lng) {
			position.me.setMap(null);
			var marker = new google.maps.Marker({
				position: new google.maps.LatLng(lat, lng),
				map: map,
				animation: google.maps.Animation.BOUNCE,
				title:'You!',
				icon: 'img/spartan.png'
			});
			position.me = marker;
			google.maps.event.addListener(marker, 'click', function(event){
				infoWindow.setOptions({
					position: new google.maps.LatLng(lat, lng),
					title: 'Infowindow',
					content: '<h2>This is you</h2><h5>Let\'s start collecting some coins for the army</h5>'
				});
				infoWindow.open(map, marker);
			});
		
		};

		function showDirections(dirResult, dirStatus) {
			if (dirStatus != google.maps.DirectionsStatus.OK) {
				alert('Directions failed: ' + dirStatus);
				return;
			}

			var lat;
			var lng;

			path = dirResult.routes[0].overview_path;
			for (var i = 0; i < path.length; i++) {
				lat = path[i].$a;
				lng = path[i].ab;
				var marker = new google.maps.Marker({
					position: new google.maps.LatLng(lat, lng),
					map: map,
					title:'Money!',
					icon: 'img/coin.png'
				});
				coinsMarker.push(marker);
				coins.push({
					pos: {
						lat: lat,
						lng: lng
					},
					radius: 5
				});
			}
		
		}

		function getDirections(destination) {
			localStorage.setItem('destination', destination);
			var toStr = destination;
			var latLng = new google.maps.LatLng(position.lat, position.lng);
			var dirRequest = {
				origin: latLng,
				destination: toStr,
				travelMode: google.maps.DirectionsTravelMode.WALKING,
				unitSystem: google.maps.DirectionsUnitSystem.METRIC,
				provideRouteAlternatives: false
			};
			dirService.route(dirRequest, showDirections);
		}

		var generateCoins = function (lat, lng) {
			
			var max = parseInt(localStorage.getItem('coins'));
			console.log(max);
			for(var i = 0; i < max; ++i) {
				lat = randomCoord(lat);
				lng = randomCoord(lng);
				var pos = new google.maps.LatLng(lat, lng);
				coins.push({
					pos: {
						lat: lat,
						lng: lng
					},
					radius: 5
				});
				var marker = new google.maps.Marker({
					position: pos,
					map: map,
					title:'5 Leptons',
					icon: 'img/coin.png'
				});
				coinsMarker.push(marker);
				var dist = norm(position, coins[coins.length-1].pos);
				if (dist < 1.5*coins[coins.length-1].radius)
					(function(marker){
						google.maps.event.addListener(marker, 'click', function(event){
							infoWindow.setOptions({
								position: new google.maps.LatLng(lat, lng),
								title: 'Infowindow',
								content: '<h2><a href="#">Collect</a></h2>'
							});
							var dist = norm(position, coins[coins.length-1].pos);
							console.log(dist);
							infoWindow.open(map, marker);
						});
					})(marker);
			}
			if((Date.now() - parseInt(localStorage.getItem('time')))/1000 > 3600) {
				localStorage.setItem('time', Date.now());
				localStorage.setItem('coins', 10);
			}
			if(!localStorage.getItem('coins'))
				localStorage.setItem('coins', 10);
			if(!localStorage.getItem('time'))
				localStorage.setItem('time', 10);
		};

		var randomCoord = function (nr) {
			nr *= 100000;
			if (parseInt(Math.random()*10,10) % 2)
				nr += parseInt(Math.random()*10,10);
			else
				nr -= parseInt(Math.random()*10,10);
			nr /= 100000;
			return nr;
		};

		return {
			getPosition : getPosition,
			setMapOrigin: setMapOrigin,
			getDirections: getDirections
		};
	};
	return map();
});