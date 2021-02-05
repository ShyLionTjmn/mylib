<?php

var $db=NULL;
var $in_transaction=FALSE;

function run_query($query, $exit_on_error=TRUE) {
  global $db;
  if(preg_match("/^update/i", $query) && !preg_match("/where/i", $query)) {
    error_exit("UPDATE without WHERE. ".trace()."\n".$query);
  };
  $res=mysqli_query($db, $query);
  if(!isset($res) || $res === FALSE) {
    if($exit_on_error) {
      if(preg_match("/duplicate/i", mysqli_error($db))) {
        error_exit("Запись с такими параметрами уже существует");
      } else {
        error_exit("DB Query error. Trace: ".trace()."\n".$query."\n".mysqli_error($db));
      };
    } else {
      return FALSE;
    };
  };
  return $res;
};

function return_one($query, $error_if_no_row=FALSE, $error_msg=NULL) {
  global $db;
  $res=run_query($query);
  $ret=mysqli_fetch_assoc($res);
  if(mysqli_errno($db) !== 0) {
    error_exit("DB Fetch error. Trace: ".trace()."\n".$query."\n".mysqli_error($db));
  };
  if($ret === NULL && $error_if_no_row) {
    if($error_msg != NULL) {
      error_exit($error_msg);
    } else {
      error_exit("Null row. Trace: ".trace());
    };
  };
  return $ret;
};

function trace($depth=4) {
  $bt=debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, $depth);
  if(!isset($bt) || count($bt) == 0) {
    return "NO TRACE";
  };
  function _map($item) { return $item['line']; };
  return join(">", array_map("_map", array_reverse($bt)));
};

function trans_start() {
  global $db;
  global $in_transaction;
  if($in_transaction) {
    error_exit("Error. already in transaction. trace: ".trace());
  };
  if(!mysqli_autocommit($db, FALSE)) {
    error_exit("DB error. trace: ".trace()."\n".mysqli_error($db));
  };
  $in_transaction=1;
};

function return_query($query, $index=NULL) {
  global $db;

  $res=run_query($query);
  $ret=Array();
  if(mysqli_num_rows($res)) {
    while($row=mysqli_fetch_assoc($res)) {
      if($index !== NULL) {
        if(!isset($row[$index]) || $row[$index] === NULL) {
          error_exit("No index field $index in result set\n$query");
        };
        $ret[$row[$index]]=$row;
      } else {
        $ret[] = $row;
      };
    };
  };
  return $ret;
};

function return_row($query, $error_on_none=TRUE, $error_on_not_one=TRUE, $exit_message=NULL) {
  $res=return_query($query);
  if(count($res)  >= 1) {
    if($error_on_not_one && count($res) > 1) {
      if($exit_message != NULL) {
        error_exit($exit_message);
      } else {
        error_exit("Not only row returned: ".trace());
      };
    };
    return $res[0];
  };
  if($error_on_none) {
    if($exit_message != NULL) {
      error_exit($exit_message);
    } else {
      error_exit("No row returned: ".trace());
    };
  };
  return NULL;
};


# return array of values of first field of query
function return_array($query) {
  $res=run_query($query);
  $ret=Array();
  while($row=mysqli_fetch_array($res)) {
    $ret[] = $row[0];
  };
  return $ret;
};

function return_single($query, $exit_on_empty=FALSE, $exit_message=NULL) {
  $res=return_array($query);
  if(count($res) == 0) {
    if($exit_on_empty) {
      if($exit_message != NULL) {
        error_exit($exit_message);
      } else {
        error_exit("Null row. Trace: ".trace());
      };
    } else {
      return FALSE;
    };
  } else {
    return $res[0];
  };
};

function close_db($commit=TRUE) {
  global $db;
  global $in_transaction;
  if($db) {
    if($in_transaction) {
      if($commit) {
        mysqli_commit($db);
      } else {
        mysqli_rollback($db);
      };
      $in_transaction=0;
    };
    mysqli_close($db);
    $db=null;
  };
};

function ml($val) {
  global $db;
  return "'%".mysqli_real_escape_string($db,$val)."%'";
};

function mq($val) {
  global $db;
  return "'".mysqli_real_escape_string($db,$val)."'";
};

?>
