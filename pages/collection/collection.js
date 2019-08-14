// pages/list/list.js
const app = getApp()
var rq = require('../../utils/request.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageShow: false,
    categories: [], //tab切换数据
    currentTab: -1,
    bookList: [], //产品列表 
    offset: 0,
    limit: 20,
    hasMore: true,
    categoryid: 0,
    scrollTop: 100,
    loading:false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var self = this;
    self.data.categoryid = 0;
    var setData = {};    
    setData.pageShow = self.data.pageShow = true;
    setData.categoryid = self.data.categoryid;
    self.getList(setData);

  },
  //tab切换
  tab: function(e) {
    var self = this;
    var setData = {};
    setData.categoryid = self.data.categoryid = e.currentTarget.dataset.categoryid;
    setData.currentTab = self.data.currentTab = e.currentTarget.dataset.idx;
    setData.hasMore = self.data.hasMore = true;
    self.data.bookList = [];
    self.data.offset = 0;
    if (self.data.currentTab == undefined) {
      setData.currentTab = self.data.currentTab = -1;
      setData.categoryid = self.data.categoryid = 0;
    }
    self.getList(setData);
  },

  jumpUrl: function(e) {
    var bookId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/details/details?bookid=' + bookId,
    })
  },

  removeCollect: function(e) {
    var self = this;
    var rmIndex = e.currentTarget.dataset.index;
    var bookId = self.data.bookList[rmIndex].bookid;
    rq.post('/api/minicancelcollect', {
      bookid: bookId
    }, function(res) {
      self.data.bookList.splice(rmIndex, 1);
      self.setData({
        bookList: self.data.bookList
      });
    })
  },

  onReachBottom: function() {
    var self = this;
    if (self.data.hasMore) {
      this.getList();
    }
  },

  getList: function(toSetData) {
    var self = this;
    toSetData = toSetData || {};
    rq.get('/api/minicollectlist', {
        categoryid: self.data.categoryid,
        offset: self.data.offset,
        limit: self.data.limit
      },
      function(res) {
        toSetData.categories = self.data.categories = res.data.data.categories;
        self.data.bookList = self.data.bookList.concat(res.data.data.list);
        if (res.data.data.list.length < self.data.limit) {
          toSetData.hasMore = self.data.hasMore = false;
        }
        toSetData.offset = self.data.offset = self.data.offset + self.data.limit;
        toSetData.bookList = self.data.bookList;
        console.log(toSetData);
        self.setData(toSetData)
      });
  },
  //标题横向滚动
  tapMove: function (e) {
    this.setData({
      scrollTop: this.data.scrollTop + 10
    })
  }
})