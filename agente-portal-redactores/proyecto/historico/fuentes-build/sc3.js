
(function(){
  var K="mova-redactor-theme",b=document.getElementById("mvcTheme");
  function set(d){document.body.classList.toggle("mvc-dark",d);if(b){b.textContent=d?"☀️":"🌙";b.title=d?"Modo claro":"Modo oscuro";}try{localStorage.setItem(K,d?"dark":"light")}catch(e){}}
  var d=false;try{d=localStorage.getItem(K)==="dark"}catch(e){}
  set(d);
  if(b)b.addEventListener("click",function(){set(!document.body.classList.contains("mvc-dark"))});
})();
