/* Gästebuch: Formular und Einträge auf der Gästebuch-Seite */
(function(){
  var API = "gaestebuch.php";
  function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function datum(t){ return new Date(t*1000).toLocaleDateString("de-CH",{day:"numeric",month:"long",year:"numeric"}); }
  function istGaestebuch(){ return decodeURIComponent(location.hash).indexOf("gästebuch") !== -1; }

  function liste(eintraege){
    var ul = document.getElementById("gbliste");
    if (!ul) return;
    ul.innerHTML = eintraege.length
      ? eintraege.map(function(e){
          return '<li><b>' + esc(e.name) + '</b><small>' + datum(e.zeit) + '</small><p>' + esc(e.text).replace(/\n/g,"<br>") + '</p></li>';
        }).join("")
      : '<li>Noch keine neuen Einträge. Schreib den ersten!</li>';
  }

  function laden(){
    fetch(API).then(function(r){ return r.json(); })
      .then(function(d){ liste(d.eintraege || []); })
      .catch(function(){
        document.getElementById("gbliste").innerHTML = '<li>Das Gästebuch funktioniert erst, wenn die Webseite online ist.</li>';
      });
  }

  function zeigen(){
    if (!istGaestebuch()) return;
    var main = document.getElementById("inhalt");
    if (!main || document.getElementById("gb")) return;

    var box = document.createElement("section");
    box.id = "gb";
    box.className = "blatt gb";
    box.innerHTML =
      '<h2>✍️ Schreib ins Gästebuch</h2>' +
      '<form id="gbform">' +
        '<label>Dein Name<input name="name" maxlength="60" required autocomplete="name"></label>' +
        '<label>Deine Nachricht<textarea name="nachricht" maxlength="1000" rows="5" required></textarea></label>' +
        '<input name="website" tabindex="-1" autocomplete="off" aria-hidden="true" class="gb-falle">' +
        '<button class="knopf" type="submit">Eintragen</button>' +
        '<p id="gbinfo" role="status"></p>' +
      '</form>' +
      '<h2>Einträge</h2>' +
      '<ul id="gbliste" class="gb-liste"><li>Wird geladen…</li></ul>';
    main.appendChild(box);

    document.getElementById("gbform").addEventListener("submit", function(ev){
      ev.preventDefault();
      var form = ev.target, info = document.getElementById("gbinfo"), knopf = form.querySelector("button");
      knopf.disabled = true;
      info.textContent = "Wird gespeichert…";
      fetch(API, { method: "POST", body: new FormData(form) })
        .then(function(r){ return r.json(); })
        .then(function(d){
          if (d.ok) { form.reset(); info.textContent = "Danke für deinen Eintrag! 😊"; liste(d.eintraege || []); }
          else { info.textContent = d.fehler || "Das hat nicht geklappt."; }
        })
        .catch(function(){ info.textContent = "Das hat nicht geklappt. Bitte später nochmals probieren."; })
        .finally(function(){ knopf.disabled = false; });
    });

    laden();
  }

  window.addEventListener("hashchange", function(){ setTimeout(zeigen, 50); });
  setTimeout(zeigen, 50);
})();
