
const app = getApp()
var rq = require('../../utils/request.js');
var cm = require('../../utils/common.js');
var config = require('../../config.js');
var auth = require('../../utils/auth.js');
Page({ 
  data: {
    pageShow: false,
    forceSignUp: true,
    showGuide: false,
    showRed: true,
    redPages: 0,
    redId: 0,
    _index: 0,
    imgUrls: [], //banner
    indicatorDots: true,
    autoplay: true,
    circular: true,
    interval: 4000,
    duration: 500,
    iconurl: [], //资料分类
    hotbooks: [], //推荐资料类型
    scrollTop: 100,
    freePages: 0,
    cartnum: '', //购物车数据,
    isSetUserInfo: 0,
    userRedPoint: 0,
    isBindUnion: 0
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.authJumpUrl = cm.authJumpUrl;
    this.jumpUrl = cm.jumpUrl;
    app.globalData.curPageObj = this;
    var _this = this;
    //1 step check is guide
    if (!_this.isGuided()) {
      _this.showGuide(); //
    } else {
      _this.startPage();
    }
  },
  onShow: function(options) {
    var _this = this;
    _this.data.cartnum = app.globalData.cartnum;
    _this.data.freePages = app.globalData.freePages;
    _this.setData({
      cartnum: _this.data.cartnum,
      freePages: _this.data.freePages
    })
  },
  getData: function() {
    var _this = this;
    _this.data.showGuide = false;
    _this.data.pageShow = true;
    rq.post('/api/minihome', {},
      function(res) {
        var banners = _this.data.imgUrls = res.data.data.banners; //banner
        var categories = res.data.data.categories; //资料分类
        var hotbooks = res.data.data.hotbooks; //热门推荐
        var data = res.data.data;
        _this.data.showRed = res.data.data.showred == 1 ? true : false;
        _this.data.redPages = res.data.data.redpages;
        _this.data.redId = res.data.data.redid;
        _this.data.isSetUserInfo = res.data.data.issetuserinfo;
        _this.data.userRedPoint = res.data.data.userredpoint;
        _this.data.isBindUnion = res.data.data.isbindunionid;
        app.globalData.freePages = _this.data.freePages = res.data.data.freepages;
        app.globalData.cartnum = _this.data.cartnum = data.cartnum;
        _this.setData({
          data: data,
          showGuide: _this.data.showGuide,
          pageShow: _this.data.pageShow,
          imgUrls: banners,
          iconurl: categories,
          hotbooks: hotbooks,
          showRed: _this.data.showRed,
          redPages: _this.data.redPages,
          redId: _this.data.redId,
          freePages: _this.data.freePages,
          cartnum: _this.data.cartnum,
          isSetUserInfo: _this.data.isSetUserInfo,
          userRedPoint: _this.data.userRedPoint
        })
        //todo
        if (!_this.data.isBindUnion){ //修复uionid
          auth.repairUnionId(function(res){
            if (res.data.status == 200 && res.data.data.pages){
              _this.data.freePages= res.data.data.pages
              _this.setData({
                freePages: _this.data.freePages
              });
            }            
          });
        }        
      });
  },

  isGuided: function() { //
    var isGuided = wx.getStorageSync('isGuided');
    return isGuided ? true : false;
  },
  showGuide: function() {
    this.data.showGuide = true;
    this.setData({
      showGuide: this.data.showGuide
    })
  },
  endGuide: function(e) {    
    wx.setStorageSync('isGuided',1); 
    this.data.showGuide = false;
    this.setData({
      showGuide: this.data.showGuide
    })
    this.startPage();    
  },
  startPage: function() {
    var _this = this;
    var userInfo = wx.getStorageSync(config.userInfoKey);
    if (_this.data.forceSignUp) {  
     
      if (!userInfo) {
        auth.login(function() {
          _this.getData();
        }, true);
      } else {
        _this.getData();
      }
    } else {     
      auth.login(function() {
        _this.getData();
      }, false);
    }
  },



  //链接到详情页面
  linkDetails: function(e) {
    app.globalData.bookid = e.target.dataset.bookid
    console.log(e.target.dataset.bookid)
    wx.navigateTo({
      url: '../details/details'
    })
  },
  //搜索
  funInput: function() {
    wx.navigateTo({
      url: '../search/search'
    })
  },
  //资料横向滚动
  tapMove: function(e) {
    this.setData({
      scrollTop: this.data.scrollTop + 10
    })
  },
  getRed: function() {
    var self = this;
    self.data.freePages += self.data.redPages;
    self.data.showRed = false;
    self.setData({
      freePages: self.data.freePages,
      showRed: self.data.showRed
    });
  },
  getUserInfo: function(e) {
    if (e.detail.errMsg == 'getUserInfo:ok') {
      var userInfo = e.detail.userInfo;
      rq.post('/api/minisaveuserinfo', {
        nick_name: userInfo.nickName,
        sex: userInfo.gender,
        avatar: userInfo.avatarUrl,
      }, function(res) {
        if (res.data.status == 200) {
          wx.redirectTo({
            url: '/pages/me/me',
          })
        }
      });
    }
  },
  stopMp: function() {
    return false;
  }
})