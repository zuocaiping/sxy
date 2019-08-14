
var rq = require('../../utils/request.js');
var cm = require('../../utils/common.js');
var hp = require('../../utils/helper.js');
Page({  
  data: {
    rqIng:false,
    status: -1, 
    orderList: [],
    offset: 0,
    limit: 20,
    pageShow: false,
    hasMore: true,
    payData: [],
    statusList: { //状态列表
      0: '待付款',
      1: '待发货',
      2: '已发货',
      3: '已收货',
      4: '已关闭',
      5: '申请处理中',
      6: '已退款',
      7: '退款驳回',
      8: '待评价',
      9: '已完成',
      11: '订单异常'
    },
    rule: true,
    curIndex:0, //当前操作的订单
    rqIng:false
  },

  //tab切换
  tab: function (e) {
    var self = this;
    var status = e.currentTarget.dataset.status;
    status = status == 'false' ? false : parseInt(status);
    if (status === self.data.status) {
      return false;
    }

    var setData = {};
    setData.status = self.data.status = status;
    setData.offset = self.data.offset = 0;
    self.data.orderList=[];
    self.getList(setData);
  },

  onLoad: function (options) {
    this.jumpUrl = cm.jumpUrl;
    var self = this;
    var setData = {};
    setData.status = self.data.status = options.status == undefined ? -1 : parseInt(options.status);
    setData.pageShow = self.data.setData = true;
    self.getList(setData);
  },

  onReachBottom: function () {
    var self = this;
    if (self.data.rqIng){
      return false;
    }    
    if (self.data.hasMore) {
      self.getList();
    }
  },

  getList: function (toSetData) {
    var self = this;
    toSetData = toSetData || {};
    self.data.rqIng= true,
    rq.get('/api/miniorderlist', {
      status: self.data.status,
      offset: self.data.offset,
      limit: self.data.limit
    }, function (res) {
      self.data.rqIng = false;
      var list = res.data.data.list;
      // toSetData.orderList = self.data.orderList = self.data.orderList.concat(res.data.data.list);
      if (res.data.data.list.length < self.data.limit) {
        toSetData.hasMore = self.data.hasMore = false;
      }else{
        toSetData.hasMore = self.data.hasMore = true;
      }
      toSetData.offset = self.data.offset = self.data.offset + self.data.limit;
      for (var i = 0; i < list.length; i++) {
        list[i].shippingfee = hp.moneyToYuan(list[i].shippingfee);
        list[i].payamount = hp.moneyToYuan(list[i].payamount);
        list[i].discountamount = hp.moneyToYuan(list[i].discountamount);
        for (var j = 0; j < list[i]['books'].length; j++) {
          list[i]['books'][j].bookprice = hp.moneyToYuan(list[i]['books'][j].bookprice);
        }
        self.data.orderList.push(list[i]);
      }
      toSetData.orderList = self.data.orderList;     
      self.setData(toSetData);
    })
  },

  rePay: function (e) {
    var self = this;
    if (self.data.rqIng) {
      return false;
    }  
    var orderId = e.currentTarget.dataset.orderid;
    if (self.data.payData[orderId]) {
      self.rqPay(self.data.payData[orderId]);
    } else {
      self.data.rqIng = true;
      rq.post('/api/minirepay', { orderid: orderId }, function (res) {
        self.data.rqIng = false;
        self.data.payData[orderId] = res.data.data.paydata;
        self.data.payData[orderId].success = function (res) {
          wx.navigateTo({
            url: '/pages/payment/payment?orderid=' + orderId,
          })
        }
        self.data.payData[orderId].fail = function (res) {
          if (res.errMsg == 'requestPayment:fail cancel') {
            wx.showToast({
              title: '取消支付',
              icon: 'none'
            })
          } else {
            wx.showToast({
              title: '系统繁忙，请重试',
              icon: 'none'
            })
          }
        }
        self.rqPay(self.data.payData[orderId]);
      },function(res){
        self.data.rqIng = false;
        wx.showToast({
          title: res.data.msg+',请重新下单',
          icon:'none'
        })
      });
    }
  },
  rqPay: function (payData) {
    wx.requestPayment(payData);
  },
  cancelOrder: function (e) {    
    this.data.curIndex = e.currentTarget.dataset.index;
    this.setData({ curIndex: this.data.curIndex,rule: false })
  },
  doCancelOrder:function(){
    var self = this;
    if (self.data.rqIng){
      return false;
    }  
    var cancelOid = self.data.orderList[this.data.curIndex].orderid;
    var rqData={
      orderid: cancelOid
    }
    self.data.rqIng = true;
    rq.post('/api/minicancelorder', rqData,function(res){
      self.data.rqIng = false;
      self.data.orderList.splice(this.data.curIndex,1);
      self.setData({
        orderList: self.data.orderList,
        rule:true,
      });
      wx.showToast({
        title: '取消成功',
      })
    },function(res){
      self.data.rqIng = false;
      wx.showToast({
        title: res.data.msg,
        icon:'none'
      })
    });
  },

  hide1: function () {
    this.setData({ rule: true })
  },
  receiptOrder: function (e) {
    var self = this;
    var rIndex = e.currentTarget.dataset.index;
    var orderId = e.currentTarget.dataset.orderid;
    rq.post('/api/miniorderreceipt', { orderid: orderId }, function (res) {
      wx.showToast({
        title: '收货成功',
      })
      self.data.orderList[rIndex].status = 8;
      self.setData({
        orderList: self.data.orderList
      })
    });
  }
})