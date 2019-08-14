// pages/list/list.js
const app = getApp()
var rq = require('../../utils/request.js');
var hp = require('../../utils/helper.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageShow: false,
    showSignUp: false,
    checked: '',//全选
    hasUserInfo: false,
    show: false,
    cartNum: 0,
    cartList: [],
    checkIndex: [],
    checkAll: true, //是否全选    
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.globalData.curPageObj = this;
    var _this = this;
    var setData = {};
    setData.pageShow = _this.data.pageShow = true;
    rq.get('/api/miniusercart', {},
      function (res) {        
        setData.cartNum = _this.data.cartNum = res.data.data.count;
        setData.cartList = _this.data.cartList = res.data.data.list;
        _this.setData(setData)  
      });    
  },
  checkAll: function (e) {
    var value = e.detail.value;
    if (value.length > 0) {
      this.data.checkAll = true;
      this.setData({
        checkAll: this.data.checkAll
      })
    } else {
      this.data.checkAll = false;
      this.data.checkIndex=[];
      this.changChecked(this.data.checkIndex);
      this.setData({
        checkAll: this.data.checkAll,
        cartList: this.data.cartList
      })
    }
  },
  checkChange: function (e) {
    this.data.checkIndex = e.detail.value;
    if (this.data.checkIndex.length < this.data.cartList.length) {
      this.data.checkAll = false;
      this.changChecked(this.data.checkIndex);
    } else {
      this.data.checkAll = true;
    }
    this.setData({
      checkAll:this.data.checkAll,
      cartList: this.data.cartList,
    });    
  },
  changChecked: function (indexArr) {
    for (var i = 0; i < this.data.cartList.length; i++) {
      if (hp.inArray(i, indexArr)) {
        this.data.cartList[i].checked = true;
      } else {
        this.data.cartList[i].checked = false;
      }
    }
  },
  //删除购物车的商品
  delCommodity: function (e) {
    var cartid = e.target.dataset.cartid;    
    var cartIndex = e.target.dataset.index;
    var _this = this;
    rq.post('/api/minirmcart', { cartid: cartid },
      function (res) {
        app.globalData.cartnum = _this.data.cartNum = (_this.data.cartNum - 1)    
        _this.data.cartList.splice(cartIndex, 1);
        _this.setData({
          cartList: _this.data.cartList,
          cartNum: _this.data.cartNum
        })
        if (_this.data.cartList.length == 0) {
          wx.redirectTo({
            url: '../printing/printing'
          })
        }

        var pages = getCurrentPages()

        var prevPage = pages[pages.length - 1]  //当前界面

        var prevPage = pages[pages.length - 2]  //上一个页面

        prevPage.setData({
          shopping: _this.data.cartNum,
         // cartNum: _this.data.cartNum 
        })  
        app.globalData.cartnum = _this.data.cartNum 


      });
    var data = _this.data;
    

    

  },

  goOrder:function(){
    var cartStr = this.getCheckCartStr();
    if (!cartStr){
      wx.showToast({
        title: '请选择资料',
        icon:'none'
      })
    }else{
      wx.navigateTo({
        url: '/pages/confirmOrder/confirmOrder?cartids=' + cartStr,
      })
    }
  },
  getCheckCartStr:function(){
    var checkCartIds=[];
    for (var i = 0; i < this.data.cartList.length; i++) {
      if (this.data.checkAll || hp.inArray(i, this.data.checkIndex)) {
        checkCartIds.push(this.data.cartList[i].cartid);
      } 
    }
    return checkCartIds.join(',');
  }
})