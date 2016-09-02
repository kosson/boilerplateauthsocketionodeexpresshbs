function createUser(){
  // capturează valorile
  var name      = document.getElementById('name').value;
  var email     = document.getElementById('email').value;
  var password  = document.getElementById('password').value;

  // obiect de test pentru a vedea pipeline-ul
  var userObj = {
    name: name,
    email: email,
    password: password
  };

  // TODO: Fă sanitizare pentru valori

  // emite datele in socket
  socket.emit('createUser', userObj);

  // gestionarea afisarii msajelor si redirect in caz de creare cu succes
  socket.on('createUser', function(obi){

    var afisMesaj = function afisMesaj(){
      $('#mesaje').empty();                           // curăță mesajul anterior
      $('#mesaje').append($('<p>').text(obi.mesaj));  // introdu mesajul nou
    };

    if(obi.user === true){
      afisMesaj(); // daca deja există userul
    } else {
      afisMesaj(); // userul a fost creat
      setTimeout(redirect('/api'), 3000);
    }

  });

  return false;                         // impiedici refreshul paginii
};
