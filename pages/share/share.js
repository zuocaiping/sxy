// pages/share/share.js
const app = getApp()
var rq = require('../../utils/request.js');
var config = require('../../config.js');
var auth = require('../../utils/auth.js');
Page({

  data: {
    scrollTop: 100,
    pageShow: false,
    forceSignUp: true,
    shareUid: 0,
    isGet: false,
    pages: 0,
    exprietime:'',   
    friends: [],
    sharePages:0,
    shareTime:0,
    orerId:0,
    isSelf:0,
    isGet:0,
    isSend:0,
    redStep:0,
    isDefaultBanner:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var self = this;
    app.globalData.curPageObj = this; 
    self.data.sharePages = options.page;   
    self.data.orerId = options.orderid;
    self.startPage();
  },
  startPage: function () {
    var self = this;
    if (self.data.forceSignUp) {
      let userInfo = wx.getStorageSync(config.userInfoKey);
      if (!userInfo) {
        auth.login(function () {
          self.getData();
        }, true);
      } else {
        self.getData();
      }
    } else {
      auth.login(function () {
        self.getData();
      }, false);
    }
  },
  getData:function(){
    var self =this;
    var setData = {};
    
    rq.get('/api/minishare', {
      orderid: self.data.orerId, 
      pages: self.data.sharePages  
    }, function (res) {
      setData.pages = self.data.pages = res.data.data.pages;
      setData.isGet = self.data.isGet = res.data.data.isget;
      setData.isSelf = self.data.isSelf = res.data.data.isself;
      setData.isSend = self.data.isSend= res.data.data.issend;
      setData.bannerurl = self.data.bannerurl = res.data.data.bannerurl;
      setData.bannerBookId = self.data.bannerBookId = res.data.data.bannerbookid;
      setData.exprietime = self.data.exprietime = res.data.data.exprietime;
      setData.avatar = self.data.avatar = res.data.data.avatar;
      setData.exprietime = self.data.exprietime = res.data.data.exprietime;
      setData.friends = self.data.friends = res.data.data.friendlist;
      setData.btntext = self.data.btntext = res.data.data.btntext;
      setData.isDefaultBanner = self.data.isDefaultBanner = res.data.data.isdefaultbanner;
      setData.nick = self.data.nick = res.data.data.nick;
      if (self.data.isSend){
        setData.redStep = self.data.redStep = 1;
      }else{
        setData.redStep = self.data.redStep = 0;
        setData.pageShow = self.data.pageShow = true;
      }  
      self.setData(setData);
    });
  },
  openRed:function(){
    var self=this;    
    self.data.redStep = 2;
    self.setData({
      redStep: self.data.redStep
    });
    setTimeout(function(){
      self.data.redStep = 0;
      self.data.pageShow = true;
      self.setData({
        pageShow: self.data.pageShow,
        redStep: self.data.redStep
      });
    },3000);
  },
  stopMp:function(){
    return false;
  },
  colseRed:function(){
    var self = this;
    self.data.redStep = 0;
    self.data.pageShow = true;
    self.setData({
      pageShow: self.data.pageShow,
      redStep: self.data.redStep
    });
  }

})