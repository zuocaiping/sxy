var app = getApp();
var config = require('../config.js');
var auth = require('auth.js');
module.exports = {
  authJumpUrl: function(e) {
    var self = this;
    var url = e.currentTarget.dataset.url;
    var type = e.currentTarget.dataset.type;
    let userInfo = wx.getStorageSync(config.userInfoKey);
    if (!userInfo) {
      auth.login(function() {
        if (type == 'redirect') {
          wx.redirectTo({
            url: url,
          })
        } else {
          wx.navigateTo({
            url: url,
          })
        } 
      });
    } else {
      if (type =='redirect'){
        wx.redirectTo({
          url: url,
        })
      }else{
        wx.navigateTo({
          url: url,
        })
      }      
    }
  },
  jumpUrl: function(e) {
    var url = e.currentTarget.dataset.url;
    var type = e.currentTarget.dataset.type;
    if (type == 'redirect') {
      wx.redirectTo({
        url: url,
      })
    } else {
      wx.navigateTo({
        url: url,
      })
    } 
  },

  isLogin: function() {
    let userInfo = wx.getStorageSync(config.userInfoKey);
    return userInfo ? true : false;
  },  
  askLogin: function() {

  }
}