const DIV="<DIV/>";
const IMG="<IMG/>";
const SPAN="<SPAN/>";
const LABEL="<LABEL/>";
const TABLE="<TABLE/>";
const THEAD="<THEAD/>";
const TBODY="<TBODY/>";
const TFOOT="<TFOOT/>";
const TR="<TR/>";
const TH="<TH/>";
const TD="<TD/>";
const INPUT="<INPUT/>";
const SELECT="<SELECT/>";
const OPTION="<OPTION/>";
const BR="<BR/>";
const A="<A/>";
const FORM="<FORM/>";
const TEXTAREA="<TEXTAREA/>";

function GMK(bytes) {
  let measure="";
  let div;
  if(bytes >= 1000000000) {
    measure="G";
    div=1000000000;
  } else if(bytes >= 1000000) {
    measure="M";
    div=1000000;
  } else if(bytes >= 1000) {
    measure="K";
    div=1000;
  };

  if(measure == "") return bytes;
  return Number(bytes/div).toFixed(1)+measure;

};

let notLocked = true;
$.fn.animateHighlight = function(highlightColor, duration) {
    let highlightBg = highlightColor || "#FF4444";
    let animateMs = duration || 1500;
    let originalBg = this.css("backgroundColor");
    if (notLocked) {
        notLocked = false;
        this.stop().css("background-color", highlightBg)
            .animate({backgroundColor: originalBg}, animateMs);
        setTimeout( function() { notLocked = true; }, animateMs);
    }
};

$.fn.enterKey = function (fnc) {
    return this.each(function () {
        $(this).keypress(function (ev) {
            let keycode = (ev.keyCode ? ev.keyCode : ev.which);
            if (keycode == '13') {
                fnc.call(this, ev);
            }
        })
    })
};
$.fn.inputStop = function (timeout) {
  $(this)
   .data("input_stop_timeout", timeout)
   .on("input", function() {
     let t=$(this).data("input_stop_timer");
     if(t !== undefined) clearTimeout(t);
     let to=$(this).data("input_stop_timeout");

     let th=$(this);
     $(this).data("input_stop_timer", setTimeout(function() {
       th.data("input_stop_timer", undefined);
       th.trigger("input_stop");
     }, to));
   })
   .on("keydown", function() {
     let t=$(this).data("input_stop_timer");
     if(t !== undefined) clearTimeout(t);
   })
  ;
  return $(this);
};

$.fn.sau=function(key,new_id) {
  let prev_id=$(this).data("prev_id_"+key);
  if(prev_id === undefined) {
    prev_id="";
  };
  $(this).removeClass("autoupdate_"+key+"_"+prev_id);
  $(this).data("prev_id_"+key, "");
  if(new_id !== undefined && new_id != "") {
    $(this).addClass("autoupdate_"+key+"_"+new_id);
    $(this).data("prev_id_"+key, new_id);
  };
  return this;
};

function fau(key,id, root) {
  if(root === undefined) root=$("BODY");
  return root.find(".autoupdate_"+key+"_"+id);
};

$.fn.title = function(title) {
  $(this).prop("title", title)
   .css({"text-decoration": "none"});
  return this;
};

$.fn.dotted = function(title) {
  $(this).prop("title", title)
   .css({"text-decoration-style": "dotted", "text-decoration-line": "underline"});
  return this;
};

RegExp.escape= function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

function dup(obj) { return $.extend(true, {}, obj); };

function keys(obj) {
  let keys = [];

  for(let key in obj) {
    if(obj.hasOwnProperty(key)) {
      keys.push(key);
    };
  };

  return keys;
};
function ln() {
  let e = new Error();
  if (!e.stack) try {
    // IE requires the Error to actually be throw or else the Error's 'stack'
    // property is undefined.
    throw e;
  } catch (e) {
    if (!e.stack) {
      return 0; // IE < 10, likely
    }
  }
  let stack = e.stack.toString().split(/\r\n|\n/);
  // We want our caller's frame. It's index into |stack| depends on the
  // browser and browser version, so we need to search for the second frame:
  let frameRE = /:(\d+):(?:\d+)[^\d]*$/;
  do {
    let frame = stack.shift();
  } while (!frameRE.exec(frame) && stack.length);
  return frameRE.exec(stack.shift())[1];
};

