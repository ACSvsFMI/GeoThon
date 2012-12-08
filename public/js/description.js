var elem = document.querySelector('.description');
var tds = document.querySelectorAll('td');
var imgs = document.querySelectorAll('.modal img');

function updateArgos() {
	elem.innerText = 'The Argos tribe comes from a long generation of warriors. They have to prove their abilities in the fight for territory against the mighty Naxos tribe.';
}

function updateNaxos() {
	elem.innerText = 'The Naxos have a long history of conquering and they are currently on a quest to dominate every artifact on the map. They could only be stopped by the powerful Argos Tribe, in an epic fight for territory.';
}

tds[0].addEventListener('mouseover', updateArgos, false);
tds[1].addEventListener('mouseover', updateNaxos, false);
imgs[0].addEventListener('mouseover', updateArgos, false);
imgs[1].addEventListener('mouseover', updateNaxos, false);