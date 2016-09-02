function login(){
  // capturează valorile
  var email    = document.getElementById('email').value;
  var password = document.getElementById('password').value;

  // creează obiect de login
  var loginObj = {
    email: email,
    password: password
  };

  // emite obiectul în socket
  socket.emit('logUser', loginObj);

  socket.on('logUser', function(obi){

    // funcție de afișare a mesajelor
    var afisMesaj = function afisMesaj(){
      $('#mesaje').empty();                           // curăță mesajul anterior
      $('#mesaje').append($('<p>').text(obi.mesaj));  // introdu mesajul nou
    };

    // dacă a fost trimis de la server obi care are user
    if(obi.userExist === true){
      localStorage.removeItem('userAppX');
      afisMesaj();
      obi.user.timestamp = new Date().getTime();
      localStorage.setItem('userAppX', JSON.stringify(obi.user));
      setTimeout(redirect('/'), 5000);
    }else{
      afisMesaj();
    };
  });
  return false; // previne submitul cu refresh
};
