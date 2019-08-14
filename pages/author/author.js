//index.js
//获取应用实例
const app = getApp()
var rq = require('../../utils/request.js');
var cm = require('../../utils/common.js');
Page({
  data: {
    pageShow:false,
    mode: 'aspectFit',
    authorId: 0,
    authorInfo:null
  },
  onLoad: function(option) {
    this.jumpUrl = cm.jumpUrl;
    app.globalData.curPageObj = this;
    let self = this;
    self.data.authorId = option.authorid;
    self.data.pageShow = true;
    rq.get('/api/miniauthor', { authorid: self.data.authorId }, function(res) {      
      self.data.authorInfo = res.data.data;
      self.setData({
        pageShow: self.data.pageShow,
        authorId: self.data.authorId,
        authorInfo:self.data.authorInfo,
      });
      console.log(self.data.authorInfo)
    })
  },
  doFollow:function(){
    var self = this;
    if (self.data.authorInfo.isfollow ==0){
      rq.post('/api/minifollow', { authorid: self.data.authorId},function(res){
        self.data.authorInfo.fansnum += 1;
        self.data.authorInfo.isfollow = 1;
        self.setData({
          authorInfo:self.data.authorInfo
        })
        wx.showToast({
          title: '关注成功',
        })
      });
    }
  }
})