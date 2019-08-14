//index.js
//获取应用实例
const app = getApp()
var rq = require('../../utils/request.js');
var cm = require('../../utils/common.js');
var config = require('../../config.js');
var auth = require('../../utils/auth.js');
Page({
  data: {
    pageShow: false,//页面加载     
    _state:'',//收藏状态
    _stateText:'收藏',
    showSignUp:false,
    mode: 'aspectFit',
    data:{},
    collectionImg:'http://img.yaotia.com/act/i-follow.png',
    cartnum:0,//加入购物车
    scrollTop: 100,
    showFullDesc:false,
    bookid:0,
    forceSignUp:true,
    shareType:2,
    scrollTop:0,
  }, 
  /**
   * 生命周期函数--监听页面加载
   */  
  onLoad: function (options) {
    console.log(app.globalData.cartnum);
    this.authJumpUrl = cm.authJumpUrl;
    this.jumpUrl = cm.jumpUrl;
    app.globalData.curPageObj = this;
    var self = this;
    var setData = {};
    if (options.sceneid){
      wx.setStorageSync('sceneid', options.sceneid)
    }
    setData.bookid = self.data.bookid = options.bookid;
    setData.pageShow = self.data.pageShow = true;

    if (self.data.forceSignUp) {
      let userInfo = wx.getStorageSync(config.userInfoKey);
      if (!userInfo) {
        auth.login(function () {
          self.getData(setData);
        }, true);
      } else {
        self.getData(setData);
      }
    } else {
      auth.login(function () {
        self.getData(setData);
      }, false);
    }
  
  }, 
  getData: function (setData){    
    setData.cartnum = app.globalData.cartnum;      
    var self = this;    
    rq.get('/api/minibookinfo', { bookid: self.data.bookid },
      function (res) {
        setData.data = self.data.data = res.data.data;
        setData.isincart = self.data.isincart = res.data.data.isincart;  
        setData.cartnum = app.globalData.cartnum = self.data.cartnum = res.data.data.cartnum;            
        self.setData(setData) 
             
      });
  },
  onShow: function (options){
    var self = this;  
    self.data.cartnum = app.globalData.cartnum;   
    self.setData({
      cartnum: self.data.cartnum
    });
  },
  //加入打印机功能
  addToCart: function (){
    var self = this; 
    if (self.data.data.isincart == 1){
      wx.showToast({
        title: '你已经加入打印机',
        icon: 'none',
        duration: 2000
      })
    } else{      
      rq.post('/api/miniaddtocart', { bookid: self.data.bookid, num: 1 }, function (res) {
        self.data.cartnum = self.data.cartnum + 1;
        app.globalData.cartnum += 1; 
        self.setData({
          cartnum: self.data.cartnum,
          'data.isincart': 1
        })
      }); 
    }  
    
  },//添加收藏功能
  addCollection: function (e){    
    var self = this;
    var bookid = self.data.bookid;    
    if (self.data.data.iscollect==0){
      rq.post('/api/minibookcollect', { bookid: bookid }, function (res) {       
        self.setData({
          'data.iscollect':1
        })
      });

    } else{
      rq.post('/api/minicancelcollect', { bookid: bookid }, function (res) {        
        self.setData({
          'data.iscollect': 0
        })
      });
    }
    
  },
  //横向滚动
  tapMove: function (e) {
    this.setData({
      scrollTop: this.data.scrollTop + 10
    })
  },
  //图片预览
  previewImg:function(e){
    var self = this;
    var imageUrl = e.currentTarget.dataset.url  
   
    wx.previewImage({
      current: imageUrl, // 当前显示图片的http链接
      urls: self.data.data.imageurls  // 需要预览的图片http链接列表
    })
  },
  showFullDesc:function(){
      this.data.showFullDesc = true;
      this.setData({
        showFullDesc: this.data.showFullDesc
      });
  },
  hideFullDesc: function () {
    this.data.showFullDesc = false;
    this.setData({
      showFullDesc: this.data.showFullDesc
    });
  },
  onShareAppMessage :function () {  
    var rData = {
      title: this.data.data.sharetitle,
      path: '/pages/details/details?uid=' + app.globalData.userid + '&bookid=' + this.data.bookid
    } 
    rq.post('/api/miniaddshare', { url: rData.path, type: this.data.shareType });
    return rData;
  },
  scrollToTop:function(){
    this.setData({
      scrollTop: 0
    })
  }

})