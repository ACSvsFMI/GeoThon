var async = require('async');

async.parallel([
    function(callback){
        setTimeout(function(){
            callback(null, 'one');
        }, 200);
    },
    function(callback){
        setTimeout(function(){
            callback(null, 'two');
        }, 100);
    },
],
// optional callback
function(err, results){
	console.log(results);
});
