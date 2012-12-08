define(function(){
	var map = function () {

		var infoWindow = new google.maps.InfoWindow();
		var coins = [];
		var coinsMarker = [];
		var init = 0;
		var position = {
			lat: 0,
			lng: 0,
			me: new google.maps.Marker()
		};
		var highlights = [];

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
				zoom: 20,
				center: new google.maps.LatLng(lat, lng),
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};
			map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

		};

		function highlightClosestBounty() {
			var i;
			for (i = 0; i < highlights.length; i++) {
				highlights[i].setMap(null);
			}

			for (i = 0; i < coins.length; i++) {
				var dist = norm(position, coins[i].pos);
				
				if (dist < 1.5*coins[i].radius) {
					var c = new google.maps.Circle({
						map: map,
						center: new google.maps.LatLng(coins[i].pos.lat, coins[i].pos.lng),
						radius: coins[i].radius,
						strokeColor: 'black',
						strokeOpacity: 0.2,
						strokeWeight: 1,
						fillColor: 'green',
						fillOpacity: 0.1
					});
					highlights.push(c);
				}

				var dist = norm(position, coins[i].pos);
				if (dist < 1.5*coins[i].radius)
					(function(marker, pos){
						google.maps.event.addListener(marker, 'click', function(event){
							infoWindow.setOptions({
								position: new google.maps.LatLng(pos.lat, pos.lng),
								title: 'Infowindow',
								content: '<h2><a href="#">Collect</a></h2>'
							});
							var dist = norm(position, coins[coins.length-1].pos);
							console.log(dist);
							infoWindow.open(map, marker);
						});
					})(coinsMarker[i], coins[i].pos);

			}
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

		var generateCoins = function (lat, lng) {
			for(var i = 0; i < 10; ++i) {
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
			setMapOrigin: setMapOrigin
		};
	};
	return map();
});