// pages/list/list.js
var config = require('../../config.js');
var rq = require('../../utils/request.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageShow:false,
    version:'',
    pageData:{},
    isLoad:false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.isLoad = true;
    this.loadData();
  },
  onShow:function(){    
    if (this.data.isLoad){     
      this.loadData();
    }else{
      this.data.isLoad = false;
    }
  },

  loadData:function(){
    var self = this;
    rq.get('/api/miniuserhome', {}, function (res) {
      self.data.pageData = res.data.data;
      self.data.pageData.showUserId = parseInt(self.data.pageData.userid) + 10000;
      self.data.pageShow = true;
      self.data.version = config.version;
      self.setData({
        pageData: self.data.pageData,
        pageShow: self.data.pageShow,
        version: self.data.version
      });
    })
  },
  
  logout:function(){
    rq.post('/api/minilogout',{},function(res){
      wx.removeStorageSync(config.userInfoKey);
      wx.removeStorageSync('loginCodeInfo');
      wx.removeStorageSync('isBindUnionId');
      wx.navigateTo({
        url: '/pages/guideMap/guideMap',
      })
    }); 
  }, 
})