;
(function($) {
    var Carousel = function(poster) {
        var self = this;
        // 保存单个旋转木马对象
        this.poster = poster;
        this.posterMain = poster.find(".poster-list");
        this.prevBtn = poster.find(".poster-prev-btn");
        this.nextBtn = poster.find(".poster-next-btn");
        this.posterItems = poster.find("li.poster-item");
        if(this.posterItems.size() % 2 == 0) {
            this.posterMain.append(this.posterItems.eq(0).clone());
            this.posterItems = this.posterMain.children();
        }
        this.posterFirstItem = this.posterItems.first();
        this.posterLastItem = this.posterItems.last();
        this.rotateFlag = true; //默认情况下点击旋转按钮可以执行旋转方法

        this.setting = {
            width: 1000, //幻灯片的宽度
            height: 320, //幻灯片的高度
            posterWidth: 700, //第一帧的宽度
            posterHeight: 320, //第一帧的高度
            scale: 0.9, //记录显示比例关系
            speed: 500,
            autoPlay: false,
            delay: 2000,
            verticalAlign: 'center',
        }
        
        // 扩展配置参数
        $.extend(this.setting, this.getSetting());

        // 设置配置参数值
        this.setSettingValue();

        // 设置剩余的帧的位置关系
        this.setPosterPos();

        // 为下一步旋转按钮绑定点击事件
        this.nextBtn.on("click", function() {
            if(self.rotateFlag) {
                //点击旋转按钮后不能执行旋转方法
                self.rotateFlag = false;
                self.carouselRotate("left");
            }
            
        });

        // 为上一步旋转按钮绑定点击事件
        this.prevBtn.on("click", function() {
            if(self.rotateFlag) {
                //点击旋转按钮后不能执行旋转方法
                self.rotateFlag = false;
                self.carouselRotate("right");
            }
        });

        // 是否开启自动播放
        if(this.setting.autoPlay) {
            this.autoPlay();

            // 鼠标移入旋转木马区域时，关闭自动播放，移开旋转木马区域时，开启自动播放
            this.poster.hover(function(){
                window.clearInterval(self.timer);
            }, function(){
                self.autoPlay();
            })
        }
        
    };



    Carousel.prototype = {
        // 获取人工配置参数
    	getSetting: function(){
            var setting = this.poster.attr("data-setting");
            if(setting && setting!= "") {
                return $.parseJSON(setting);
            } else {
                return {};
            }
        },
        // 设置配置参数值去控制基本的宽高
        setSettingValue: function(){
            this.poster.css({
                width: this.setting.width,
                height: this.setting.height
            });
            this.posterMain.css({
                width: this.setting.width,
                height: this.setting.height
            });
            // 计算切换按钮的宽度
            var w = (this.setting.width - this.setting.posterWidth) / 2;

            this.prevBtn.css({
                width: w,
                height: this.setting.height,
                zIndex: Math.ceil(this.posterItems.size() / 2)
            });
            this.nextBtn.css({
                width: w,
                height: this.setting.height,
                zIndex: Math.ceil(this.posterItems.size() / 2)
            });

            // 设置第一帧的位置关系、宽高
            this.posterFirstItem.css({
                left: w,
                width: this.setting.posterWidth,
                height: this.setting.posterHeight,
                zIndex: Math.floor(this.posterItems.size() / 2)
            });
        },
        // 设置剩余的帧的位置关系、宽高
        setPosterPos: function(){
            var self = this;

            var sliceItems = this.posterItems.slice(1),
            sliceSize = sliceItems.size() / 2,
            rightSlice = sliceItems.slice(0, sliceSize),
            leftSlice = sliceItems.slice(sliceSize),
            level = Math.floor(this.posterItems.size() / 2);


            // 设置右边帧的位置关系、宽高、top
            var rw = this.setting.posterWidth,
            rh = this.setting.posterHeight,
            gap = ((this.setting.width - this.setting.posterWidth) / 2) / level,
            firstLeft = (this.setting.width - this.setting.posterWidth) / 2,
            fixOffsetLeft = firstLeft + rw;
            
            rightSlice.each(function(i){
                level--;

                rw = rw * self.setting.scale;
                rh = rh * self.setting.scale;

                var j = i;

                $(this).css({
                    left: fixOffsetLeft + (++i) * gap - rw,
                    top: self.setVerticalAlign(rh),
                    zIndex: level,
                    width: rw,
                    height: rh,
                    opacity: 1 / (++j)
                })
            });

            // 设置左边帧的位置关系、宽高、top
            var lw = rightSlice.last().width(),
             lh = rightSlice.last().height(),
             oLoop = Math.floor(this.posterItems.size() / 2);

            leftSlice.each(function(i){


                $(this).css({
                    left: gap * i,
                    top: self.setVerticalAlign(lh),
                    zIndex: i,
                    width: lw,
                    height: lh,
                    opacity: 1 / (oLoop--)
                });

                lw = lw / self.setting.scale;
                lh = lh / self.setting.scale;

            });
        },

        // 设置垂直方向对齐方式
        setVerticalAlign: function(height) {
            var verticalType = this.setting.verticalAlign,
            top = 0;
            if(verticalType === "middle") {
                top = (this.setting.height - height) / 2;
            } else if(verticalType === "top") {
                top = 0;
            } else if(verticalType === "bottom") {
                top = this.setting.height - height;
            } else {
                top = (this.setting.height - height) / 2;
            }
            return top;
        },

        // 旋转
        carouselRotate: function(dir) {
            var _this_ = this;
            var zIndexArr = [];
            if(dir === "left") {
                this.posterItems.each(function(){
                    var self = $(this),
                    prev = self.prev().get(0) ? self.prev() : _this_.posterLastItem,
                    width = prev.width(),
                    height = prev.height(),
                    zIndex = prev.css("zIndex"),
                    opacity = prev.css("opacity"),
                    left = prev.css("left"),
                    top = prev.css("top");

                    zIndexArr.push(zIndex);

                    self.animate({
                        width: width,
                        height: height,
                        opacity: opacity,
                        left: left,
                        top: top
                    }, _this_.setting.speed, function(){
                        _this_.rotateFlag = true; //可以执行旋转方法
                    });

                });
                this.posterItems.each(function(i){
                    var self = $(this);
                    self.css("zIndex", zIndexArr[i]);
                });
            } else if(dir === "right") {
                this.posterItems.each(function(){
                    var self = $(this),
                    next = self.next().get(0) ? self.next() : _this_.posterFirstItem,
                    width = next.width(),
                    height = next.height(),
                    zIndex = next.css("zIndex"),
                    opacity = next.css("opacity"),
                    left = next.css("left"),
                    top = next.css("top");

                    zIndexArr.push(zIndex);

                    self.animate({
                        width: width,
                        height: height,
                        opacity: opacity,
                        left: left,
                        top: top
                    }, _this_.setting.speed, function(){
                        _this_.rotateFlag = true; //可以执行旋转方法
                    });
                });
                this.posterItems.each(function(i){
                    var self = $(this);
                    self.css("zIndex", zIndexArr[i]);
                });
            }
        },
        // 自动播放
        autoPlay: function() {
            var self = this;
            this.timer = window.setInterval(function(){
                self.nextBtn.click();
            }, this.setting.delay)
        }
    };

    Carousel.init = function(posters) {
        var _this_ = this;
        posters.each(function(){
            new _this_($(this));
        });
    }

    

    window.Carousel = Carousel;
})(jQuery);