define(function(){
	var user = function () {

		var setFaction = function () {
			var choice = document.querySelectorAll('.faction');
			[].forEach.call(choice, function (f) {
				f.addEventListener('click', function (){
					var xhr = new XMLHttpRequest();
					var userid = document.querySelector('.id').id;
					xhr.open('GET', '/setfaction/' + userid + '/' + this.id, true);
					xhr.onload = function(e) {
						if (this.status == 200) {
							console.log(this.responseText);
							var modal = document.querySelector('.modal');
							modal.style.display = 'none';
						}
					};
					xhr.send('dummy');
				}, false);
			});
		};
	
		return {
			setFaction : setFaction
		};
	};
	return user();
});