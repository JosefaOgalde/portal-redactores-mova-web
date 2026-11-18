
(function(){
  function act(){
    var paris=document.body.classList.contains("mova-in-paris");
    var ini=!!document.querySelector("#view-inicio.active");
    var rv=document.getElementById("view-redaccion"), ri=document.getElementById("view-iniciativas"), step=(ri&&ri.classList.contains("active"))?"iniciativas":((rv&&rv.classList.contains("active"))?"redaccion":"revision");
    var key=paris?step:(ini?"inicio":"hub");
    document.querySelectorAll(".mvc-item[data-mvc]").forEach(function(b){b.classList.toggle("on",b.dataset.mvc===key)});
    var t=document.getElementById("mvcTitle");
    if(t)t.innerHTML=paris?(step==="iniciativas"?"Paris / <span>Iniciativas</span>":step==="redaccion"?"Paris / <span>Paso 2</span>":"Paris / <span>Paso 1</span>"):(ini?"Paris / <span>Inicio</span>":"Clientes / <span>Redactor</span>");
    document.querySelectorAll(".mvc-steps button").forEach(function(b){
      b.classList.toggle("on",b.dataset.step===step);
      var src=document.querySelector('.nav button[data-view="'+b.dataset.step+'"]'); b.disabled=!!(src&&src.disabled);
    });
    var bar=document.getElementById("mvcBar"); if(bar)bar.style.width=step==="redaccion"?"100%":"50%";
  }
  document.addEventListener("click",function(e){
    if(!e.target.closest(".mvc-burger"))document.body.classList.contains("mvc-side-open")&&document.body.classList.remove("mvc-side-open");
    var b=e.target.closest(".mvc-steps button"); if(b){var src=document.querySelector('.nav button[data-view="'+b.dataset.step+'"]'); if(src&&!src.disabled)src.click();}
    setTimeout(act,30);
  });
  var pend=0;var mo=new MutationObserver(function(){if(pend)return;pend=1;requestAnimationFrame(function(){pend=0;act()})});
  mo.observe(document.body,{attributes:true,attributeFilter:["class"]});
  document.querySelectorAll(".mova-shell-view,.view,.nav button").forEach(function(el){mo.observe(el,{attributes:true,attributeFilter:["class","disabled"]})});
  act();
})();
