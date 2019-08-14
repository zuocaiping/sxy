// pages/list/list.js
var app = getApp();
var rq = require('../../utils/request.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show:true,
    fromOrder:false,
    orderPage:null,
    showList:true,
    addrid:0,
    curIndex:0,
  },

  //tab切换
  tab: function (e) {
    //var dataId = e.currentTarget.dataset.id;
    var dataId = e.currentTarget.id;
    var obj = {};
    obj.curHdIndex = dataId;
    obj.curBdIndex = dataId;
    this.setData({
      tabArr: obj
    })
    //console.log(e);
  }, 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.source==1){
      this.data.fromOrder=true;
    }
    this.setData({
      fromOrder: this.data.fromOrder
    })
  },
  onShow:function(){
    var self = this;
    rq.get('/api/miniuseraddress', {}, function (res) {
      self.data.addrList = res.data.data.list; 
      self.setData({
        showList: self.data.showList,
        addrList: self.data.addrList
      });      
    });
  },
  pickAddr: function (e) {
    var self = this;
    if (self.data.fromOrder){   
      self.data.addrid = e.currentTarget.dataset.addrid;
      self.data.curIndex = e.currentTarget.dataset.index; 
      app.globalData.orderPage.data.shippingAddr = self.data.addrList[self.data.curIndex];      
      app.globalData.orderPage.data.fromAddr = true; 
      wx.navigateBack({
      })
    }
  },
  removeAddr: function (e) {
    var self = this;
    var rmIndex = e.currentTarget.dataset.index;
    var rmAddr = self.data.addrList[rmIndex];
    rq.post('/api/miniremoveaddress', {
      addressid: rmAddr.addressid
    }, function (res) {
      self.data.addrList.splice(rmIndex, 1);
      wx.showToast({
        title: '删除成功',
      })
      self.setData({
        addrList: self.data.addrList
      })
    });
  },
  setDefault: function (e) {
    var self = this;
    var setIndex = e.currentTarget.dataset.index;
    var setAddressId = self.data.addrList[setIndex].addressid;
    rq.post('/api/minisetdefaultaddr', { addressid: setAddressId }, function (res) {
      for (var i = 0; i < self.data.addrList.length; i++) {
        if (i == setIndex) {
          self.data.addrList[i].isdefault = 1;
        } else {
          self.data.addrList[i].isdefault = 0;
        }
      }
      console.log(self.data.addrList);
      self.setData({
        addrList: self.data.addrList
      });
    });
  },
  stopPropagation:function(){
    return false;
  }
})