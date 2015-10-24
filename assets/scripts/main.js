// Created by sam mok 2015(Siso brand interactive team).

"use strict";

//  limit browser drag move
document.addEventListener('touchmove', function (e) {
    e.preventDefault();
},true);

var app = {
    create: function (){
        var that = this;

        that.maskIndex = null;

        app.mySwiper = new Swiper ('.swiper-container', {
            direction: 'vertical',

            parallax : true,

            noSwiping: false,

            // init
            onInit: function (swiper) {
                setTimeout(function () {
                    $('.scene').eq(swiper.activeIndex).addClass('active');
                }, 4600);
            },

            onTransitionStart: function (swiper) {
                var nextSwiperIndex = swiper.activeIndex+1;

                if (nextSwiperIndex == 3 || nextSwiperIndex == 5) {
                    app.mySwiper.lockSwipes();
                } else {
                    app.mySwiper.unlockSwipes();
                }
            },

            onTransitionEnd: function (swiper) {
                $('.scene').removeClass('active')
                    .eq(swiper.activeIndex).addClass('active');
            }
        });

        //  first time play BGM
        var initSound = function () {
            //  delay play
            $('#audio')[0].play();

            document.removeEventListener('touchstart', initSound, false);
        };
        document.addEventListener('touchstart', initSound, false);


        /** main picture app */
        //  generate take picture app
        var takePictureBtn = $('.scene03-before .btn-content')[0];
        this.takePicture = new TakePicture(takePictureBtn, chooseImageCallBack);

        //  generate picture generator
        this.pictureGenerator = new DrawImg();

        //  invoke when get user picture.
        function chooseImageCallBack () {
            app.mySwiper.unlockSwipes();
            app.mySwiper.slideTo(3, 1000, false);

            //  preload user picture
            that.pictureGenerator.preload(that.takePicture.pictureSrc);

            setTimeout(function () {
                app.mySwiper.lockSwipes();
            }, 950);
        }

        //  choose mask when click mask
        $('.scene03 .mask').each(function (index) {
            $(this).on('touchstart', function () {
                $('.mask').eq(index).addClass('active')
                    .siblings('.mask').removeClass('active');

                //  set choose mask index
                that.pictureGenerator.setMaskIndex(index);
            });
        });

        //  confirm mask and go to next scene
        $('.scene03 .btn-content').on('touchstart', function () {
            if (that.pictureGenerator.getMaskIndex() >= 0) {
                app.mySwiper.unlockSwipes();
                app.mySwiper.slideTo(4, 1000, false);

                that.pictureGenerator.draw();

                setTimeout(function () {
                    app.mySwiper.lockSwipes();
                }, 950);
            } else {
                alert('请选择想要使用的面具~');
                return false;
            }
        });
    },

    start: function (){
        this.create();
    }
};

$(function (){
    //  loading
    setTimeout(function () {
        $('.loading').addClass('finished');

        // init app
        app.start();
        console.log('app started success...');

        setTimeout(function () {
            $('.loading').addClass('leave');

            setTimeout(function () {
                $('.loading').addClass('leaved');
            }, 2600);
        }, 1800);
    }, 2000);

    // debug
    ////  loading
    //$('.loading').addClass('finished');
    //
    //// init app
    //app.start();
    //console.log('app started success...');
    //
    //$('.loading').addClass('leave');
    //
    //$('.loading').addClass('leaved');
});

//  take picture
function TakePicture (takePictureBtn, takePictureSuccessdCallback) {
    var that = this;

    this.takePictureBtn = takePictureBtn;

    this.pictureSrc = null;

    // Set events
    this.takePictureBtn.onchange = function (event) {
        // Get a reference to the taken picture or chosen file
        var files = event.target.files;
        var file;

        if (files && files.length > 0) {
            file = files[0];

            try {
                // fallback if createObjectURL is not supported
                var fileReader = new FileReader();
                fileReader.readAsDataURL(file);

                fileReader.onload = function (event) {
                    var imgSrc = event.target.result;

                    //  return img base64
                    that.pictureSrc = imgSrc;

                    console.log('get valid user picture: ', imgSrc);
                    takePictureSuccessdCallback();
                };
            }
            catch (e) {
                alert("FileReader are not supported");

                //  return false
                return false;
            }
        }
    };
}

