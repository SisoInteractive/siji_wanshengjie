// Created by sam mok 2015(Siso brand interactive team).

"use strict";

//  limit browser drag move
document.addEventListener('touchmove', function (e) {
    e.preventDefault();
},true);

var app = {
    preload: function () {
        var that = this;

        //  set images generator
        var imgPath = "assets/images/";
        var imageSrcArr = [
            'bg-s2.jpg',
            'bg-s3-before.jpg',
            'bg-s3.png',
            'bg-s6.jpg',
            'bg-s8.jpg',
            'bg-sa.png',
            's1-nangua.png',
            's1-title.png',
            's1-title02.png',
            's2-content.png',
            's3-before-nangua.png',
            'sa-content.png',
            'sprites-mask.png'
        ];
        //  img amounts, use the amounts order to general image objects
        var imgAmounts = imageSrcArr.length;
        var loadedAmounts = 0;
        var isLoaded = false;

        //  load imgs
        for (var i = 0; i < imageSrcArr.length; i++) {
            var img = new Image();
            img.src = imgPath + imageSrcArr[i];
            img.onload = function () {
                loadedAmounts++;

                /* check img load progress */
                if (checkIsAllMainImagesLoaded() && isLoaded == false) {
                    goCreatingProcess();
                }
            };

            img.onerror = function (error) {
                imgAmounts -= 1;

                /* check img load progress */
                if (checkIsAllMainImagesLoaded() && isLoaded == false) {
                    goCreatingProcess();
                }
            };
        }


        function goCreatingProcess () {
            isLoaded = true;
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
        }

        function checkIsAllMainImagesLoaded () {
            if (isLoaded == false) {
                var loadedRate = 0.9;

                return loadedAmounts / imgAmounts >= loadedRate;
            }
        }
    },

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

                //if (nextSwiperIndex == 3 || nextSwiperIndex == 5) {
                //    app.mySwiper.lockSwipes();
                //} else {
                //    app.mySwiper.unlockSwipes();
                //}
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
            app.mySwiper.slideTo(3, 1000, false);

            //  preload user picture
            that.pictureGenerator.preload(that.takePicture.pictureSrc);
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
            //  if not have user picture
            if (!that.takePicture.pictureSrc) {
                alert('请先回到上一页"拍照"或"选择照片"～');
                return false;
            }

            //  if choose the mask
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

//  init app
(function init () {
    console.log('go preload..');
    app.preload();
})();

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

    this.maskSprites = [];
    this.maskIndex = undefined;
    this.isMaskLoaded = false;

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
        var maskAmout = 9;
        var imgAmount = 1 + maskAmout;
        var loadedImageAmount = 0;

        if (that.isMaskLoaded == false) {
            imgAmount = 1; //  set imgAmount just for user picture

            //  preload mask images
            for (var i = 0; i < maskAmout; i++) {
                var img = new Image();
                img.src = 'assets/images/mask0' + (i+1) +'.png';
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
        }

        //  load user picture
        this.img = new Image();
        this.img.src = imgSrc;

        this.img.onload = function () {
            loadedImageAmount++;

            that.imgWidth = this.width;
            that.imgHeight = this.height;

            if (that.imgWidth > that.imgHeight && that.imgWidth / that.imgHeight >= 1.2) {
                that.isImageRotated = true;

                //  position fixer
                that.imgX = -canvas.width/2;
                that.imgY = -canvas.height/2;
            }

            if (checkLoadedProcess()) goMainProcess();
        };

        this.img.onerror = function () {
            alert('图片加载失败, 请重新选择图片~');
        };

        function checkLoadedProcess () {
            return loadedImageAmount / imgAmount == 1;
        }

        function goMainProcess () {
            that.bindEvent();
        }
    };

    this.draw = function () {
        ctx.clearRect(0, 0, clientWidth, clientHeight);

        //  draw user picture
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

        //  position fixer
        var positionFixer = (that.imgWidth - that.imgHeight) / 2;

        if (that.isImageRotated) {
            ctx.save();
            ctx.translate(that.imgWidth/2,that.imgHeight/2);
            ctx.rotate(90*Math.PI/180);

            imgX += positionFixer;
            imgY -= positionFixer;

            ctx.drawImage(that.img, imgY, imgX, imgWidth, imgHeight);

            //  restore ctx setting
            ctx.restore();
        } else {
            ctx.drawImage(that.img, imgX, imgY, imgWidth, imgHeight);
        }

        // draw mask
        var mask = that.maskSprites[that.getMaskIndex()];
        var maskWidth = mask.width;
        var maskHeight = mask.height;

        ctx.save();
        ctx.globalAlpha = 0.95;
        ctx.drawImage(mask, 0, 0, canvas.width, canvas.height);
        ctx.restore();
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
                    that.imgX = that.startedImgX - newDistanceX;
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

                var newScale;

                if (that.maxDistanceBetweenTwoPoints < getMaxValue) {
                    newScale = that.oldImgScale + parseFloat(((getMaxValue - that.maxDistanceBetweenTwoPoints) / 200).toFixed(2));

                    if (newScale >= 0.1) that.imgScale = newScale;
                } else {
                    newScale = that.oldImgScale - parseFloat(((that.maxDistanceBetweenTwoPoints - getMaxValue) / 200).toFixed(2));

                    if (newScale >= 0.1) that.imgScale = newScale;
                }
            }

            that.draw();
        }
    };

    this.setMaskIndex = function (index) {
        that.maskIndex = index;
    };

    this.getMaskIndex = function () {
        return that.maskIndex;
    };
}