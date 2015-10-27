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
            's1-nangua.png',
            's1-title.png',
            's1-title02.png',
            's2-content.png'
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

        var isMaskTipsShown = false;
        var isFinishedGame = false;

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
            },

            onTransitionEnd: function (swiper) {
                $('.scene').removeClass('active')
                    .eq(swiper.activeIndex).addClass('active');

                var nextSwiperIndex = swiper.activeIndex+1;

                if (nextSwiperIndex == 6 && isMaskTipsShown == false) {
                    $('.mask-tips').fadeIn();
                }

                if (nextSwiperIndex == 6 || nextSwiperIndex == 7 && isFinishedGame == false) {
                    app.mySwiper.lockSwipeToNext();
                } else {
                    app.mySwiper.unlockSwipes();
                }

                //  if game finished, hide generator picture tools
                if (isFinishedGame == true) {
                    $('.scene04 .float, .scene04 .restart, .scene04 .confirm').hide();
                }
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
        var takePictureBtn = $('#take-picture')[0];
        this.takePicture = new TakePicture(takePictureBtn, chooseImageCallBack);

        //  generate picture generator
        this.pictureGenerator = new DrawImg();
        that.pictureGenerator.preload(that.takePicture.pictureSrc);

        //  invoke when get user picture.
        function chooseImageCallBack () {
            app.mySwiper.unlockSwipes();
            app.mySwiper.slideTo(7, 1000, false);

            setTimeout(function () {
                app.mySwiper.lockSwipes();
            }, 100);

            //  preload user picture
            that.pictureGenerator.preload(that.takePicture.pictureSrc);
        }

        //  choose mask when click mask
        $('.mask-tips .close').click(function () {
            $('.mask-tips').hide();
        });

        $('.scene03 .mask').each(function (index) {
            $(this).on('click', function () {
                //  remark picture generator;
                isFinishedGame = false;
                that.isFinishedPicture = false;

                $('.mask').eq(index).addClass('active')
                    .siblings('.mask').removeClass('active');

                $('#take-picture').val('').trigger('click');

                //  set choose mask index
                that.pictureGenerator.setMaskIndex(index);

                //  show generator tools
                $('.scene04 .restart, .scene04 .confirm').show();
            });
        });

        //  restart game
        $('.scene04 .restart').on('click', function () {
            //  remark picture generator;
            isFinishedGame = false;
            that.pictureGenerator.isFinishedPicture = false;

            $('.scene04 .float').hide();
            $('.scene04 .restart, .scene04 .confirm').show();

            app.mySwiper.unlockSwipes();
            app.mySwiper.slideTo(5, 1000, false);

            setTimeout(function () {
                app.mySwiper.lockSwipes();
            }, 100);
        });

        //  finished game, generate final picture,
        //  unlock swipers
        var finalPicture = null;

        $('.scene04 .confirm').on('click', function () {
            isFinishedGame = true;

            app.mySwiper.unlockSwipes();

            //  general final picture
            finalPicture = app.pictureGenerator.generalFinalPicture();
            console.log(finalPicture);

            // open float window
            $('.scene04 .float').fadeIn();
        });

        //  微信分享
        $('.scene04 .float .forward').on('click', function () {
            if (finalPicture) {
                //  code here...
            } else {
                alert('您还未生成您的照片,请前往选择面具页面进行打扮~');
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

    this.isFinishedPicture = false;

    this.preload = function (imgSrc) {
        var maskAmout = 9;
        var imgAmount = 1 + maskAmout;
        var loadedImageAmount = 0;

        //  preload mask images if mask have not be loaded.
        if (that.isMaskLoaded == true) {
            imgAmount = 1; //  set imgAmount just for user picture

        } else {
            for (var i = 0; i < maskAmout; i++) {
                var img = new Image();
                img.src = 'assets/images/mask0' + (i+1) +'.png';
                img.index = i;
                img.onload = function () {
                    loadedImageAmount++;
                    that.maskSprites[this.index] = this;

                    if (checkLoadedProcess()) goMainProcess();
                };

                img.onerror = function (e) {
                    imgAmount -= 1;

                    if (checkLoadedProcess()) goMainProcess();
                };
            }
        }

        //  load user picture
        this.img = new Image();
        this.img.src = imgSrc;

        if (imgSrc) {
            this.img.onload = function () {
                loadedImageAmount++;

                that.imgWidth = this.width;
                that.imgHeight = this.height;

                var isPictureSize = that.imgWidth / that.imgHeight >= 1.33 && that.imgHeight && that.imgWidth / that.imgHeight <= 1.4;

                if (that.imgWidth > that.imgHeight && isPictureSize) {
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
        }

        function checkLoadedProcess () {
            return loadedImageAmount / imgAmount == 1;
        }

        function goMainProcess () {
            that.isMaskLoaded = true;

            that.bindEvent();
            that.draw();
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

        // if is not finished picture, make mask to be high opacity
        if (that.isFinishedPicture == false) {
            ctx.save();
            ctx.globalAlpha = 0.95;
            ctx.drawImage(mask, 0, 0, canvas.width, canvas.height);
            ctx.restore();
        } else {
            ctx.drawImage(mask, 0, 0, canvas.width, canvas.height);
        }
    };

    this.generalFinalPicture = function () {
        that.isFinishedPicture = true;
        that.draw();

        var imageSource = canvas.toDataURL('image/jpeg', 0.7);

        return imageSource;
    };

    this.bindEvent = function () {
        canvas.addEventListener('touchstart', touchStartHandler);
        canvas.addEventListener('touchmove', touchMoveHandler);
        canvas.addEventListener('touchend', touchEndHandler);

        function touchStartHandler (evt) {
            var touches = evt.touches;

            clearTimeout(that.moveLockedTimer);

            if (touches.length == 1 && that.isFinishedPicture == false) {
                that.startedPointX = evt.touches[0].pageX - that.boxBoundingX;
                that.startedPointY = evt.touches[0].pageY - that.boxBoundingY;

                that.startedImgX = that.imgX;
                that.startedImgY = that.imgY;

            }

            if (touches.length == 2 && that.isFinishedPicture == false) {
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
            if (touches.length == 1 && that.moveLocked == false && that.isFinishedPicture == false) {
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
            if (touches.length == 2 && that.isFinishedPicture == false) {
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