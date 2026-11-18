
function mvcBurger(){
  if (window.innerWidth <= 860) { document.body.classList.toggle("mvc-side-open"); return; }
  document.body.classList.add("mvc-anim");
  var h = !document.body.classList.contains("mvc-side-hidden");
  document.body.classList.toggle("mvc-side-hidden", h);
  try { localStorage.setItem("mova-redactor-side", h ? "hidden" : "shown"); } catch (e) {}
}
try { if (localStorage.getItem("mova-redactor-side") === "hidden") document.body.classList.add("mvc-side-hidden"); } catch (e) {}
