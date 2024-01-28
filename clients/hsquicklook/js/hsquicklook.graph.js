/*******************************************************************************
 * JGraph.js for HS Quick Look
 *
 * Authors: Soki Sakurai, Hirokazu Odaka
 * Date: 2013-**-**
 * Date: 2014-12-20 | Hirokazu Odaka | new design.
 *
 ******************************************************************************/

/* Global variable */
var HSQuickLook = HSQuickLook || {};

/* The anonymous function of this script */
(function() {
  /***************************************************************************
   * Exported variables
   */
  HSQuickLook.graph = {};

  /***************************************************************************
   * Object prototype TrendCurve
   */
HSQuickLook.graph.TrendCurve = function() {
    var currentData = [void 0, void 0];

    this.placeholder = "";
    this.capacity = -1;
    this.differentialMode = false;
    this.upperBound = 0.0;

    this.config =
    {
      modeBarButtonsToAdd: [
        {
          name:  'Toggle log/linear of X axis',
          icon: Plotly.Icons.pencil,
          click: function (gd) {
            if (this.layout.xaxis.type == "log") {
              this.layout.xaxis.type = "linear";
            }
            else if (this.layout.xaxis.type == "linear") {
              this.layout.xaxis.type = "log";
            }
            else {
              alert("Scale Setting of x axis is invalid: Set linear forcely");
              this.layout.xaxis.type == "linear";
            }
            this.plot();
          }
        },
        {
          name: 'Toggle log/linear of y axis',
          icon: Plotly.Icons.pencil,
          direction: 'up',
          click: function (gd) {
            if (this.layout.yaxis.type == "log") {
              this.layout.yaxis.type = "linear";
            }
            else if (this.layout.yaxis.type == "linear") {
              this.layout.yaxis.type = "log";
            }
            else {
              alert("Scale Setting of y axis is invalid: Set linear forcely");
              this.layout.yaxis.type == "linear";
            }
            this.plot();
          }
        }
      ],
      editable: true,
      displaylogo: false,
      scrollZoom: true,
    };

    this.layout = {
      showlegend: true,
      legend: {
        xanchor: "right",
        yanchor: "top"
      },
      xaxis: {
        type: "linear",
        title: "Time [s]",
        range: [-1.0, +1.0],
      },
      yaxis: {
        type: "linear",
        title: "",
        range: [-1.0, +1.0],
      }
    };

    this.data = {
      x: [],
      y: [],
      type: "scatter",
      mode: "lines+markers",
      name: "data1",
      marker: {
        color:  "black",
        size: 1,
      },
      line: {
        color: "black",
      }
    };

    this.setCurrentData = function (x, y) {
      currentData[0] = x;
      currentData[1] = y;
    };

    this.getCurrentDataX = function () {
      return currentData[0];
    };

    this.getCurrentDataY = function () {
      return currentData[1];
    };
  };

  var TrendCurve = HSQuickLook.graph.TrendCurve;

  TrendCurve.prototype.getLastYValue = function () {
    var data = this.data,
      n = data.x.length;

    if (n > 0) {
      return data.y[n - 1];
    } else {
      return void 0;
    }
  };

  TrendCurve.prototype.setRangeX = function (range) {
    this.layout.xaxis = range;
  };

  TrendCurve.prototype.setRangeY = function (range) {
    this.layout.yaxis = range;
  };

  TrendCurve.prototype.setCapacity = function (capacity) {
    var data = this.data;
    if (capacity > 0 && capacity < data.x.length) {
      data.x.splice(0, data.x.length - capacity);
      data.y.splice(0, data.y.length - capacity);
    }
    this.capacity = capacity;
  };

  TrendCurve.prototype.plot = function () {
    Plotly.newPlot($(this.placeholder).attr('id'), [this.data], this.layout, this.config);
  };

  TrendCurve.prototype.pushData = function (dataPoint) {
    var data = this.data,
      size = data.x.length,
      capacity = this.capacity,
      lastDataX = this.getCurrentDataX(),
      lastDataY = this.getCurrentDataY(),
      newDataX = dataPoint[0],
      newDataY = dataPoint[1];

    this.setCurrentData(newDataX, newDataY);

    if (this.differentialMode == true) {
      if (lastDataX === void 0) {
        return;
      }
      if (newDataX - lastDataX > 0.0) {
        if (newDataY < lastDataY) {
          newDataY += this.upperBound;
        }
        newDataY = (newDataY - lastDataY) / (newDataX - lastDataX);
        data.x.push(newDataX);
        data.y.push(newDataX);
        if (capacity > 0 && size >= capacity) {
          data.x.shift();
          data.y.shift();
        }
      }
    } else {
      data.x.push(newDataX);
      data.y.push(newDataY);
      if (capacity > 0 && size >= capacity) {
        data.x.shift();
        data.y.shift();
      }
    }
  };

  /***************************************************************************
   * Object prototype MultiTrendCurves
   */
  HSQuickLook.graph.MultiTrendCurves = function () {
    var trendCurves = [],
      data = [],
      counter = 0;

    this.placeholder = "";
    this.refreshCycle = 4;
    this.refreshPhase = 1;
    this.timeOrigin = void 0;
    this.xWidth = 600.0;
    this.yMin = -1.0;
    this.yMax = +1.0;
    this.drawn = false;

    this.config ={
      modeBarButtonsToAdd: [
        {
          name: 'Toggle log/linear of x-axis',
          icon: Plotly.Icons.pencil,
          click: function (gd) {
            if (this.layout.xaxis.type == "log") {
              this.layout.xaxis.type = "linear";
            }
            else if (this.layout.xaxis.type == "linear") {
              this.layout.xaxis.type = "log";
            }
            else {
              alert("Scale Setting of x axis is invalid: Set linear forcely");
              this.layout.xaxis.type == "linear";
            }
            this.reStyle(gd,'xaxis.type', this.layout.xaxis.type);
          }
        },
        {
          name: 'Toggle log/linear of y-axis',
          icon: Plotly.Icons.pencil,
          direction: 'up',
          click: function (gd) {
            if (this.layout.yaxis.type == "log") {
              this.layout.yaxis.type = "linear";
            }
            else if (this.layout.yaxis.type == "linear") {
              this.layout.yaxis.type = "log";
            }
            else {
              alert("Scale Setting of y axis is invalid: Set linear forcely");
              this.layout.yaxis.type == "linear";
            }
            this.reStyle(gd,'yaxis.type', this.layout.yaxis.type);
          }
        }
      ],
      // modeBarButtonsToRemove: ['pan2d','select2d','lasso2d','resetScale2d','zoomOut2d'],
      editable: true,
      displaylogo: false,
    };

    this.layout = {
      showlegend: true,
      legend: {
        xanchor: "right",
        yanchor: "top"
      },
      xaxis: {
        type: "linear",
        title: "Time (s)",
        range: [-1.0, +1.0],
      },
      yaxis: {
        type: "linear",
        title: "",
        range: [-1.0, +1.0],
      },
      margin: {
        b: 40,
        l: 40,
        r: 40,
        t: 40
      },
      autosize:true,
    };

    this.addTrendCurve = function (sourceID, curve) {
      trendCurves[sourceID] = curve;
      data.push(curve.data);
    };

    this.getTrendCurve = function (sourceID) {
      return trendCurves[sourceID];
    };

    this.plot = function () {
      if (counter == this.refreshCycle) {
        counter = 0;
      }
      if (counter == this.refreshPhase) {
        if (!this.drawn) {
          Plotly.newPlot($(this.placeholder).attr('id'), data, this.layout, this.config);
          this.drawn = true;
        }
        else {
          Plotly.newPlot($(this.placeholder).attr('id'), data, this.layout, this.config);
        }
      }
      counter += 1;
    };
  };

  var MultiTrendCurves = HSQuickLook.graph.MultiTrendCurves;

  MultiTrendCurves.prototype.setRangeX = function (range) {
    this.layout.xaxis.range = range;
  };

  MultiTrendCurves.prototype.setRangeY = function (range) {
    this.yMin = range[0];
    this.yMax = range[1];
    this.layout.yaxis.range = range;
  };

  MultiTrendCurves.prototype.resetRangeY = function () {
    this.layout.yaxis.range[0] = this.yMin;
    this.layout.yaxis.range[1] = this.yMax;
  };

  MultiTrendCurves.prototype.adjustRangeX = function (x) {
    this.layout.xaxis.range[0] = x - this.xWidth + 0.5;
    this.layout.xaxis.range[1] = x + 0.5;
  };

  MultiTrendCurves.prototype.adjustRangeY = function (y) {
    if (y === void 0) { return; }

    var y0 = this.layout.yaxis.range[0],
      y1 = this.layout.yaxis.range[1],
      w = y1 - y0,
      r = (y - y0) / w,
      s = 1.0,
      c = 0.95;

    if (r > c) {
      s = r / c;
      y1 = y0 + w * s;
      this.layout.yaxis.range[1] = y1;
    }
    else if (r < 1 - c) {
      s = (1.0 - r) / c;
      y0 = y1 - w * s;
      this.layout.yaxis.range[0] = y0;
    }
  };
})(); /* end of the anonymous function */
