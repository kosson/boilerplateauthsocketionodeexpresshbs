function verifyExisting(){
  var key      = JSON.parse(localStorage.getItem('userAppX')),
      lastDate = key.timestamp,
      nowDate  = new Date().getTime().toString();

  // Emite obiectul din localStorage pe socket
  socket.emit('logUser', key);

  // ascultă socketul pe logUser
  socket.on('logUser', function(me){

    // funcție de afișare a mesajelor
    var afisMesaj = function afisMesaj(){
      $('#mesaje').empty();                            // curăță mesajul anterior
      $('#mesaje').append($('<H1>').text(me.mesaj));  // introdu mesajul nou
    };

    // dacă a fost trimis de la server obi care are user
    if(me.userExist === true){
      afisMesaj();                                     // afișează întâmpinare
      setTimeout(function(){
        $('#mesaje').empty(); // sterge mesajul
      }, 5000);
    };
  });

  // TODO: implementează funcție de comparare a datelor.
  // Dacă au trecut două săptămâni de la introducerea tokenului în localStorage
  // Pune userul să se logheze din nou.
  // var perPast = compareDates(lastDate, nowDate); // aduce o diferență
  // dacă aduce diferență, șterge tokenul și redirectează la login cu mesaj

  // dacă userul are token sub două săptămâni,
  // trimite date pe luserLog pentru a-l înregistra pe paginile de operare
};
