/* ===== renny bossi's rezepte – Steuerung ===== */
(function(){
"use strict";
var D=window.DATEN, S=D.seiten, main=document.getElementById("inhalt");

function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function norm(s){return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");}
function href(u){return "#"+u;}
function sort(l){return l.slice().sort(function(a,b){return a.n.localeCompare(b.n,"de",{sensitivity:"base"});});}
function zeile(u,name,unter){
  var s=S[u]||{};
  return '<li><a href="'+esc(href(u))+'"><span class="bild">'+(s.b?'<img src="image/'+esc(s.b)+'" alt="" loading="lazy" onerror="this.remove()">':'🍽️')+'</span>'+
    '<span><b>'+esc(name)+'</b>'+(unter?'<small>'+esc(unter)+'</small>':'')+'</span><span class="pf">›</span></a></li>';
}
function suchfeld(q){
  return '<form class="such" role="search" id="suchform"><input name="q" type="search" placeholder="Rezept oder Zutat suchen…" aria-label="Rezept oder Zutat suchen" value="'+esc(q||"")+'" autocomplete="off"><button class="knopf" type="submit">Suchen</button></form>';
}

/* ---------- Start ---------- */
function start(){
  var teller=D.fotos.map(function(b){return '<button type="button" data-bild="image/'+esc(b)+'" aria-label="Foto gross anzeigen"><img src="image/'+esc(b)+'" alt="" onerror="this.parentNode.remove()"></button>';}).join("");
  var kat=D.kategorien.map(function(k){return '<a class="kachel" href="'+esc(href(k.u))+'"><img src="image/'+esc(k.b)+'" alt="" onerror="this.remove()"><span>'+esc(k.n)+'</span></a>';}).join("");
  return '<section class="held"><h1>renny bossi\'s<b>rezepte</b></h1><div class="teller">'+teller+'</div>'+suchfeld()+'</section>'+
    '<h2 class="titel">Kategorien</h2><div class="kacheln kat">'+kat+'</div>'+
    '<div class="zwei">'+
      '<a class="gross-knopf" href="#/a-z/"><span class="ico">📖</span><span><b>Alle Rezepte A–Z</b><small>'+D.az.length+' Rezepte</small></span><span class="pf">›</span></a>'+
      '<a class="gross-knopf" href="#/länder/"><span class="ico">🌍</span><span><b>Länder</b><small>'+D.land.length+' Länder</small></span><span class="pf">›</span></a>'+
    '</div>'+
    '<div class="mehr"><a class="knopf hell" href="#/about-1/">👩‍🍳 Über mich</a><a class="knopf hell" href="#/neues-und-links/">✨ Neues und Links</a><a class="knopf hell" href="#/gästebuch/">📝 Gästebuch</a></div>';
}

/* ---------- A–Z ---------- */
function buchst(n){var c=norm(n).replace(/^[^a-z]+/,"").charAt(0).toUpperCase();return c||"#";}
function az(){
  var g={},ord=[];
  sort(D.az).forEach(function(r){var b=buchst(r.n);if(!g[b]){g[b]=[];ord.push(b);}g[b].push(r);});
  var leiste=ord.map(function(b){return '<a href="#/a-z/" data-sprung="b-'+b+'">'+b+'</a>';}).join("");
  var listen=ord.map(function(b){return '<section class="gruppe" id="b-'+b+'"><h2>'+b+'</h2><ul class="liste">'+g[b].map(function(r){return zeile(r.u,r.n,r.o);}).join("")+'</ul></section>';}).join("");
  return '<div class="seite"><h1>Rezepte A–Z</h1><p class="zahl">'+D.az.length+' Rezepte</p><nav class="abc" aria-label="Buchstaben">'+leiste+'</nav>'+listen+'</div>';
}

/* ---------- Suche ---------- */
function suche(q){
  var t='<div class="seite"><h1>Suchen</h1>'+suchfeld(q)+'<div id="treffer" style="margin-top:22px">'+treffer(q)+'</div></div>';
  return t;
}
function treffer(q){
  q=norm(q||"").trim();
  if(!q)return "";
  var w=q.split(/\s+/),titel=[],text=[];
  Object.keys(S).forEach(function(u){
    var s=S[u],n=norm(s.n+" "+s.t),x=D.such[u]||"";
    if(!w.every(function(a){return x.indexOf(a)>-1;}))return;
    (w.every(function(a){return n.indexOf(a)>-1;})?titel:text).push({u:u,n:s.n,o:s.p&&S[s.p]?S[s.p].n:""});
  });
  var all=sort(titel).concat(sort(text));
  if(!all.length)return '<div class="leer">Nichts gefunden. Versuch ein anderes Wort.</div>';
  return '<p class="zahl">'+all.length+(all.length==1?' Treffer':' Treffer')+'</p><ul class="liste">'+all.map(function(r){return zeile(r.u,r.n,r.o);}).join("")+'</ul>';
}

/* ---------- Seite ---------- */
function pfad(u){
  var k=[],p=S[u]&&S[u].p;
  while(p&&S[p]){k.unshift('<a href="'+esc(href(p))+'">'+esc(S[p].n)+'</a>');p=S[p].p;}
  var anfang=u.indexOf("/länder/")===0&&u!=="/länder/"?'<a href="#/länder/">Länder</a>':(u.indexOf("/abc/")===0?'<a href="#/a-z/">Rezepte A–Z</a>':"");
  if(anfang&&!(k.length&&k[0].indexOf('#/länder/"')>-1))k.unshift(anfang);
  k.unshift('<a href="#/">Start</a>');
  return '<nav class="pfad" aria-label="Pfad">'+k.join(" › ")+'</nav>';
}
function seite(u){
  var s=S[u];
  if(!s)return '<div class="seite"><h1>Seite nicht gefunden</h1><a class="knopf" href="#/">Zur Startseite</a></div>';
  var kinder=Object.keys(S).filter(function(v){return S[v].p===u&&s.h.indexOf('href="#'+v+'"')<0;})
    .map(function(v){return {u:v,n:S[v].n};});
  var extra=kinder.length?'<h2 class="titel">Weitere Rezepte</h2><ul class="liste">'+sort(kinder).map(function(r){return zeile(r.u,r.n);}).join("")+'</ul>':"";
  var istListe=!!s.l;
  return '<article class="seite">'+pfad(u)+'<button type="button" class="zurueck" id="zurueck">← Zurück</button>'+
    '<h1>'+esc(s.t)+'</h1>'+
    (istListe?s.h:'<div class="blatt">'+s.h+'</div>')+extra+
    '<div class="unten">'+(istListe?'':'<button type="button" class="knopf hell" onclick="window.print()">🖨️ Drucken</button>')+
    '<a class="knopf hell" href="#/a-z/">📖 Alle Rezepte</a></div></article>';
}

/* ---------- Steuerung ---------- */
var pos={},aktuell=null,schritte=-1;
function zeigen(){
  schritte++;
  if(aktuell)pos[aktuell]=window.scrollY;
  var h=decodeURIComponent(location.hash.slice(1)||"/");
  var q="",teil=h.split("?");h=teil[0];
  if(teil[1])q=decodeURIComponent((teil[1].match(/q=([^&]*)/)||[,""])[1].replace(/\+/g," "));
  if(h.charAt(h.length-1)!=="/")h+="/";
  var html,nav;
  if(h==="/"){html=start();nav="start";}
  else if(h==="/a-z/"){html=az();nav="az";}
  else if(h==="/suche/"){html=suche(q);nav="suche";}
  else{html=seite(h);nav=h.indexOf("/länder/")===0?"land":"az";if(h==="/about-1/"||h==="/neues-und-links/"||h==="/gästebuch/")nav="start";}
  main.innerHTML=html;
  document.querySelectorAll("[data-nav]").forEach(function(a){a.classList.toggle("an",a.getAttribute("data-nav")===nav);});
  var t=main.querySelector("h1");document.title=(h==="/"?"":(t?t.textContent+" – ":""))+"renny bossi's rezepte";
  main.querySelectorAll("img").forEach(function(i){i.addEventListener("error",function(){var f=i.closest(".foto");if(f)f.remove();else i.style.visibility="hidden";});});
  aktuell=location.hash||"#/";
  window.scrollTo(0,pos[aktuell]||0);
  if(nav==="suche"){var inp=main.querySelector("input");if(inp&&!q)inp.focus();}
}
window.addEventListener("hashchange",zeigen);

main.addEventListener("submit",function(e){
  if(e.target.id!=="suchform")return;
  e.preventDefault();
  location.hash="#/suche/?q="+encodeURIComponent(e.target.q.value);
});
main.addEventListener("input",function(e){
  if(e.target.name!=="q")return;
  var t=document.getElementById("treffer");
  if(t){t.innerHTML=treffer(e.target.value);history.replaceState(null,"","#/suche/?q="+encodeURIComponent(e.target.value));aktuell=location.hash;}
});
var grossEl=document.getElementById("gross"),grossBild=document.getElementById("grossbild");
function oeffne(src){grossBild.src=src;grossEl.hidden=false;document.getElementById("zu").focus();}
function schliesse(){grossEl.hidden=true;grossBild.src="";}
grossEl.addEventListener("click",schliesse);
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!grossEl.hidden)schliesse();});
main.addEventListener("click",function(e){
  var s=e.target.closest("[data-sprung]");
  if(s){e.preventDefault();var z=document.getElementById(s.getAttribute("data-sprung"));if(z)z.scrollIntoView({behavior:"smooth"});return;}
  if(e.target.closest("#zurueck")){e.preventDefault();if(schritte>0){schritte-=2;history.back();}else{var cur=decodeURIComponent(location.hash.slice(1));var p=S[cur]&&S[cur].p;location.hash=p?"#"+p:(cur.indexOf("/länder/")===0?"#/länder/":"#/a-z/");}return;}
  var b=e.target.closest("[data-bild]");if(b){oeffne(b.getAttribute("data-bild"));return;}
  var z=e.target.closest("[data-zoom]");if(z){var i=z.querySelector("img");if(i)oeffne(i.src);}
});

/* Schrift */
var stufe=+(localStorage.getItem("schrift")||1);
function setzeSchrift(){document.documentElement.classList.remove("s2","s3");if(stufe>1)document.documentElement.classList.add("s"+stufe);}
setzeSchrift();
document.getElementById("schrift").addEventListener("click",function(){stufe=stufe%3+1;localStorage.setItem("schrift",stufe);setzeSchrift();});

/* Nach oben */
var hoch=document.getElementById("hoch");
window.addEventListener("scroll",function(){hoch.classList.toggle("da",window.scrollY>600);},{passive:true});
hoch.addEventListener("click",function(){window.scrollTo({top:0,behavior:"smooth"});});

if("scrollRestoration" in history)history.scrollRestoration="manual";
zeigen();
})();
