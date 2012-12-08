require.config({
  paths: {
	google: 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false'
  }

});

require(['map', 'user'], function(map, user){
	map.getPosition();
	var faction = document.querySelector('#faction');
	if(faction && faction.innerHTML === 'not set')
		user.setFaction();
});