function error_at(message) {
  let e = new Error();
  if (!e.stack) try {
    // IE requires the Error to actually be throw or else the Error's 'stack'
    // property is undefined.
    throw e;
  } catch (e) {
    if (!e.stack) {
      return 0; // IE < 10, likely
    }
  }
  let stack = e.stack.toString().split(/\r\n|\n/);
  // We want our caller's frame. It's index into |stack| depends on the
  // browser and browser version, so we need to search for the second frame:
  let frameRE = /:(\d+):(?:\d+)[^\d]*$/;
  do {
    let frame = stack.shift();
  } while (!frameRE.exec(frame) && stack.length);

  if(message === undefined) message="Program error";
  let line=frameRE.exec(stack.shift())[1];
  error_dialog(message+" at "+line);
};
function addZero(num) {
  if(num > 9) return num.toString();
  return "0"+num.toString();
};

function unix_timestamp(date) {
  if(date === undefined) date=new Date();
  return Math.round(date.getTime()/1000);
};
function from_unix_time(timestamp, relative, never) {
  if(timestamp == 0) return (never==undefined)?"нет":never;
  let now=new Date();

  let date=new Date(timestamp*1000);
  let year=date.getFullYear();
  let month=addZero(date.getMonth()+1);
  let day=addZero(date.getDate());

  let hours=addZero(date.getHours());
  let minutes=addZero(date.getMinutes());
  let seconds=addZero(date.getSeconds());

  let ret_abs=year+"."+month+"."+day+" "+hours+":"+minutes+":"+seconds;
  let ret_today=hours+":"+minutes+":"+seconds;

  if(relative &&
     now.getDate()==date.getDate() &&
     now.getMonth()==date.getMonth() &&
     now.getFullYear()==date.getFullYear()
  ) {
    return ret_today;
  } else {
    return ret_abs;
  };
};
function jstr(obj) {
  return JSON.stringify(obj, null, 2);
};
function error_dialog(message, opts) {
  let dialog=$(DIV).prop("title", "Ошибка")
                   .css("white-space", "pre")
                   .text(message)
                   .appendTo("BODY");
  let d={
    modal:true,
    maxHeight:1000,
    maxWidth:1000,
    minWidth:600,
    buttons: { "Закрыть": function() {$(this).dialog( "close" );} },
    close: function() {
      $(this).dialog("destroy");
      $(this).remove();
    }
  };
  if(opts != undefined) {
    for(let o in opts) {
      d[o]=opts[o];
    };
  };
  dialog.dialog(d);
  dialog.addClass("ui-state-error");
  $("#led").css("background-color", "lightcoral");
};
function show_dialog(message, opts) {
  let dialog=$(DIV).prop("title", "Сообщение").css("white-space", "pre").text(message).appendTo("BODY");
  let d={
    modal:true,
    maxHeight:800,
    maxWidth:1500,
    minWidth:600,
    buttons: { "Закрыть": function() {$(this).dialog( "close" );} },
    close: function() {
      $(this).dialog("destroy");
      $(this).remove();
    }
  };
  if(opts != undefined) {
    for(let o in opts) {
      d[o]=opts[o];
    };
  };
  dialog.dialog(d);
};

function show_confirm(message,func, opts, cancelfunc) {
  let dialog=$(DIV).data("done", 0).prop("title", "Подтвердите действие").css("white-space", "pre").text(message).appendTo("BODY");
  let d={
    modal:true,
    maxHeight:1000,
    maxWidth:1000,
    minWidth:600,
    buttons: {
      "Отменить": function() {$(this).dialog( "close" );},
      "Выполнить": function() { $(this).data("done", 1); $(this).dialog( "close" ); func(); },
    },
    close: function() {
      let done=$(this).data("done");
      $(this).dialog("destroy");
      $(this).remove();
      if(cancelfunc !== undefined && done == 0) { cancelfunc(); };
    }
  };
  if(opts != undefined) {
    for(let o in opts) {
      d[o]=opts[o];
    };
  };
  dialog.dialog(d);
};
function show_confirm_checkbox(message,func, opts) {
  let dialog=$(DIV)
   .prop("title", "Подтвердите действие")
   .css("white-space", "pre")
   .text(message)
   .append($(BR))
   .append($(BR))
   .append( $(LABEL).text("Я все внимательно прочел и подтверждаю действие: ") )
   .append( $(INPUT).prop("type", "checkbox") )
   .appendTo("BODY")
  ;
  let d={
    modal:true,
    maxHeight:1000,
    maxWidth:1000,
    minWidth:600,
    buttons: {
      "Отменить": function() {$(this).dialog( "close" );},
      "Выполнить": function() {
        if(!$(this).find("INPUT").is(":checked")) return;
        $(this).dialog( "close" );
        func();
      },
    },
    close: function() {
      $(this).dialog("destroy");
      $(this).remove();
    }
  };
  if(opts != undefined) {
    for(let o in opts) {
      d[o]=opts[o];
    };
  };
  dialog.dialog(d);
};