//  draw picture function
function DrawImg () {
    var that = this;
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var clientWidth = document.documentElement.clientWidth;
    var clientHeight = document.documentElement.clientHeight;
    canvas.width = clientWidth;
    canvas.height = clientHeight;

    this.boxBoundingX = parseInt(canvas.getBoundingClientRect().left);
    this.boxBoundingY = parseInt(canvas.getBoundingClientRect().top);
    console.log(this.boxBoundingY);

    this.maskSprites = [];
    this.maskIndex = 0;

    this.isImageRotated = false;
    this.imgWidth = 100;
    this.imgHeight = 100;

    this.imgX = 0;
    this.imgY = 0;

    this.imgScale = 1;
    this.oldImgScale = this.imgScale;

    this.moveLocked = false;
    this.moveLockedTimer = null;

    this.preload = function (imgSrc) {
        var maskAmout = 1;
        var imgAmount = 1 + maskAmout;
        var loadedImageAmount = 0;

        //  preload mask images
        for (var i = 0; i < maskAmout; i++) {
            var img = new Image();
            img.src = 'assets/images/mask01.png';
            img.index = i;
            img.onload = function () {
                loadedImageAmount++;
                that.maskSprites[this.index] = this;

                if (checkLoadedProcess()) goMainProcess();
            };

            img.onerror = function () {
                imgAmount -= 1;

                if (checkLoadedProcess()) goMainProcess();
            };
        }

        //  load user picture
        this.img = new Image();
        this.img.src = imgSrc;

        this.img.onload = function () {
            loadedImageAmount++;

            that.imgWidth = this.width;
            that.imgHeight = this.height;

            if (checkLoadedProcess()) goMainProcess();
        };

        this.img.onerror = function () {
            alert('图片加载失败, 请重新选择图片~');
        };

        function checkLoadedProcess () {
            console.log(loadedImageAmount , imgAmount);

            return loadedImageAmount / imgAmount == 1;
        }

        function goMainProcess () {
            that.draw(this);
            that.bindEvent();
        }
    };

    this.draw = function () {
        ctx.clearRect(0, 0, clientWidth, clientHeight);

        //  draw user picture
//                ctx.save();
//                ctx.translate(canvas.width/2,canvas.height/2);
//                ctx.rotate(90*Math.PI/180);

        var imgWidth = Math.floor(that.imgWidth*that.imgScale);
        var imgHeight = Math.floor(that.imgHeight*that.imgScale);

        var imgX,
            imgY;

        if (that.imgScale < that.oldImgScale) {
            imgX = that.imgX + (that.imgWidth - imgWidth)/2;
            imgY = that.imgY + (that.imgHeight - imgHeight)/2;
        } else {
            imgX = that.imgX - (imgWidth - that.imgWidth) / 2;
            imgY = that.imgY - (imgHeight - that.imgHeight) / 2;
        }

        ctx.drawImage(that.img, imgX, imgY, imgWidth, imgHeight);

        //  restore ctx setting
//                ctx.restore();

        // draw mask
        var mask = that.maskSprites[that.maskIndex];
        var maskWidth = parseInt(mask.width/2);
        var maskHeight = parseInt(mask.height/2);

        ctx.drawImage(mask, parseInt(canvas.width/2) - parseInt(maskWidth/2), 0, maskWidth, maskHeight);
    };

    this.bindEvent = function () {
        canvas.addEventListener('touchstart', touchStartHandler);
        canvas.addEventListener('touchmove', touchMoveHandler);
        canvas.addEventListener('touchend', touchEndHandler);

        function touchStartHandler (evt) {
            var touches = evt.touches;

            clearTimeout(that.moveLockedTimer);

            if (touches.length == 1) {
                that.startedPointX = evt.touches[0].pageX - that.boxBoundingX;
                that.startedPointY = evt.touches[0].pageY - that.boxBoundingY;

                that.startedImgX = that.imgX;
                that.startedImgY = that.imgY;

            }

            if (touches.length == 2) {
                that.oldImgScale = that.imgScale;
                that.moveLocked = true;

                var curX = touches[0].pageX - that.boxBoundingX;
                var curY = touches[0].pageY - that.boxBoundingY;
                var curX2 = touches[1].pageX - that.boxBoundingX;
                var curY2 = touches[1].pageY - that.boxBoundingY;

                var newDistanceBetweenTwoPointsX = Math.abs(curX - curX2);
                var newDistanceBetweenTwoPointsY = Math.abs(curY - curY2);

                that.maxDistanceBetweenTwoPoints = Math.max(newDistanceBetweenTwoPointsX, newDistanceBetweenTwoPointsY);
            }
        }

        function touchEndHandler () {
            // free the double touch cause the picture move
            that.moveLockedTimer = setTimeout(function () {
                that.moveLocked = false;
            }, 100);
        }

        function touchMoveHandler (evt) {
            var touches = evt.touches;
            var curX = touches[0].pageX - that.boxBoundingX;
            var curY = touches[0].pageY - that.boxBoundingY;

            //  move img when touches point is single
            if (touches.length == 1 && that.moveLocked == false) {
                var newDistanceX = curX - that.startedPointX;
                var newDistanceY = curY - that.startedPointY;

                if (that.isImageRotated) {
                    that.imgX = that.startedImgX + newDistanceX;
                    that.imgY = that.startedImgY + newDistanceY;
                } else {
                    that.imgX = that.startedImgX + newDistanceX;
                    that.imgY = that.startedImgY + newDistanceY;
                }
            }

            //  scale img when touches point is double
            if (touches.length == 2) {
                that.moveLocked = true;
                var curX2 = touches[1].pageX - that.boxBoundingX;
                var curY2 = touches[1].pageY - that.boxBoundingY;

                var newDistanceBetweenTwoPointsX = Math.abs(curX - curX2);
                var newDistanceBetweenTwoPointsY = Math.abs(curY - curY2);
                var getMaxValue = Math.max(newDistanceBetweenTwoPointsX, newDistanceBetweenTwoPointsY);

                var statue,
                    newScale;

                if (that.maxDistanceBetweenTwoPoints < getMaxValue) {
                    statue = '放大';
                    newScale = that.oldImgScale + parseFloat(((getMaxValue - that.maxDistanceBetweenTwoPoints) / 200).toFixed(2));

                    if (newScale >= 0.1) that.imgScale = newScale;
                } else {
                    statue = '缩小';
                    newScale = that.oldImgScale - parseFloat(((that.maxDistanceBetweenTwoPoints - getMaxValue) / 200).toFixed(2));

                    if (newScale >= 0.1) that.imgScale = newScale;
                }

                // debug
                var touchInfo = document.getElementById('touchInfo').getElementsByTagName('span');
                touchInfo[0].innerHTML = 2;
                touchInfo[1].innerHTML = touches[0].pageX - that.boxBoundingX;
                touchInfo[2].innerHTML = touches[1].pageX - that.boxBoundingX;
                touchInfo[3].innerHTML = statue + ': scale ' + that.imgScale;
            }

            that.draw();
        }
    };

    this.setMaskIndex = function (index) {
        that.maskIndex = index;
    };

    this.getMaskIndex = function () {
        return that.maskIndex || false;
    };
}