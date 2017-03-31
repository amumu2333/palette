$(window).load(function () {
  //声明画布组数组,当前画布,画布索引
  var palettes = [],
      index = 0,
      now = null;

  //work_area 的高度 确定
  $("div.work_area").css("height",function () {
    return $("div.main_area").height()-30-30 + "px";
  })


  // 左侧type栏的点击事件
  $(".types li").on("click",function (ev) {
    $(this).addClass("active")
    .siblings().removeClass("active");

    var type = $(this).attr("data_type");

    $(".handle .left div")
    .filter(function (index) {
      return $(this).hasClass(type)
    }).addClass("active")
    .siblings().removeClass("active")

    if (now) {
      now.typeinfo.type = type;
      $(".handle div")
      .filter(function () {
        return $(this).hasClass(type);
      })
      .children()
        .each(function (i) {
          if ($(this).attr("type") == "text" || $(this).attr("type") == "color") {
            now.typeinfo[$(this).attr("class")] = $(this).attr("value");
          }
          if ($(this).attr("type") == "checkbox") {
            now.typeinfo[$(this).attr("class")] = $(this).is(":checked");
          }
          if ($(this).attr("class")=="lineCap" || $(this).attr("class")=="lineJoin" || $(this).attr("class")=="font" || $(this).attr("class")=="font_size") {
              now.typeinfo[$(this).attr("class")] = $("option:selected",this).attr("value")
          }
        });

    }
  });
  $(".types li").not(".text").on("click",function () {
    now._clear_eraser();
  })

  //新建画布
  $(".create").on("click",function () {

    //create_input 弹框下拉
    $("div.create_input")
      .css("display",'block')
    .find(".default")
      .click(function () {
        $('div.create_input .width').prop("value",function () {
          return $("div.work_area").width()
        })
        $('div.create_input .height').prop("value",function () {
          return $("div.work_area").height()
        })
      })//default
    .end()
    .find(".sure")
      .one("click",function () {
        //获取自定义的宽高
        var w = $('div.create_input .width').prop("value");
        var h = $('div.create_input .height').prop("value");
        //create_input的隐藏
        $("div.create_input").css("display","none");
        //顶部标题栏追加子元素
        $("<li/>")
          .addClass("tab")
          .html(function () {
            return "画布"+(index+1);
          })
          .attr("data_index",function () {
            return index;
          })
          .appendTo($("ul.tabs"))
          .addClass("now")
          .siblings()
          .removeClass("now");

        //主要区域添加
        $("<div/>")
          .addClass("canvas_box")
          .html(
            '<canvas class="mycanvas" width='+w+' height='+h+'></canvas>'+
            '<div class="mask" style="width:'+w+'px;height:'+h+'px"></div>'
          )
          .css({
            width: function () {
              return w + "px"
            },
            height: function () {
              return h + "px"
            },
          })
          .attr("data_index",function () {
            return index
          })
          .appendTo($("div.work_area"))
          .addClass("now")
        .siblings()
          .removeClass("now")
        //当前画布 new一个Palette
        var now_parent = $("div.work_area .now")[0],
            now_mask = $("div.work_area .now .mask")[0],
            now_canvas = $("div.work_area .now .mycanvas")[0],
            now_ctx = now_canvas.getContext("2d");
        var mypalette = new Palette(now_ctx,now_canvas,now_mask,now_parent);
        palettes.push(mypalette);
        now = palettes[index];
        now.draw();
        //右侧type栏重置
        $(".types li.line").addClass("active")
        .siblings().removeClass("active");
        //画布索引+1
        index++;
      })//sure
    .end()
    .find(".off")
      .click(function () {
        //create_input的隐藏
        $("div.create_input").css("display","none");
      })


  })//create的点击事件


  //顶部 tab点击事件
  $("ul.tabs").delegate(".tab","click",function () {
    //获取画布索引值
    var now_index = $(this).attr("data_index");
    //当前画布
    now = palettes[now_index];
    //顶部tab的处理
    $(this)
      .addClass("now")
    .siblings()
      .removeClass("now")
    //work_area区域的处理
    $("div.work_area .canvas_box")
    .eq(now_index)
      .addClass("now")
    .siblings()
      .removeClass("now")
    //侧边type区域的处理
    $(".types li")
    .filter(function () {
      return $(this).hasClass(now.typeinfo.type);
    })
      .addClass("active")
    .siblings()
      .removeClass("active")
  })


  //前进 与后退 点击事件
  $(".handle .right .back").on("click",function () {
    now.back();
  })
  $(".handle .right .next").on("click",function () {
    now.next();
  })


  //handle操作点击事件
  $(".handle .lineWidth").on("change",function () {
    now.typeinfo[$(this).attr("class")] = this.value;
  })
  $(".handle input[type='color']").on("change",function () {
    now.typeinfo[$(this).attr("class")] = this.value;
  })
  $(".handle .lineCap").on("change",function () {
    now.typeinfo[$(this).attr("class")] = $("option:selected",this).attr("value")
  })
  $(".handle .lineJoin").on("change",function () {
    now.typeinfo[$(this).attr("class")] = $("option:selected",this).attr("value")
  })
  $(".handle .font").on("change",function () {
    now.typeinfo[$(this).attr("class")] = $("option:selected",this).attr("value")
  })
  $(".handle .font_size").on("change",function () {
    now.typeinfo[$(this).attr("class")] = $("option:selected",this).attr("value")
  })
  $(".handle input[type='checkbox']").on("change",function () {
    now.typeinfo[$(this).attr("class")] = $(this).is(":checked")
  })

});//domContentLoaded
