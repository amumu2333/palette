/*
  ctx:绘图环境对象
  canvas:画布标签
  mask:画布遮罩标签
  parent:画布的父元素标签
*/
function Palette(ctx,canvas,mask,parent) {
  this.ctx = ctx;
  this.canvas = canvas;
  this.mask = mask;
  this.parent = parent;
  this.typeinfo = {
    type : "line",
    stroke : true,
    lineWidth : 1,
    strokeStyle : "#000",
    // polygons_num: 5,
  },
  this.history = [];
  this.history2 = [];
};//构造函数
Palette.prototype = {
  draw: function () {
    var that = this,
        w = this.canvas.width,
        h = this.canvas.height,
        ctx = this.ctx;
    if (that.typeinfo.type == "pencil") {
      that.eraser()
      return
    }
    this.mask.onmousedown = function (ev) {
      var dx = ev.offsetX,
          dy = ev.offsetY;
      that._init();
      if (that.typeinfo.type == "pencil") {
        ctx.moveTo(dx,dy);
      }else if (that.typeinfo.type == "text") {
        that.text(dx,dy);
        return
      }
      this.onmousemove = function (ev) {
        var mx = ev.offsetX,
            my = ev.offsetY;
        ctx.clearRect(0,0,w,h);
        if (that.history.length != 0) {
          ctx.putImageData(that.history[that.history.length-1],0,0,0,0,w,h);
        }
        if (that.typeinfo.type == "pencil") {
          ctx.lineTo(mx,my);
          ctx.stroke();
        } else {
          that[that.typeinfo.type](dx+.5,dy+.5,mx+.5,my+.5);
        }


      }
      this.onmouseup = function (ev) {
        that.history.push(that.ctx.getImageData(0,0,w,h));
        this.onmousemove = null;
        this.onmouseup = null;
      }
    }
  },
  _init: function () {
    var ctx = this.ctx;
    var info = this.typeinfo;
    for(var i in info) {
      if (ctx[i] && i!="stroke" && i!="fill") {
        ctx[i] = info[i];
      }
    }
  },
  _style: function () {
    if (this.typeinfo.fill) {
      this.ctx.fill()
    }
    if (this.typeinfo.stroke) {
      this.ctx.stroke()
    }
    if (!this.typeinfo.fill && !this.typeinfo.stroke) {
      alert("请至少选择一种操作模式")
    }
  },
  line : function (x1,y1,x2,y2) {
    var ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.closePath();
    ctx.stroke();
  },
  rect : function (x1,y1,x2,y2) {
    var ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x1,y2);
    ctx.lineTo(x2,y2);
    ctx.lineTo(x2,y1);
    ctx.closePath();
    this._style();
  },
  triangle : function (x1,y1,x2,y2) {
    var ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.lineTo(x1,y2);
    ctx.closePath();
    this._style();
  },
  circle: function (x1,y1,x2,y2) {
    var ctx = this.ctx;
    ctx.beginPath();
    var r = Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
    ctx.arc(x1,y1,r,0,Math.PI*2);
    ctx.closePath();
    this._style();
  },
  polygon: function (x1,y1,x2,y2) {
    var ctx = this.ctx;
    var n = this.typeinfo.polygon_num;
    var r = Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
    ctx.beginPath();
    ctx.moveTo(x1,y1-r);
    var hudu = Math.PI*2/n;
    for (var i = 0; i < n ; i++){
      var current_hudu = hudu * (i+1);
      var x = r * Math.cos(current_hudu-Math.PI/2);
      var y = r * Math.sin(current_hudu-Math.PI/2);
      ctx.lineTo(x1+x,y1+y);
    }
    ctx.closePath();
    this._style();
  },
  polygons:function (x1,y1,x2,y2) {
    var n = this.typeinfo.polygons_num;
    var ctx = this.ctx;
    var R = Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2)),
        HUDU = Math.PI*2/n,
        r = R/3,
        hudu = HUDU/2;

      ctx.beginPath();
      ctx.moveTo(x1,y1-R);
      for (var i = 0; i < 2*n ; i++){
        if (i%2==0) {
          var current_hudu = hudu + HUDU * (i/2);
          var x = r * Math.cos(current_hudu-Math.PI/2);
          var y = r * Math.sin(current_hudu-Math.PI/2);
          ctx.lineTo(x1+x,y1+y);
        }else{
          var current_HUDU = HUDU * (i+1) / 2;
          var x = R * Math.cos(current_HUDU-Math.PI/2);
          var y = R * Math.sin(current_HUDU-Math.PI/2);
          ctx.lineTo(x1+x,y1+y);
        }

      }
      ctx.closePath();
      this._style();


  },
  back:function () {
    this.history2.push(this.history.pop());
    if (this.history.length == 0) {
      this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
      setTimeout(function () {
        alert("不能再后退了")
      },0)
    }else {
      this.ctx.putImageData(this.history[this.history.length-1],0,0,0,0,this.canvas.width,this.canvas.height);
    }
  },
  next:function() {
    this.history.push(this.history2.pop());
    if (this.history2.length == 0) {
      alert("不能再前进了")
    } else {
      this.ctx.putImageData(this.history[this.history.length-1],0,0,0,0,this.canvas.width,this.canvas.height);
    }
  },
  text: function (dx,dy) {
    var fill_x = dx;
    var fill_y = dy;
    var that = this;
    this.ctx.font = this.typeinfo.font + " " + this.typeinfo.font_size;
    this.mask.onclick = function () {
      var index = window.getComputedStyle(this,null).zIndex;
      var mask2 = document.createElement("div");
      mask2.style.cssText = "position:absolute;top:0;left:0;z-index:"+(index+1)+";width:"+that.canvas.width+"px;height:"+that.canvas.height+"px;"
      var div = document.createElement('div');
      div.contentEditable = true;
      div.style.cssText = "min-width:100px;min-height:30px;line-height:30px;position:absolute;top:"+dy+"px;left:"+dx+"px;border:1px solid #eb1d21;transition:all 0s;"
      mask2.appendChild(div);
      that.parent.appendChild(mask2);
      div.onmousedown = function (ev) {
        var width = this.offsetWidth;
        var height = this.offsetheight;
        var x0 = ev.clientX - this.offsetLeft;
        var y0 = ev.clientY - this.offsetTop;
        document.onmousemove = function (ev) {
          var x1 = ev.clientX;
          var y1 = ev.clientY;
          fill_x = x1-x0;
          fill_y = y1-y0;
          if (fill_x<0) {
            fill_x=0
          }
          if (fill_y<0) {
            fill_y=0
          }
          if (fill_y>that.canvas.height-height) {
            fill_y=that.canvas.height-height
          }
          if (fill_x>that.canvas.width-width) {
            fill_x=that.canvas.width-width
          }
          div.style.left = fill_x + "px";
          div.style.top = fill_y + "px";
        }
        document.onmouseup = function () {
          document.onmousemove = null;
          document.onmouseup = null;
        }
      }
      div.onblur = function () {
        alert(666)
        var text = this.innerHTML;
        mask2.removeChild(div);
        that.parent.removeChild(mask2);
        that.ctx.fillText(text,fill_x,fill_y);
        that.history.push(that.ctx.getImageData(0,0,that.canvas.width,that.canvas.height));
        that.mask.onclick = null;
      }
    }
  },
  eraser: function () {
    var that = this;
    var ctx = this.ctx;
    var eraser_w = this.typeinfo.width;
    var eraser_h = this.typeinfo.height;
    var index = window.getComputedStyle(this.mask,null).zIndex;
    var mask2 = document.createElement("div");
    mask2.className = "_mask2";
    mask2.style.cssText = "position:absolute;top:0;left:0;z-index:"+(index+2)+";width:"+that.canvas.width+"px;height:"+that.canvas.height+"px;"
    var eraser = document.createElement('div');
    eraser.className = "_eraser";
    eraser.style.cssText = "width:"+eraser_w+"px;height:"+eraser_h+"px;position:absolute;top:"+0+"px;left:"+0+"px;z-index:"+(index+1)+";border:2px solid #eb1d21;background:#fff;transition:all 0s;"
    that.parent.appendChild(eraser);
    mask2.onmousedown = function (ev) {
      var eraser_dx = ev.offsetX;
      var eraser_dy = ev.offsetY;
      eraser.style.left = eraser_dx - eraser_w/2 + "px";
      eraser.style.top = eraser_dy - eraser_h/2 + "px";
      ctx.clearRect(eraser_dx - eraser_w/2, eraser_dy - eraser_h/2,eraser_w/2,eraser_h/2)
      function move(ev) {
        var eraser_mx = ev.offsetX;
        var eraser_my = ev.offsetY;
        eraser.style.left = eraser_mx - eraser_w/2 + "px";
        eraser.style.top = eraser_my - eraser_h/2 + "px";
        ctx.clearRect(eraser_mx - eraser_w/2, eraser_my - eraser_h/2,eraser_w/2,eraser_h/2)
      }
      this.addEventListener("mousemove",move);
      this.onmouseup = function (ev) {
        that.history.push(that.ctx.getImageData(0,0,that.canvas.width,that.canvas.height));
        this.removeEventListener("mousemove",move)
        this.onmouseup = null;
      }
    }
    mask2.onmousemove = function (ev) {
      var eraser_mx = ev.offsetX;
      var eraser_my = ev.offsetY;
      eraser.style.left = eraser_mx - eraser_w/2 + "px";
      eraser.style.top = eraser_my - eraser_h/2 + "px";
    }
    that.parent.appendChild(mask2);
  },
  _clear_eraser:function () {
    var eraser = this.parent.querySelector("._eraser");
    var mask2 = this.parent.querySelector("._mask2");
    if (eraser) {
      this.parent.removeChild(eraser);
    }
    if (mask2) {
      this.parent.removeChild(mask2);
    }

  }
};//原型
