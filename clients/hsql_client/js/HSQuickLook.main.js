/*******************************************************************************
 * HS Quick Look
 * 
 * Authors: Hirokazu Odaka, Soki Sakurai
 * Date: 2012-10-14 (alpha)
 * Date: 2014-04-07 (v0.5.1)
 * Date: 2014-12-19 (v0.6.0)
 * 
 ******************************************************************************/

/* Global variable */
var HSQuickLook = HSQuickLook || {};

/* The anonymous function of this script */
(function() {
  /***************************************************************************
   * Exported variables
   */
  HSQuickLook.main = {};
  HSQuickLook.main.schema = null;

  /***************************************************************************
   * Parameters
   */
  var draggableTables = false;
  var draggableGraphs = true;

  /***************************************************************************
   * Basic variables
   */
  var ws = null;
  var schemaList;
  var paused = false;

  /***************************************************************************
   * Variables about the trend graphs
   */
  var graphs = new Array();
  var multiGraphs = new Array();
  var keyToGraphs = new Array();
  var xWidths = new Array();
  var yMaxs = new Array();
  var tOrigins = new Array();

  /***************************************************************************
   * Main
   */
  $(document).ready(
    function() {
      $.ajaxSetup({
        cache: false
      });
      bindEventForms();
      $.getJSON("user_data/user_configuration.json")
          .done(initialize)
          .fail(function() {
            alert("User configuraion file is not found.");
          });
    });

  /***************************************************************************
   * Initialization
   */
  function bindEventForms() {
    // ws-form
    $("input#button-connect").click(openConnection);
    $("input#ws-host").keypress(preventDefaultEnterKey);

    // contents-form
    $("select#selected-group").change(loadDataSheetList);
    $("select#selected-data-sheet").change(loadDataSheet);

    // mode-form
    $("input#mode-ql").click(enterQLMode);
    $("input#mode-paused").click(pause);

    // time-form
    $("input#time0").keypress(enterDLModeByEvent);
    $("input#time1").keypress(enterDLModeByEvent);
    $("input#time2").keypress(enterDLModeByEvent);
    $("input#time3").keypress(enterDLModeByEvent);
    $("input#time4").keypress(enterDLModeByEvent);
    $("input#time5").keypress(enterDLModeByEvent);
    $("input#request-time").click(enterDLMode);

    // log-section
    $("input#button-clear-log").click(clearLog);
  }

  function initialize(userConfig) {
    var title = userConfig["title"];
    var host = userConfig["ws_host"];
    var port = userConfig["ws_port"];
    var group;
    var groupHtml;

    if (title === void 0) {
      title = "HS Quick Look";
    }
    $('h1.title').html(title);
    $('title').html(title);

    if (host === void 0 || host == "") {
      host = location.hostname;
    }
    if (port === void 0) {
      host = "8080";
    }
    $("#ws-host").val(host + ":" + port);

    schemaList = userConfig["schema_list"];
    for (group in schemaList) {
      groupHtml = $("<option />").html(group).attr("value", group);
      $("#selected-group").append(groupHtml);
    }

    setCurrentTime();
    loadDataSheetList();
    openConnection();
  }

  function setCurrentTime() {
    var t = new Date();
    $('input#time0').attr("value", t.getUTCFullYear());
    $('input#time1').attr("value", t.getUTCMonth() + 1);
    $('input#time2').attr("value", t.getUTCDate());
    $('input#time3').attr("value", t.getUTCHours());
    $('input#time4').attr("value", t.getUTCMinutes());
    $('input#time5').attr("value", t.getUTCSeconds());
  }

  function loadDataSheetList() {
    var group = $("#selected-group").val();
    var schema = schemaList[group];
    var target = $("#selected-data-sheet").html("");
    var title = $("<option />").html("").attr("value", "").attr("label", "Select data sheet");
    var dataSheet;
    var dataSheetHtml;
    target.append(title);
    for (dataSheet in schema) {
      dataSheetHtml = $("<option />").html(dataSheet).attr("value", dataSheet);
      target.append(dataSheetHtml);
    }
  }

  function preventDefaultEnterKey(e) {
    var KC_ENTER = 13;
    if (e.keyCode == KC_ENTER) {
      e.preventDefault();
    }
  }

  /***************************************************************************
   * Log
   */
  function log(message) {
    var messageElement = $("<div />").html(message);
    $('div#log').prepend(messageElement);
  }

  function clearLog() {
    $('div#log').html('');
  }

  /***************************************************************************
   * WebSocket connection
   */
  function openConnection() {
    var host;
    closeConnection();
    host = "ws://" + $("#ws-host").val();
    ws = new WebSocket(host);

    ws.onopen = function() {
      log("WebSocket opened.");
      sendTimeNow();
      $("#button-connect").val("Close");
      $("#button-connect").unbind("click", openConnection);
      $("#button-connect").click(closeConnection);
    };

    ws.onclose = function() {
      log("WebSocket closed.");
      $("#button-connect").val("Open");
      $("#button-connect").unbind("click");
      $("#button-connect").click(openConnection);
    };

    ws.onmessage = function(e) {
      // log("WebSocket message: "+e.data);
      if (!paused) {
        updateDataSheet(e.data);
      }
    };
  }
  
  function closeConnection() {
    if (ws) {
      ws.close();
      ws = null;
    }
  }

  /***************************************************************************
   * Time control
   */
  function enterQLMode() {
    if (paused) {
      paused = false;
    } else {
      $("input#mode-paused").attr("disabled", false);
      sendTimeNow();
    }
  }

  function enterDLMode() {
    paused = false;
    $("input[name='mode']").val([ "mode-dl" ]);
    $("input#mode-paused").attr("disabled", true);
    sendTime();
  }

  function sendTime() {
    var year = $('input#time0').val();
    var month = $('input#time1').val();
    var day = $('input#time2').val();
    var hour = $('input#time3').val();
    var minute = $('input#time4').val();
    var second = $('input#time5').val();
    var message = '{"time": "DL ' + year + ':' + month + ':' + day + ':'
        + hour + ':' + minute + ':' + second + '"}';
    ws.send(message);
  }

  function sendTimeNow() {
    var message = '{"time": "QL" }';
    ws.send(message);
  }

  function pause() {
    paused = true;
  }

  function enterDLModeByEvent(e) {
    var KC_ENTER = 13;
    if (e.keyCode == KC_ENTER) {
      e.preventDefault();
      enterDLMode();
    }
  }

  /***************************************************************************
   * Data sheet
   */
  function loadDataSheet() {
    var groupName;
    var dataSheetName = $("#selected-data-sheet").val();
    var fileName;

    if (dataSheetName == "") {
      return;
    }

    groupName = $("#selected-group").val();
    fileName = schemaList[groupName][dataSheetName];

    if (!ws) {
      alert("WebSocket is not connected. Please connect to WS server.");
      return;
    }

    $("title").html(dataSheetName);
    
    clearGraphs();

    $.ajax({
      url : fileName,
      // dataType : 'json',
      dataType : 'script',
      success : buildDataSheet,
      error : function() {
        alert("Failed to read " + fileName + ".");
      }
    });
  }

  function buildDataSheet() {
    // display dummy time
    var ti = "-1";
    var unixtime = "2112-09-03 00:00:00 UTC";
    $('p#time').html(unixtime + " | TI: " + ti);

    // main tables
    var target = $('div#main-tables').html("");
    var schema = HSQuickLook.main.schema;
    for (var i=0; i<schema.length; i++) {
      var tableInfo = schema[i];
      if (tableInfo.collection !== void 0) {
        var table = createTable(tableInfo);
        target.append(table);
        initializeTable(tableInfo);
        ws.send(getRequestMessage(tableInfo));
      }
    }

    if (draggableTables) {
      $(".ql_table").draggable();
    }
  }

  function updateDataSheet(data) {
    var dataEval = JSON.parse(data);
    if (dataEval == [])
      return;

    var schema = HSQuickLook.main.schema;
    var timeUpdated = false;
    for (var i=0; i<schema.length; i++) {
      var tableInfo = schema[i];
      var documentLabel = getDocumentLabel(tableInfo);
      var dataObject = dataEval[documentLabel];
      if (dataObject !== void 0) {
        if (!timeUpdated) {
          // display time
          var ti = dataObject["TI"] >>> 0;
          var unixtime = dataObject["UNIXTIME"];
          $('p#time').html(unixtime + " | TI: " + ti);
          timeUpdated = true;
        }
        updateTable(tableInfo, dataObject, ti);
      }
    }
  }

  /***************************************************************************
   * Data table
   */
  function getBlockName(tableInfo) {
    return tableInfo.blockName;
  }

  function getTableName(tableInfo) {
    var tableName = tableInfo.tableName;
    if (tableName === void 0) {
      return getBlockName(tableInfo);
    }
    return tableName;
  }

  function getTableTitle(tableInfo) {
    var tableTitle = tableInfo.tableTitle;
    if (tableTitle === void 0) {
      return getTableName(tableInfo);
    }
    return tableTitle;
  }

  function getTableID(tableInfo) {
    var collection = tableInfo.collection;
    var directory = tableInfo.functionalObject;
    var directory1 = directory.split('/').join('_').split('.').join('_');
    var document = tableInfo.attributeSequence;
    var document1 = document.split('.').join('_');
    var table = getTableName(tableInfo);
    return (collection + '-' + directory1 + '-' + document1 + '-' + table);
  }

  function getRequestMessage(tableInfo) {
    var collection = tableInfo.collection;
    var directory = tableInfo.functionalObject;
    var document = tableInfo.attributeSequence;
    var period = tableInfo.period;
    var message = '{"collection": "' + collection + '", '
        + '"functionalObject": "' + directory + '", '
        + '"attributeSequence": "' + document + '", ' + '"period": "'
        + period + '"}';
    return message;
  }

  function getDocumentLabel(tableInfo) {
    var collection = tableInfo.collection;
    var directory = tableInfo.functionalObject;
    var document = tableInfo.attributeSequence;
    var documentLabel = collection + '/' + directory + '/' + document;
    return documentLabel;
  }

  function createTable(tableInfo) {
    var tableID = getTableID(tableInfo);

    var table = $("<table />").html("");
    table.attr("frame", "border");
    table.attr("rules", "all");
    table.attr("id", "table_" + tableID);
    table.addClass("ql_table");

    var thead = $("<thead />").html("");
    var theadRow = $("<tr />").html("");
    var theadTitle = $("<th />").html(getTableTitle(tableInfo));
    theadTitle.attr("colspan", "2");
    theadTitle.attr("id", "table_" + tableID + "_title");
    theadRow.append(theadTitle);
    thead.append(theadRow);

    var tbody = $("<tbody/>").html("");
    tbody.attr("id", "table_" + tableID + "_body");

    table.append(thead);
    table.append(tbody);

    return table;
  }

  function initializeTable(tableInfo) {
    var tableID = getTableID(tableInfo);
    var contents = tableInfo.contents;

    var tbody = $('tbody#table_' + tableID + '_body').html("");
    for (var key in contents) {
      var info = contents[key];
      var value = 0;
      var type = info.type;
      if (type == "image") {
        value = "<img class=\"image_new\" /><img class=\"image_old\" />";
      }
      tbody.append(makePair(key, value, info, tableID));
    }
  }

  function updateTable(tableInfo, data, ti) {
    var blocks = data["Blocks"];
    var blockData = void 0;
    for (var ib = 0; ib < blocks.length; ib++) {
      if (blocks[ib]["BlockName"] == tableInfo.blockName) {
        blockData = blocks[ib];
        break;
      }
    }
    if (blockData === void 0) {
      return false;
    }
    var values = blockData["Contents"];
    var tableID = getTableID(tableInfo);
    var contents = tableInfo.contents;
    var graphsToDraw = {};
    for (var key in contents) {
      var info = contents[key];
      if (info.type == "trend-graph") {
        var fullKey = tableID + "_" + key;
        for (var i = 0; i < info.group.length; i++) {
          var plotInfo = info.group[i];
          var source = plotInfo.source;
          var convertedValue = Number(convertValue(plotInfo, values[source]));
          var sourceID = tableID + "_" + source + "_graph";
          var time = ti / 64.0;
          if (tOrigins[fullKey] == -1.0) {
            tOrigins[fullKey] = time;
            $("#" + fullKey + "_torigin").html(time);
          }
          time -= tOrigins[fullKey];
          graphs[sourceID].pushData([time, convertedValue]);
          var limitY = graphs[sourceID].getLastYValue()*1.1 + 1.0;
          if (!graphs[sourceID].rangeLocked) {
            while (yMaxs[sourceID] <= limitY) {
              yMaxs[sourceID] = 1.2 * yMaxs[sourceID] + 1.0;
            }
            var graph = keyToGraphs[sourceID][1];
            var graphKey = keyToGraphs[sourceID][0];
            if (graphsToDraw[graphKey] == void 0) {
              graphsToDraw[graphKey] = [graph,
                                        [time-(xWidths[fullKey]+0.5), time+0.5],
                                        [-0.1, yMaxs[sourceID]]];
            } else {
              if (graphsToDraw[graphKey][2][1] < yMaxs[sourceID]) {
                graphsToDraw[graphKey][2][1] = yMaxs[sourceID];
              }
            }
          }
        }
      }
      else{
        if ('source' in info) {
          var source = info.source;
        } else {
          var source = key;
        }
        if (typeof source == "string") {
          var value = values[source];
        } else {
          var value = source.map(function(s) {
            return values[s];
          });
        }
        
        if (value === void 0) {
          continue;
        }    
        updateValue(key, value, info, tableID);
      }
    }
    for (var gkey in graphsToDraw) {
      graphsToDraw[gkey][0].setRangeX(graphsToDraw[gkey][1]);
      graphsToDraw[gkey][0].setRangeY(graphsToDraw[gkey][2]);
      graphsToDraw[gkey][0].plot();
    }
    return true;
  }

  /***************************************************************************
   * Data element
   */
  function makePair(key, rawValue, info, tableID) {
    var type = info.type;
    var elemID = tableID + "_" + key;
    var elemKey = $("<td />").html(key);
    var elemValue = $("<td />").attr("id", elemID).html("");
    if (type == "trend-graph") {
      var groupName = key;
      if (multiGraphs[elemID] === void 0) {
        var cont = createPlotContainer(elemID);
        multiGraphs[elemID] = new HSQuickLook.graph.MultiGraph();
        multiGraphs[elemID].placeholder = "#"+elemID+"_placeholder";
        elemValue.attr("id", elemID);
        elemValue.append(cont);
        elemKey.html(groupName);
      } else {
        alert(elemID + " overlapped!");
        return (void 0);
      }

      var capacity = 600; // default 600 points (= 600 sec if 1Hz)
      var refreshCycle = 4;
      if ('options' in info) {
        if ('xWidth' in info.options) {
          capacity = info.options.xWidth;
          multiGraphs[elemID].capacity = capacity;
        }
        if ('refreshCycle' in info.options) {
          refreshCycle = info.options.refreshCycle;
          multiGraphs[elemID].refreshCycle = refreshCycle;
        }
      }
      xWidths[elemID] = capacity;
      for (var i = 0; i < info.group.length; i++) {
        var plot = info.group[i];
        var sourceID = tableID + "_" + plot.source + "_graph";
        var graph = createTrendCurve(capacity);
        if (plot.mode == "diff") {
          graph.differentialMode = true;
        } else {
          graph.differentialMode = false;
        }
        if('upperBound' in plot){
          graph.upperBound = plot.upperBound;
        }
        if ('options' in plot) {
          var opt = plot.options;
          if (opt.legend !== void 0) {
            graph.data.label = opt.ledend;
          }
          if (opt.color !== void 0) {
            graph.data.color = opt.color;
            graph.data.points.fillColor = opt.color;
          }
          if (opt.pointSize !== void 0) {
            graph.data.points.radius = opt.pointSize;
          }
        }
        graphs[sourceID] = graph;
        yMaxs[sourceID] = 0.0;
        multiGraphs[elemID].addGraph(graph);
        keyToGraphs[sourceID] = [elemID, multiGraphs[elemID]];
      }

      tOrigins[elemID] = -1.0;
      var tokey = $("<td />").html("TOrigin");
      var tovalue = $("<td />").attr("id", elemID + "_torigin").html("");
      var totr = $("<tr />").append(tokey).append(tovalue);
      elemValue.append(totr);
    } else {
      var value = convertValue(info, rawValue);
      var status = valueStatus(info, value);
      var valueFormated = formatValue(info, value);
      elemValue = $("<td />").attr("id", elemID).html(valueFormated);

      addValueClass(elemValue, status, type);
    }
    var pair = $("<tr />").append(elemKey).append(elemValue);
    return pair;
  }

  function createTrendCurve(capacity) {
    var graph = new HSQuickLook.graph.TrendCurve();
    graph.setCapacity(capacity);
    graph.setRangeX([0.0, 30.0]);
    graph.setRangeY([-0.5, 10.0]);
    graph.options.xaxis.axisLabel = "Time (s)";
    graph.options.yaxis.axisLabel = "Value";
    return graph;
  }

  function setPlotContainerAction(container, graph) {
    container.resizable({
      handles : "se"
    });
    container.dblclick(function() {
      graph.plot();
    });
    container.bind("dblTap", function() {
      graph.plot();
    });
  }

  function addValueClass(target, status, type) {
    if (status != "") {
      var statusClass = "status-" + status;
      target.addClass(statusClass);
    }
    target.addClass("type-" + type);
  }

  function updateValue(key, rawValue, info, tableID) {
    var elemID = tableID + "_" + key;
    var target = $("#" + elemID);

    var value = convertValue(info, rawValue);
    var status = valueStatus(info, value);
    var type = info.type;
    if (type == "image") {
      target.removeClass("display_phase1").addClass("display_phase0");
      var image1 = target.children("img.image_new");
      var image2 = target.children("img.image_old");
      var data = JSON.parse(value);
      var data64 = data.data.replace(/\s/g, '');
      var binaryData = atob(data64);
      var mimeType = data.type;
      var height = data.height;
      var width = data.width;

      var oldBlobURL = image2.attr("src");
      var currentBlobURL = image1.attr("src");
      var newBlobURL = createImageURL(binaryData, mimeType);
      image2.attr({
        "src" : newBlobURL,
        "height" : height,
        "width" : width
      });
      image1.removeClass("image_new").addClass("image_old");
      image2.removeClass("image_old").addClass("image_new");

      setTimeout(
        function() {
          target.removeClass("display_phase0").addClass(
            "display_phase1");
        }, 250);

      if (oldBlobURL) {
        var URL = window.URL || window.webkitURL;
        URL.revokeObjectURL(oldBlobURL);
      }
    } else if (type == "trend-graph") {
    } else {
      var valueFormated = formatValue(info, value);
      target.html(valueFormated);
      target.removeClass();
      addValueClass(target, status, type);
    }
    return value;
  }

  function createImageURL(binaryData, mimeType) {
    var buf = new ArrayBuffer(binaryData.length);
    var view = new Uint8Array(buf);
    for (var i=0; i<view.length; i++) {
      view[i] = binaryData.charCodeAt(i);
    }
    var blob = new Blob([view], {
      "type" : mimeType
    });
    var URL = window.URL || window.webkitURL;
    var blobURL = URL.createObjectURL(blob);
    return blobURL;
  }

  function valueStatus(info, value) {
    if ('status' in info) {
      var status = info.status;
      if (typeof status == "function") {
        status = status(value);
      }
    } else {
      var status = "";
    }
    return status;
  }

  function convertValue(info, rawValue) {
    var value = rawValue;
    if ('conversion' in info) {
      var conversion = info.conversion;
      if (typeof conversion == "function") {
        value = conversion(value);
      }
    } else {
      if (info.type == "uint") {
        value = value >>> 0;
      }
    }
    return value;
  }

  function formatValue(info, value) {
    var format = info.format;
    var valueFormated = (format === void 0) ? value : sprintf(format, value);
    return valueFormated;
  }

  /***************************************************************************
   * Image display control
   */
  function displayImages() {
    $(".display_phase0").removeClass("display_phase0").addClass("display_phase1");
  }

  /***************************************************************************
   * Trend curve plots
   */
  function createPlotContainer(plotid) {
    var dc = $("<div />").attr("id", plotid + "_graph").addClass("demo-container");
    var ph = $("<div />").attr("id", plotid + "_placeholder").addClass("demo-placeholder");
    dc.append(ph);
    // dc.addClass("draggable");
    return dc;
  }
  
  function clearGraphs() {
    delete graphs;
    delete multiGraphs;
    delete keyToGraphs;
    delete xWidths;
    delete yMaxs;
    delete tOrigins;
    graphs = new Array();
    multiGraphs = new Array();
    keyToGraphs = new Array();
    xWidths = new Array();
    yMaxs = new Array();
    tOrigins = new Array();        
  }

})(); /* end of the anonymous function */
