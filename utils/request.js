var config = require('../config.js');
var helper = require('../utils/helper.js');
var auth = require('../utils/auth.js');
var app = getApp();

/**
 * get 方法原型
 * options 参数说明
 *  url:接口地址不包含 host
 *  data: 请求数据
 *  success：接口正常返回
 *  fail:接口请求失败
*/

function ajax(options) {
  wx.showLoading({
    title: '加载中...',
  })
  let requestOptions = { //微信请求体
    url: config.apiHost + options.url,//请求地址 host+url 
    method: options.method,  
    header: {
      'content-type': 'application/json'
    },
    success: function (res) {
      wx.hideLoading();
      if (res.data.status == 200) { //成功
        if (typeof options.success == 'function') {
          options.success(res);
        }
      } else {//失败
        wx.hideLoading();
        if (typeof options.fail == 'function') {
          options.fail(res);          
        } else {//默认失败回调 可          
          wx.showToast({
            title: '操作失败',
            icon: 'none',
            duration: 2000
          })
        }
      }
    },
    error: function (res) {
      wx.hideLoading();
      console.log(res);
    }
  };

  let rqdata = Object.assign({}, options.data); //请求参数
  rqdata.appid = config.appId;
  rqdata.appkey = config.appKey;
  let userInfo = wx.getStorageSync(config.userInfoKey);
  if (userInfo) {
    app.globalData.userid = userInfo.userid;
    rqdata.userid = userInfo.userid;
    rqdata.token = userInfo.token;    
  }

  // if(userInfo.cartnum != undefined){
  //   app.globalData.cartnum = userInfo.cartnum;
  // }

  if (!helper.inArray(options.url, config.authAxcepts) && !userInfo) { //需要 userid 和 token的接口    
    auth.login(function (userInfo) {
      rqdata.userid = userInfo.userid;
      rqdata.token = userInfo.token;
      //登录完继续调用接口    
      requestOptions.data = rqdata;
      wx.request(requestOptions);
    })
  } else {
    requestOptions.data = rqdata;
    wx.request(requestOptions);
  }
}

function get(url, data, success, fail) {
  let rqdata = Object.assign({}, data);  
  ajax({
    url: url,
    method:'GET',
    data: rqdata,
    success: success,
    fail: fail
  })
}

function post(url, data, success, fail) {
  let rdata = Object.assign({}, data);
  ajax({
    url: url,
    method: 'POST',
    data: rdata,
    success: success,
    fail: fail
  })
}

module.exports = {
  ajax: ajax,
  get: get,
  post: post
}