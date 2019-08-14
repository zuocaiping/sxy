var config = require('../config.js');
var app = getApp();

// 登录后台
function loginSer(loginCode, callback, forceAuth) {
  let rqdata = {
    appid: config.appId,
    appkey: config.appKey,
    code: loginCode
  }
  wx.showLoading({
    title: '加载中...',
  })
  wx.request({
    url: config.apiHost + '/api/minilogin',
    method: 'POST',
    dataType: 'json',
    data: rqdata,
    success: function (res) {
      wx.hideLoading();
      if (config.sucStatus == res.data.status) {
        if (res.data.data.isreg == 1) { //已经注册
          let userInfo = res.data.data.userinfo;
          userInfo.token = res.data.data.token;
          app.globalData.userid = userInfo.userid;
          if (userInfo.cartnum != undefined) {
            app.globalData.cartnum = userInfo.cartnum;
          }

          wx.setStorageSync(config.userInfoKey, userInfo);
          if (typeof callback == 'function') {
            callback(userInfo);
          }
        } else { //没有注册
          //方案1 跳转到注册页 注册完再跳回来
          if (!forceAuth) {
            if (typeof callback == 'function') {
              callback();
            }            
          } else {
            //方案2 登录弹窗 注册完成功 继续回调 我选2          
            app.globalData.curPageObj.signupcb = callback;
            app.globalData.curPageObj.data.showSignUp = true;
            app.globalData.curPageObj.signupcb = callback;
            app.globalData.curPageObj.setData({
              showSignUp: app.globalData.curPageObj.data.showSignUp
            });
          }

        }
      } else {
        console.log(res.msg);
      }
    },
    fail: function () {
      console.log('wx.login fail');
    }
  })
}

function getLoginCode(callback) {
  wx.login({
    success: function (res) {
      app.globalData.loginCode = res.code;
      var loginCodeInfo = {
        code: res.code,
        gettime: Date.parse(new Date()) / 1000
      };
      wx.setStorageSync(config.loginCodeKey, loginCodeInfo);
      if (typeof callback == 'function') {
        callback(res.code);
      }
    }
  })
}

function bindUionId(code, callback) {
  wx.request({
    url: config.apiHost + '/api/minirepairunionid',
    method: 'POST',
    dataType: 'json',
    data: {
      appid: config.appId,
      appkey: config.appKey,    
      code: code
    },
    success: function (res) {
      if (typeof callback == 'function') {
        callback(res);
      }
    }
  })

}
module.exports = {
  login: function (callback, forceAuth) {
    if (forceAuth == undefined) {
      forceAuth = true;
    }
    //用户已经登录 wx.login
    wx.checkSession({
      success: function () {
        var loginCodeInfo = wx.getStorageSync(config.loginCodeKey);
        if (!loginCodeInfo || Date.parse(new Date()) / 1000 - loginCodeInfo.gettime > 86400) {
          getLoginCode(function (loginCode) {
            loginSer(loginCode, callback, forceAuth);
          });
        } else {
          app.globalData.loginCode = loginCodeInfo.code;
          loginSer(loginCodeInfo.code, callback, forceAuth);
        }
      },
      fail: function () {
        getLoginCode(function (loginCode) {
          loginSer(loginCode, callback, forceAuth);
        });
      }
    })
  },
  repairUnionId: function (callback) {
      wx.checkSession({
        success: function () {
          var loginCodeInfo = wx.setStorageSync(config.loginCodeKey);
          if (!loginCodeInfo || Date.parse(new Date()) / 1000 - loginCodeInfo.gettime > 86400) { //code 已经过期
            getLoginCode(function (loginCode) {
              bindUionId(loginCode, callback);
            });
          } else { //code 没有过期
            app.globalData.loginCode = loginCodeInfo.code;
            bindUionId(loginCode, callback);
          }
        },
        fail: function () {
          getLoginCode(function (loginCode) {
            bindUionId(loginCode, callback);
          });
        }
      })    
  }
}