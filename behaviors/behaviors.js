var app = getApp();
var config = require('../config.js');
module.exports = Behavior({
  behaviors: [],
  properties: {    
  },
  data: {
    myBehaviorData: {}
  },
  attached: function () {
    
  },
  methods: {
    getPhoneNumber: function (res) {
      var self = this;     
      app.globalData.curPageObj.data.showSignUp = false;
      if (res.detail.errMsg == 'getPhoneNumber:ok') {
        app.globalData.curPageObj.setData({
          showSignUp: app.globalData.curPageObj.data.showSignUp
        });
        let signupcb = app.globalData.curPageObj.signupcb;        
        let rqdata = {
          appid: config.appId,
          appkey: config.appKey,
          code: app.globalData.loginCode,
          encryptedData: res.detail.encryptedData,
          iv: res.detail.iv
        };
        wx.showLoading({
          title: '加载中...',
        });
        wx.request({
          url: config.apiHost + '/api/minireg',
          method: 'POST',
          dataType: 'json',
          data: rqdata,
          success: function (res) {
            wx.hideLoading();
            if (config.sucStatus == res.data.status) {//成功注册              
              let userInfo = res.data.data.userinfo;
              userInfo.token = res.data.data.token;
              app.globalData.userid = userInfo.userid;
              if (userInfo.cartnum != undefined) {
                app.globalData.cartnum = userInfo.cartnum;
              }
              wx.setStorageSync(config.userInfoKey, userInfo);
              self.triggerEvent('authOk', userInfo)
              if (typeof signupcb == 'function') {
                signupcb(userInfo);
              }
            }
          },
          fail: function () {
            console.log('wx.login fail');
          }
        })
      } else {//用户取消授权
        if (!this.properties.force) {//强制授权不会关闭弹窗
          app.globalData.curPageObj.setData({
            showSignUp: app.globalData.curPageObj.data.showSignUp
          });
        }
        console.log('cancel auth');
      }
    }
  }
})