// pages/list/list.js
const app = getApp()
var rq = require('../../utils/request.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    _boolean: false,
    page: false,
    categoryname:'',
    cartnum:0,//购物车数据
    booklist:[],//书列表
    categories:[],//tab切换数据
    currentTab: 'aaa',
    index:'',
    scrollTop: 100,
    categoryId:0,
    childId:0,
    isSetUserInfo: 0 
  },
  //搜索
  funInput: function () {
    wx.navigateTo({
      url: '../search/search'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */  
  onLoad: function (options) {
    
    this.data.categoryId = options.categoryid;
   // console.log(this.data.childId)
    if (options.chlidid){
      this.data.childId
    }
    this.list(); 
    
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {    
    this.setData({
      cartnum: app.globalData.cartnum
    })
   
  },
  //菜单切换
  menuTab: function () {
    wx.navigateTo({
      url: '../dataClassification/dataClassification'
    })
  },
  //列表数据
  list: function (num) {
    var _this = this;
    rq.post('/api/minilist', { categoryid: this.data.categoryId, childid: num },
      function (res) {
        var booklist = res.data.data.booklist;
        var categories = res.data.data.children;
        var categoryname = res.data.data.categoryname
        app.globalData.cartnum = _this.data.cartnum = res.data.data.cartnum; 
        _this.data.isSetUserInfo = res.data.data.issetuserinfo; 
        // console.log(res)
        _this.setData({
          booklist: booklist,
          categories: categories,
          categoryname: categoryname,
          cartnum: _this.data.cartnum,
          _boolean: true,
          isSetUserInfo: _this.data.isSetUserInfo
        })
      });
  },
  //tab切换
  tab: function (e) {
    var _this = this;
    var childid = e.currentTarget.dataset.categoryid;
    this.list(childid);
   // console.log(childid)
    _this.setData({
      currentTab: e.currentTarget.dataset.idx,
      index: 'whole'
    })
    // console.log('点击后：'+_this.data.currentTab)
  }, 
  //title横向滚动
  tapMove: function (e) {
    this.setData({
      scrollTop: this.data.scrollTop + 10
    })
  },
  getUserInfo: function (e) {
    if (e.detail.errMsg == 'getUserInfo:ok') {
      var userInfo = e.detail.userInfo;
      rq.post('/api/minisaveuserinfo', {
        nick_name: userInfo.nickName,
        sex: userInfo.gender,
        avatar: userInfo.avatarUrl,
      }, function (res) {
        if (res.data.status == 200) {
          wx.redirectTo({
            url: '/pages/me/me',
          })
        }
      });
    }
  }
})