/* ICS 產生器：模板 + 起始日 → .ics 檔 */
window.ICS=(function(){
  function pad(n){return (n<10?"0":"")+n}
  function z(d){
    return d.getUTCFullYear()+pad(d.getUTCMonth()+1)+pad(d.getUTCDate())+"T"+
           pad(d.getUTCHours())+pad(d.getUTCMinutes())+"00Z";
  }
  function esc(s){return String(s||"").replace(/[\\;,]/g,function(m){return "\\"+m}).replace(/\n/g,"\\n")}
  function fold(l){
    var out=[],s=l;
    while(s.length>73){out.push(s.slice(0,73));s=" "+s.slice(73)}
    out.push(s); return out.join("\r\n");
  }
  function build(tpl,startStr,weeks){
    var p=startStr.split("-"),
        base=new Date(+p[0],+p[1]-1,+p[2],0,0,0,0),
        reps=tpl.weekly?(weeks||1):1,
        L=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Secalender//Template//ZH","CALSCALE:GREGORIAN","METHOD:PUBLISH",
           "X-WR-CALNAME:"+esc(tpl.title)],
        stamp=z(new Date()), n=0;
    for(var r=0;r<reps;r++){
      for(var i=0;i<tpl.items.length;i++){
        var it=tpl.items[i],
            s=new Date(base.getTime()),
            e;
        s.setDate(s.getDate()+it.d+r*7);
        s.setHours(it.h,it.m||0,0,0);
        e=new Date(s.getTime()+(it.dur||60)*60000);
        n++;
        L.push("BEGIN:VEVENT");
        L.push("UID:"+tpl.id+"-"+r+"-"+i+"-"+stamp+"@secalender.com");
        L.push("DTSTAMP:"+stamp);
        L.push("DTSTART:"+z(s));
        L.push("DTEND:"+z(e));
        L.push(fold("SUMMARY:"+esc(it.title)));
        if(it.loc) L.push(fold("LOCATION:"+esc(it.loc)));
        var note=(it.note?it.note+"\n":"")+"來自 Secalender 模板："+tpl.title;
        L.push(fold("DESCRIPTION:"+esc(note)));
        L.push("END:VEVENT");
      }
    }
    L.push("END:VCALENDAR");
    return {text:L.join("\r\n"),count:n};
  }
  function download(tpl,startStr,weeks){
    var r=build(tpl,startStr,weeks),
        blob=new Blob([r.text],{type:"text/calendar;charset=utf-8"}),
        url=URL.createObjectURL(blob),
        a=document.createElement("a");
    a.href=url; a.download=tpl.id+".ics";
    document.body.appendChild(a); a.click();
    setTimeout(function(){URL.revokeObjectURL(url);a.remove()},1500);
    return r.count;
  }
  return {build:build,download:download};
})();
