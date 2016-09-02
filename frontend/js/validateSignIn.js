$.validate({
  modules : 'html5, security',
  lang: 'ro',
  validateOnBlur: true,
  errorMessagePosition : 'top',
  scrollToTopOnError : false,
  onModulesLoaded : function() {
    var optionalConf = {
      fontSize: '12pt',
      padding: '4px',
      bad : 'Foarte, foarte slabă',
      weak : 'Slabă, hai, poți mai bine',
      good : 'Bună',
      strong : 'Super OK!'
    };
    $('input[name="pass_confirmation"]').displayPasswordStrength(optionalConf);
  }
});
