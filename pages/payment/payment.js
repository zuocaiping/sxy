// pages/list/list.js
var rq = require('../../utils/request.js');
var config = require('../../config.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    _printing: 1, //打印机完成状态
    _transported: 0, //正在运输
    _distribution: 0, //等待配送
    _collect: 0,//已收货
    orderId: 0,
    showBanner: false,
    redPages: 0,
    isTake: 0,
    redId: 0,
    isPay: 0,
    showRed: false,
    pageShow: false,
    _receive: 0,
    pageTime: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    var setData = {};
    setData.orderId = self.data.orderId = options.orderid;
    setData.pageShow = self.data.pageShow = true;
    rq.get('/api/minipaysuccess', { orderid: self.data.orderId }, function (res) {
      setData.showBanner = self.data.showBanner = res.data.data.showbanner;
      setData.redPages = self.data.redPages = res.data.data.redpages;
      setData.redId = self.data.redId = res.data.data.redid;
      setData.isTake = self.data.isTake = res.data.data.istake;
      setData.isPay = self.data.isPay = res.data.data.ispay;
      setData.pageTime = self.data.pageTime = res.data.data.paytime;
      self.setData(setData);
    });    
  },

  onShareAppMessage: function () {
    var self = this;
    var userInfo = wx.getStorageSync(config.userInfoKey);
    var rData = {
      title: '[有人@你]送你一个红包，我刚领了一个大的！赶紧试试你的手气！',
      path: '/pages/share/share?page=' + self.data.redPages * 2 + '&orderid=' + self.data.orderId,
      imageUrl:'http://img.booktopaper.com/mini/share_red.png'
    }  
    rq.post('/api/miniaddshare', { url: rData.path}); 
    return rData;
  },

  showRed: function () {
    if (this.data.isTake) {
      wx.showToast({
        title: '已经领取过红包',
        icon: 'none'
      })
    } else if (!this.data.isPay) {
      wx.showToast({
        title: '没有完成支付',
        icon: 'none'
      })
    } else {
      var _this = this;
      this.data.showRed = true;
      this.setData({
        showRed: this.data.showRed
      });

    }
  },
  getRed: function (e) {
    this.data.isTake = 1;
    this.data._receive = 1;
    this.setData({
      isTake: this.data.isTake,
      _receive: this.data._receive
    });
  }
})