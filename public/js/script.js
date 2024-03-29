require.config({
  paths: {
	google: 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false'
  }

});

require(['map', 'user'], function(map, user){
	map.getPosition();
	var faction = document.querySelector('#faction');
	if(faction && faction.innerText.trim() === 'not set')
		user.setFaction();
	else
		console.log('noap');
	document.querySelector('form').addEventListener('submit', function(e){
		var destination = document.querySelector('#destination').value;
		map.getDirections(destination);
		e.preventDefault();
	}, false);
});