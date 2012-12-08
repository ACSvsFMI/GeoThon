define(function(){

	var interfaceUpdates = function () {

		var setSum = function (sum) {
			var leptons = document.querySelector('#leptons');
			var span = leptons.querySelectorAll('span')[0];
			var badge = leptons.querySelectorAll('span')[1];
			span.innerHTML = sum;
			badge.innerHTML = 0;
		};

		return {
			setSum: setSum
		};

	};

	return interfaceUpdates();

});