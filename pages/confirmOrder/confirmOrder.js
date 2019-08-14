// pages/list/list.js
const app = getApp()
var rq = require('../../utils/request.js');
var hp = require('../../utils/helper.js');
var confg = require('../../config.js');

Page({
  data: {
    buytype: 1, //1 直接购买 2购物车购买
    bookId: 0,
    cartStr: '',
    shippingInfo: null, //送货方式
    shippingAddr: null, //送货地址,
    addrStr: '',
    bookList: [], //资料列表
    freePages: 0, //可用免费页
    useFreePages: 0, //使用免费页数
    totalPages: 0,
    bookNum: 0,
    cards: [], //可用卡券
    useCardIndex: -1, //使用第几张卡券
    selectCardIndex: -1,
    pageprice: 0,
    pagePriceMoney: 0,
    coverprice: 0,
    bindprice: 0,
    payPages: 0,
    pageMoney: 0,
    coverBindMoney: 0,
    shippingMoney: 0,
    totalMoney: 0,
    pageFee: 0,
    coverBindFee: 0,
    shippingFee: 0,
    totalFee: 0,
    showAddrPicker: false,
    showAddrEdit: false,
    payData: null,
    orderId: 0,
    totalPages: 0,
    areaCanFree: false, //用户地址是否要免邮
    freeShippingLimit: 0,
    shIsFree: false,
    coverBindPriceMoney: 0,
    rqIng: false, //正在请求
    isUseBuzhi: true, //是否使用步知币
    buzhiMoney: 0, //步知币
    useBuzhiMoney: 0, //订单使用多少步知币
    payFee: 0,
    payMoney: 0,
    flag: true,
    rule: true, //规则
    fromAddr: false, //是否返回的
    screenHeight: 0,
    screenHeight1: 1,
    bindCoverText: '',
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var self = this;
    var setData = {};
    var bookId = options.bookid;
    var cartStr = options.cartids;
    wx.getSystemInfo({
      success: function(res) {
        setData.screenHeight = res.screenHeight - res.windowHeight;
      }
    })
    if (bookId) {
      setData.buytype = self.data.buytype = 1;
      setData.bookId = self.data.bookId = bookId;
    } else {
      setData.buytype = self.data.buytype = 2;
      setData.cartStr = self.data.cartStr = cartStr;
    }
    setData.pageShow = self.data.pageShow = true;
    //
    var rqData = {};
    if (self.data.buytype == 1) {
      rqData.bookid = bookId;
    } else {
      rqData.cartids = cartStr;
    }

    rq.post('/api/miniconfirmorder', rqData,
      function(res) {
        var rspData = res.data.data;
        if (rspData.useraddress.length > 0) {
          setData.shippingAddr = self.data.shippingAddr = rspData.useraddress[0];
          setData.addrStr = self.data.addrStr = hp.formatAddr(self.data.shippingAddr);
        }
        //初始化
        setData.shippingInfo = self.data.shippingInfo = rspData.shipping[0]; //运费方式
        setData.freePages = self.data.freePages = rspData.userpages; //免费页数
        setData.bindprice = self.data.bindprice = rspData.bindprice; //装订价格
        setData.coverprice = self.data.coverprice = rspData.coverprice; //封面价格
        setData.pageprice = self.data.pageprice = rspData.pageprice; //每页价格
        setData.buzhiMoney = self.data.buzhiMoney = rspData.buzhimoney; //步知币数
        setData.bookList = self.data.bookList = rspData.list; //所有资料
        setData.pagePriceMoney = self.data.pagePriceMoney = hp.moneyToYuan(self.data.pageprice); //
        setData.coverBindPriceMoney = self.data.coverBindPriceMoney = hp.moneyToYuan(self.data.bindprice + self.data.coverprice);
        //1 算页数
        for (var i = 0; i < self.data.bookList.length; i++) { //book list
          self.data.totalPages += (self.data.bookList[i].bookpage * self.data.bookList[i].booknum);
          self.data.bookNum += self.data.bookList[i].booknum;
        }
        setData.totalPages = self.data.payPages = self.data.totalPages;
        setData.bookNum = self.data.bookNum;

        //2 设置可用优惠券，选择最大可用优惠券
        if (rspData.usercard.length > 0) { //计算可用卡券
          var curI = 0;
          var maxDiscountPage = 0;
          for (var i = 0; i < rspData.usercard.length; i++) { //book list
            var card = rspData.usercard[i];
            if (self.data.totalPages >= card.pageslimit) {
              self.data.cards.push(card);
              if (card.pages > maxDiscountPage) {
                self.data.useCardIndex = curI;
                maxDiscountPage = card.pages;
              }
              curI++;
            }
          }
        }
        setData.cards = self.data.cards;
        setData.useCardIndex = setData.selectCardIndex = self.data.selectCardIndex = self.data.useCardIndex;
        //计算
        // 计算书页金额
        self.calculBookFee();
        // 计算封装金额
        self.calculCoverBindFee();
        if (self.data.shippingAddr == null) {
          self.data.toSetData = setData;
          app.globalData.orderPage = self;
          wx.navigateTo({
            url: '/pages/confirmAddress/confirmAddress?source=1',
          })
          return false;
        } else {
          // 计算运费
          self.calculShippingFee();
          self.setFee(setData);
        }
      });
  },
  onShow: function() {
    var self = this;
    if (self.data.fromAddr) {
      if (self.data.toSetData) {
        self.data.toSetData.shippingAddr = self.data.shippingAddr;
        self.data.toSetData.addrStr = self.data.addrStr = hp.formatAddr(self.data.shippingAddr);
        var setData = self.data.toSetData;
        self.data.toSetData = null;
      } else {
        self.data.addrStr = hp.formatAddr(self.data.shippingAddr);
        var setData = {
          shippingAddr: self.data.shippingAddr,
          addrStr: self.data.addrStr
        };
      }
      self.calculShippingFee();
      self.setFee(setData);
      app.globalData.orderPage = null;
    }
    self.data.payData = null;
  },

  //计算支付页数
  calculBookFee: function() {
    var self = this;
    //1 优惠券 扣页数
    if (self.data.useCardIndex >= 0) {
      self.data.payPages = self.data.totalPages - self.data.cards[self.data.useCardIndex].pages;
    } else {
      self.data.payPages = self.data.totalPages;
    }
    //2 扣免费页数
    if (self.data.payPages > 0 && self.data.freePages > 0) {
      if (self.data.freePages > self.data.payPages) {
        self.data.useFreePages = self.data.payPages;
        self.data.payPages = 0;
      } else {
        self.data.payPages = self.data.payPages - self.data.freePages;
        self.data.useFreePages = self.data.freePages;
      }
    }
    self.data.pageFee = self.data.payPages * self.data.pageprice;
  },
  calculCoverBindFee: function() {
    var self = this;
    var normalBookNum = 0;
    self.data.coverBindFee = 0;
    self.data.bindCoverText = '';
    for (var i = 0; i < self.data.bookList.length; i++) {
      if (self.data.bookList[i].booktype == 2 && self.data.bookList[i].coverbindamount > 0) {
        self.data.coverBindFee += parseInt(self.data.bookList[i].coverbindamount);
        if (self.data.bindCoverText == '') {
          self.data.bindCoverText += self.data.bookList[i].booknum + '套×' + (self.data.bookList[i].coverbindamount / 100).toFixed(2) + '元';
        } else {
          self.data.bindCoverText += '+' + self.data.bookList[i].booknum + '套×' + (self.data.bookList[i].coverbindamount / 100).toFixed(2) + '元';
        }
      } else {
        self.data.coverBindFee += self.data.bookList[i].booknum * (self.data.coverprice + self.data.bindprice);
        normalBookNum += self.data.bookList[i].booknum;
      }
    }
    if (normalBookNum > 0) {
      if (self.data.bindCoverText == '') {
        self.data.bindCoverText += normalBookNum + '本×' + ((self.data.coverprice + self.data.bindprice) / 100).toFixed(2) + '元';
      } else {
        self.data.bindCoverText += '+' + normalBookNum + '本×' + ((self.data.coverprice + self.data.bindprice) / 100).toFixed(2) + '元';
      }
    }
  },
  calculShippingFee: function() {
    var self = this;
    self.data.areaCanFree = false;
    self.data.shIsFree = false;
    var provinceId = 0;
    if (self.data.shippingAddr != null) {
      provinceId = self.data.shippingAddr.provinceid;
    }
    //

    if (self.data.shippingInfo.rules.length > 0) {
      for (var i = 0; i < self.data.shippingInfo.rules.length; i++) {
        var curRule = self.data.shippingInfo.rules[i];
        if (hp.inArray(provinceId, curRule.areaids)) {//如果是特殊地区
          if (curRule.freelimit > 0) { //特殊地址可免邮
            self.data.freeShippingLimit = curRule.freelimit;
            if (self.data.totalPages >= curRule.freelimit) {
              self.data.shIsFree = true;
              self.data.shippingFee = 0;
              return false;
            } else {              
              self.data.areaCanFree = true;
            }
          }
          self.data.shippingFee = curRule.price;
          return false;
        }
      }
    }

    if (self.data.shippingInfo.freelimit > 0) {//默认
      self.data.freeShippingLimit = self.data.shippingInfo.freelimit;
      if (self.data.totalPages >= self.data.shippingInfo.freelimit) {
        self.data.shIsFree = true;
        self.data.shippingFee = 0;
        return false;
      } else {
        self.data.areaCanFree = true;
      }
    }    
    self.data.shippingFee = self.data.shippingInfo.defaultprice
  },
  //设置全部显示价格
  setFee: function(setData) {
    var self = this;
    setData = setData || {};
    setData.totalPages = self.data.totalPages; //显示总页数
    setData.payPages = self.data.payPages;
    setData.useFreePages = self.data.useFreePages;
    setData.bookNum = self.data.bookNum;
    self.data.payFee = self.data.totalFee = self.data.pageFee + self.data.shippingFee + self.data.coverBindFee;
    setData.totalMoney = hp.moneyToYuan(self.data.totalFee);
    setData.pageMoney = hp.moneyToYuan(self.data.pageFee);
    setData.coverBindMoney = hp.moneyToYuan(self.data.coverBindFee);
    setData.bindCoverText = self.data.bindCoverText;
    setData.shippingMoney = hp.moneyToYuan(self.data.shippingFee);
    setData.freeShippingLimit = self.data.freeShippingLimit;
    setData.areaCanFree = self.data.areaCanFree;
    setData.shIsFree = self.data.shIsFree;
    if (self.data.buzhiMoney > 0 && self.data.isUseBuzhi) {
      if (self.data.buzhiMoney * 100 > self.data.totalFee) {
        setData.useBuzhiMoney = self.data.useBuzhiMoney = parseInt(self.data.totalFee / 100);
      } else {
        setData.useBuzhiMoney = self.data.useBuzhiMoney = self.data.buzhiMoney;
      }
      self.data.payFee = self.data.totalFee - self.data.useBuzhiMoney * 100;
    }
    setData.payMoney = hp.moneyToYuan(self.data.payFee);
    self.setData(setData);
  },

  showAddrPicker: function() {
    app.globalData.orderPage = this;
    wx.navigateTo({
      url: '/pages/myAddress/myAddress?source=1',
    })
  },
  //
  goPay: function() {
    var self = this;
    if (self.data.rqIng) {
      return false;
    }
    if (self.data.payData != null) {
      self.rqPay(self.data.payData);
      return false;
    }
    if (self.data.shippingAddr == null) {
      wx.showToast({
        title: '请选择地址',
        icon: 'none'
      })
      return false;
    }
    var rqData = {};
    if (self.data.buytype == 1) {
      rqData.bookid = self.data.bookId
    } else {
      rqData.cartids = self.data.cartStr
    }
    //增加场景
    var senceid = wx.getStorageSync('sceneid')
    if (senceid) {
      rqData.senceid = senceid;
    }
    rqData.buzhimoney = self.data.useBuzhiMoney;
    rqData.shippingid = self.data.shippingInfo.shippingid;
    rqData.freepage = self.data.useFreePages;
    rqData.cardid = 0;
    if (self.data.useCardIndex >= 0) {
      rqData.cardid = self.data.cards[self.data.useCardIndex].cardid;
    }
    rqData.addressid = self.data.shippingAddr.addressid;
    self.data.rqIng = true;
    rq.post('/api/minimakeorder', rqData, function(res) {
      self.data.rqIng = false;
      self.data.orderId = res.data.data.orderid;
      if (res.data.data.ispay) { //刚好步知币能抵扣全部金额
        wx.navigateTo({
          url: '/pages/payment/payment?orderid=' + self.data.orderId,
        })
        return false;
      }
      if (res.data.data.paydata) {
        self.data.payData = res.data.data.paydata;
      }

      var dCartNum = res.data.data.cartnum;
      self.data.payData.success = function(res) {
        app.globalData.cartnum -= dCartNum;
        if (rqData.freepage > 0) {
          app.globalData.freePages -= rqData.freepage;
        }
        app.globalData.orderAddr = self.data.shippingAddr;
        wx.redirectTo({
          url: '/pages/address-confirmation/address-confirmation?orderid=' + self.data.orderId,
        })
      }
      self.data.payData.fail = function(res) {
        if (res.errMsg == 'requestPayment:fail cancel') {
          wx.showToast({
            title: '取消支付',
            icon: 'none'
          })
        } else {
          wx.showToast({
            title: '支付失败',
            icon: 'none'
          })
        }
      }
      self.rqPay(self.data.payData);
    }, function(res) {
      self.data.rqIng = false;
      wx.showToast({
        title: res.data.msg,
        icon: 'none'
      })
    });
  },
  rqPay: function(payData) {
    wx.requestPayment(payData);
  },
  //链接到首页
  _btnLike: function() {
    var self = this;
    if (self.data.buytype == 2) {
      wx.redirectTo({
        url: '/pages/guideMap/guideMap'
      })
    } else {
      rq.post('/api/miniaddtocart', {
        bookid: self.data.bookId,
        num: 1
      }, function(res) {
        wx.navigateTo({
          url: '/pages/printer/printer',
        })
      }, function() {
        wx.navigateTo({
          url: '/pages/printer/printer',
        })
      });
    }
  },
  /**
   *优惠券 弹出层函数
   */
  //出现
  show: function() {
    this.setData({
      flag: false
    })
  },
  //消失

  hide: function() {
    this.setData({
      flag: true
    })

  },
  /**
   *步知币规则 弹出层函数
   */
  //出现
  show1: function() {
    this.setData({
      rule: false
    })
  },
  //消失

  hide1: function() {
    this.setData({
      rule: true
    })
  },
  changeUseBuzhiCoin: function() {
    var self = this;
    self.data.isUseBuzhi = !self.data.isUseBuzhi;
    self.setFee();
  },
  pickCard: function(e) {
    var self = this;
    var clikIndex = e.currentTarget.dataset.index;
    if (clikIndex == self.data.selectCardIndex) {
      self.data.selectCardIndex = -1;
    } else {
      self.data.selectCardIndex = clikIndex;
    }
    self.setData({
      selectCardIndex: self.data.selectCardIndex
    });
  },
  changeCard: function() {
    var self = this;
    if (self.data.selectCardIndex == self.data.useCardIndex) {
      self.setData({
        flag: true
      })
    } else {
      self.data.useCardIndex = self.data.selectCardIndex;
      self.data.payData = null;
      var setData = {
        flag: true,
        useCardIndex: self.data.useCardIndex,
      }
      self.calculBookFee();
      self.setFee(setData);
    }
  },
  onPageScroll: function(e) {
    var self = this;
    var setData = {};
    if (self.data.screenHeight <= e.scrollTop) {
      self.setData({
        screenHeight1: 0
      });
    } else {
      self.setData({
        screenHeight1: 1
      });
    }
  }
})