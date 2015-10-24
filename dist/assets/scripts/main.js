// Created by sam mok 2015(Siso brand interactive team).

"use strict";

//  limit browser drag move
document.addEventListener('touchmove', function (e) {
    e.preventDefault();
},true);

var app = {
    create: function (){
        app.mySwiper = new Swiper ('.swiper-container', {
            direction: 'vertical',

            parallax : true,

            noSwiping: false,

            // init
            onInit: function (swiper) {
                $('.scene').eq(swiper.activeIndex).addClass('active');
            },

            onTransitionStart: function (swiper) {
            },

            onTransitionEnd: function (swiper) {
                $('.scene').removeClass('active');
                $('.scene').eq(swiper.activeIndex).addClass('active');
            }
        });

        //  first time play BGM
        var initSound = function () {
            //  delay play
            $('#audio')[0].play();

            document.removeEventListener('touchstart', initSound, false);
        };
        document.addEventListener('touchstart', initSound, false);
    },

    start: function (){
        this.create();
    }
};

$(function (){
    // init app
    app.start();
    console.log('app started success...');

    setTimeout(function () {
        $('.loading').addClass('finished');

        setTimeout(function () {
            $('.loading').addClass('leave');
        }, 2000);
    }, 2000);
});