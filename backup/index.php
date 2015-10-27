<?php
require_once "jssdk.php";
$jssdk = new JSSDK("wx33b1e3d02516f1dd", "cf33315a06dfa044fc7d56ee3e811900");
$signPackage = $jssdk->GetSignPackage();
?>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
<meta charset="utf-8">
<title>美丽平潭，垃圾不落地</title>
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta content="telephone=no" name="format-detection">
    <meta name="viewport" content="width=320,maximum-scale=1.5,user-scalable=no,minimal-ui"/>
    <meta name="apple-touch-fullscreen" content="no"/>
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
    <!-- vendor css -->
    <link rel="stylesheet" href="css/index.css">

    <!-- js -->
    <script src="js/jquery-1.8.3.min.js"></script>
    <script src="js/jquery.timers-1.2.js"></script>
    <script src="js/jgestures.js"></script>
    <!-- 微信接口 -->
    <script src="http://res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>
    <!-- less compiler -->
    <script src="js/less.min.js"></script>
</head>
<body>
    <div class="container">
        <div class="page1 page" style="display: block;">
            <img src="images/zindex.png" class="zindex_img">
            <a class="btn page1_btn">开始游戏</a>
        </div>

        <div class="page2 page" style="display: none;">
            <img src="images/page2.png" class="img">
            <h2 class="djtime" style="display: none;">倒计时：<i class="time">30</i>秒<img src="images/tong.png"></h2>
            <div class="page_text" style="display: block">
                <p class="text">点击沙滩区域出现的垃圾</p>
                <p class="text1">可参与环保活动</p>
                <a class="page2_btn">立即开始</a>
            </div>
            <div class="sum" style="display: none;">+<i class="sum_text">0</i></div>
            <div class="main" style="display: none;">
                <div class="play" >
                    <div></div><div></div><div></div><div></div>
                    <div></div><div></div><div></div><div></div>
                    <div></div><div></div><div></div><div></div>
                    <div></div><div></div><div></div><div></div>
                </div>
            </div>
        </div>
        <div class="page3 page" style="display: none;">
            <img src="images/page3.png" class="img">
            <img src="images/shui.png" class="jiaoshui">
        </div>

        <div class="page4" style="display: none;">
            <img src="images/page4.png" class="img">
            <div class="cont">
                <p class="p1">您已经捡起了<i class="sum_page4">39</i>件垃圾</p>
                <a class="btn_play">捡的太少？再来一次</a>
                <a class="btn_fenx" id="btn_fenx">分享到朋友圈</a>
            </div>
        </div>

        <div class="fenx" style="display: none;">
            <img src="images/tisp.png" width="300">
        </div>

        <div style="display: none;">
            <audio src="css/aotu.mp3" controls="controls" id="audio" style="display: none;">
                Your browser does not support the audio element.
            </audio>
            <audio src="css/guwenchang.mp3" autoplay loop controls="controls" id="audio2" style="display: none;">
                  Your browser does not support the audio element.
            </audio>
        </div>
        <script>
            var imgbg=new Image();
            imgbg.src="images/click_bg.png";

            wx.config({
                debug: false,
                appId: '<?php echo $signPackage["appId"];?>',
                timestamp: <?php echo $signPackage["timestamp"];?>,
                nonceStr: '<?php echo $signPackage["nonceStr"];?>',
                signature: '<?php echo $signPackage["signature"];?>',
                jsApiList: [
                  'onMenuShareAppMessage',
                  'onMenuShareTimeline'
                ]
              });

        </script>
        <script src="js/function.js"></script>
    </div>

</body>
</html>