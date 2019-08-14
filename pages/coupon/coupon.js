// pages/list/list.js
var rq = require('../../utils/request.js');
var config = require('../../config.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageShow: false,
    // tab 切换
    tabArr: {
      curHdIndex: 0,
      curBdIndex: 0
    },

    pageShow: false,
    redList: [],
    cardList: [],
    showRed: false,
    curIndex: 0,
    curTask: null,
    cardColor: ['', 'm-green', 'm-red'],
    shareTime: 0,
    redPages: 0
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
  },

  onLoad: function (options) {
    var self = this;
    var setData = {};
    self.data.tabArr.curHdIndex = options.type ? 1 : 0;
    setData.pageShow = self.data.pageShow = true;
    setData.tabArr = self.data.tabArr;
    rq.get('/api/miniredlist', {}, function (res) {
      setData.pageShow = self.data.pageShow = true;
      setData.redList = self.data.redList = res.data.data.list;
      setData.shareTime = self.data.shareTime = res.data.data.time;
      rq.get('/api/miniusercards', {}, function (res) {
        setData.cardList = self.data.cardList = res.data.data.list;
        self.setData(setData);
      });
    })
  },

  getRed: function (e) {
    var self = this;
    var setData = {};
    setData.curIndex = self.data.curIndex = e.currentTarget.dataset.index;
    setData.curTask = self.data.curTask = self.data.redList[self.data.curIndex];
    setData.redPages = self.data.redPages = self.data.redList[self.data.curIndex].freepages;
    if (self.data.curTask.isfinish == 1) {
      setData.showRed = self.data.showRed = true;
      self.setData(setData);
    } else {
      console.log('todo navigateTo');
    }
  },
  getRedSuccess: function (e) {
    var self = this;
    var setData = {};
    self.data.redList.splice(self.data.curIndex, 1);
    setData.redList = self.data.redList;
    self.setData(setData);
  },
  onShareAppMessage: function () {
    var self = this;
    var userInfo = wx.getStorageSync(config.userInfoKey);
    var rData = {
      title: '[有人@我]你的好友领取了' + self.data.redPages + '页资料免费打印福利，快来比比谁抢得多。',
      path: '/pages/share/share?uid=' + userInfo.userid + '&page=' + self.data.redPages + '&time=' + self.data.shareTime
    }
    rq.post('/api/miniaddshare', { url: rData.path });
    return rData;
  },
})