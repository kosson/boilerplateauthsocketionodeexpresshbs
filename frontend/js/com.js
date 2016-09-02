var socket = io.connect('//localhost:3000');

// stabileste conexiunea
socket.on('connect', function (data) {

  // emite pe canalul mesaje un salut (canalul este construi de server anterior)
  socket.emit('mesaje', 'Salut server!');

  // ascultare pe canalul mesaje
  socket.on('mesaje', function(data){
    console.log(`Mesajul de la server este: ${data}`);
  });

  // TODO: verifică dacă în bază se află id-ul de users
  // Dacă există, extrage informația și salută utilizatorul în homepage
  // Ca să fie mai simpatic http://www.cronj.com/blog/browser-push-notifications-using-javascript/
});

// funcție de redirectare după verificarea credențialelor
function redirect(path){
  window.location = path;
};
