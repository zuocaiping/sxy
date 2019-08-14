var app = getApp();
var hp = require('../../utils/helper.js');
Page({
  data: {
    orderAddr:{},
    orderId:0,
  },
  onLoad:function(options){
    var self =this;
    var setData={};
    setData.orderId = self.data.orderId = options.orderid;
    setData.orderAddr = self.data.orderAddr = app.globalData.orderAddr;
    if (self.data.orderAddr){
      setData.orderAddrStr = self.data.orderAddrStr = hp.formatAddr(self.data.orderAddr);
    }
   
    app.globalData.orderAddr = null;
    self.setData(setData);
  },
  skip:function(){
    wx.redirectTo({
      url: '/pages/payment/payment?orderid=' + this.data.orderId,
    })
  },

  changeAddr:function(){
    wx.navigateTo({
      url: '/pages/confirmAddress/confirmAddress?orderid=' + this.data.orderId + '&addressid=' + this.data.orderAddr.addressid,
    })
  }
  
})