function login_dialog(message, success_query, success_func) {
  let dialog=$(DIV).prop("title", "Необходима авторизация").addClass("dialog_start").appendTo("BODY");
  let d={
    modal:true,
    maxHeight:1000,
    maxWidth:1000,
    minWidth:600,
    buttons: {
      "Войти": function() {
        let login=$(this).closest(".dialog_start").find("#login").val();
        let password=$(this).closest(".dialog_start").find("#password").val();
        $(this).dialog( "close" );
        run_query({"action": "login", "login": login, "password": password}, function(data) {
          if(data === undefined || data["ok"] == undefined ||
             (data["ok"] != "ok" && data["ok"] != "fail")
          ) {
            error_dialog("Ошибка процедуры авторизации, at"+ln());
          };
          if(data["ok"] === "ok") {
            run_query(success_query, success_func);
          } else {
            login_dialog("Неверное имя пользователя или пароль", success_query, success_func);
          };
        });
      },
      "Отменить": function() { $(this).dialog( "close" ); },
    },
    close: function() {
      $(this).dialog("destroy");
      $(this).remove();
    }
  };

  if(message !== null) {
    dialog.append( $(DIV).text(message).css("color", "red").css("padding-bottom", "1em") );
  };

  dialog
   .append(
     $(DIV).css("white-space", "nowrap")
      .append( $(LABEL).text("Логин: ") )
      .append( $(INPUT).prop("type", "text").prop("id", "login").prop("placeholder", "логин").prop("autofocus", true) )
      .append( $(LABEL).text(" Пароль: ") )
      .append( $(INPUT).prop("type", "password").prop("id", "password").prop("placeholder", "пароль")
                .enterKey(function() {
                  let dlg=$(this).closest(".dialog_start");
                  dlg.dialog("option", "buttons")['Войти'].apply(dlg);
                })
      )
   )
  ;


  dialog.dialog(d);
};
function run_query(query, successfunc) {
  $("#led").css("background-color", "yellow");
  $.ajax({
    url: AJAX,
    method: 'POST',
    dataType: "json",
    contentType: 'application/json',
    processData: false,
    data: JSON.stringify(query),
    success: function(data) {
      if(data["ok"] != undefined) {
        if(DEBUG) {
          $("#debug").text(JSON.stringify(data, null, 2));
        };
        if(successfunc != null) {
          successfunc(data);
        };
        return;
      };
      let message;
      if(data["error"] != undefined && data["error"] === "no_auth") {
        login_dialog(null, query, successfunc);
        return;
      };
      if(data["error"] != undefined) {
        if(typeof(data["error"]) === "string") {
          message=data["error"];
        } else {
          message=JSON.stringify(data["error"], null, 2);
        };
      } else {
        message=JSON.stringify(data, null, 2);
      };
      error_dialog(message);
      $("#indicator").css("background-color", "lightcoral");
    },
    error: function(e) {
      error_dialog("AJAX request error\n"+(e.responseText !== undefined? e.responseText:""));
      $("#indicator").css("background-color", "lightcoral");
    }
  });
};

function has_right(right) {
  let rights_string=user_rights;

  if(rights_string.match(/^(?:,|) *super *(?:,|)$/i)) {
    return true;
  };
  let reg=new RegExp("(?:^|,) *"+RegExp.escape(right)+" *(?:,|$)","i");
  if(reg.test(rights_string)) {
    return true;
  };
  return false;
};



if(typeof AJAX === "undefined") {
  throw("AJAX variable not defined");
};
