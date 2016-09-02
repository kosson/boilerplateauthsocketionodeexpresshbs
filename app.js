'use strict';

/**
 * REQUIRE - DEPENDINȚE
 */
var Promise     = global.Promise || require('promise'),
    express     = require('express'),
    app         = express(),
    server      = require('http').Server(app),
    io          = require('socket.io')(server),
    mainRouter  = express.Router(),
    exphbs      = require('express-handlebars'),
    morgan      = require('morgan'),
    bodyParser  = require("body-parser"),
    socketioJwt = require('socketio-jwt'),
    mongoose    = require('mongoose'),
    config      = require('./config/config'),
    bcrypt      = require('bcrypt-nodejs'),
    tplHelpers  = require('./app/libs/tplHelpers');
    // ambaleaza middleware-ul Express într-un server http
    // executa socket.io pasandu-i serverul
    // împachetarea serverului în socket.io permite folosirea căii din frontend <script src="/socket.io/socket.io.js" charset="utf-8"></script>
    // și generează fișierul socket.io.js

/**
 * MIDDLEWARE
 */
app.use(express.static('frontend')); // setarea caii către fișierele statice (fisiere handlebars care se compileaza client-side)
app.use('/bower_components', express.static('bower_components')); // creezi un frontend adaptat aplicatiei pe care Express il va construi automat.
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, \Authorization');
  next();
});

/**
 * TEMPLATING cu HANDLEBARS
 */
// Creează o instanță `ExpressHandlebars` cu un layout de start.
// template-urile din frontend/templates/ sunt distribuite client-side
var hbs = exphbs.create({
    defaultLayout: 'home',
    extname      : '.handlebars',
    helpers      : tplHelpers,
    partialsDir: [
      'frontend/templates/',
      'views/partials/'
    ]
});

// MIDDLEWARE NECESAR
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// EXPUNEREA TEMPLATE-URILOR DISTRIBUITE CLIENT-SIDE printr-un MIDDLEWARE construit
function exposeTemplates(req, res, next){
  hbs.getTemplates('frontend/templates', {
    cache      : app.enabled('view cache'),
    precompiled: true
  }).then(function(templates){
    // construiește ob RegExp pentru a elimina extensia ".handlebars" din numele template-urilor
    var extRegex = new RegExp(hbs.extname + '$');
    // Creează un array de template-uri (obiecte) care sunt expuse prin `res.locals.templates`.
    templates = Object.keys(templates).map(function (name) {
      return {
        name    : name.replace(extRegex, ''),
        template: templates[name]
      };
    });
    // Expune template-urile în timpul randării view-urilor.
    if (templates.length) {
      res.locals.templates = templates;
    };
    setImmediate(next);
  }).catch(next);
};

// Expunerea template-urilor se face prin metoda render
/* ROUTARE PE '/' */

app.get('/', function (req, res) {
  res.render('home', {
    title: 'Aplicație'
  }); // afișează template-ul home. Trimite valoare lui {{{title}}}
});

/* RUTA API USERS */
var apiRoutesUsers = require('./app/routes/users');
app.use('/api', apiRoutesUsers);

/**
 * CONECTARI SOCKETS
 */
io.on('connect', function(socket){
  // indica cine se conectează
  console.log(`S-a conectat ${socket.id}`);

  // stabilirea canalului mesaje
  socket.on('mesaje', function(data){
    console.log(`Serverul a primit: ${data}`);
    socket.emit('mesaje', 'Bine ai venit pe canalul mesaje!');
  });

  // CANAL CREARE UTILIZATOR
  socket.on('createUser', function(data){
    var User   = require('./app/models/users'),
        user   = new User();

    // TODO: Fă sanetizare pe valorile primite la signin.

    // Încarcă valorile în model
    user.name     = data.name;
    user.email    = data.email;
    user.password = data.password;

    // cauta utilizator dupa email. daca nu exista salveaza user in baza
    User.count({email: data.email}, function(err, count){
      if (err) throw err;
      if(count){
        // daca a gasit user
        socket.emit('createUser', {user: true, mesaj: 'Exista un user deja. Alt email?'});
      } else {
        // user nu exista si va fi creat unul
        user.save(function(err, user){
          if(err) throw err;
          socket.emit('createUser', {mesaj: 'User creat cu succes'});
        });
      };
    });
  });

  // CANAL LOGIN USER
  socket.on('logUser', function(data){

    var User   = require('./app/models/users'),
        user   = new User();

    // TODO: Fă sanitizare pe valorile primite la login.

    // Încarcă valorile în model
    user.email    = data.email;
    user.password = data.password;

    // selectează persoana din bază care are mailul specificat
    var query =  User.findOne({email: data.email});
    // selectează câmpurile pe care vrei să le aduci în rezultat
    query.select('_id name email password');
    // execută interogarea la un moment viitor când este nevoie
    query.exec(function(err, person) {
              if (err) throw err;
              // console.log(person);
              console.log('person.password este', person.password);
              console.log('data.password este', data.password);

              // CAZUL DE PE LANDING
              if(person.password === data.password){
                var nameuser = person.name;
                socket.emit('logUser', {
                  userExist: true,
                  mesaj: 'Bine ai revenit ' + nameuser
                });
              };

              // CAZUL LOGĂRII
              if(person.comparePassword(data.password)){
                socket.emit('logUser', {
                  userExist: true,
                  user: person,
                  mesaj: 'Bine ai venit!'
                });
                // TODO: mergi în client, capturează obiectul user si fa localStorage cu el
              } else {
                socket.emit('logUser', {mesaj: 'Ceva a mers teribil de prost. Ori emailul, ori parola. Sigur ai cont?'});
              };
            });
  });
});

/**
 * ERROR MANAGEMENT
 */

 // catch 404 and forward to error handler
 app.use(function(req, res, next) {
   var err = new Error('Nu am gasit pagina');
   err.status = 404;
   next(err);
 });

 // error handlers

 // development error handler
 // will print stacktrace
 if (app.get('env') === 'development') {
   app.use(function(err, req, res, next) {
     res.status(err.status || 500);
     res.render('error', {
       message: err.message,
       error: err
     });
   });
 }

 // production error handler
 // no stacktraces leaked to user
 app.use(function(err, req, res, next) {
   res.status(err.status || 500);
   res.render('error', {
     message: err.message,
     error: console.error(err.stack)
    //  error: {}
   });
 });

/**
 * PORNEȘTE SERVER
 */
server.listen(3000, function(){
  console.log('Server pornit pe 3000');
});
