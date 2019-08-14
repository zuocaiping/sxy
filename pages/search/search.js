//index.js
//获取应用实例
const app = getApp()
var rq = require('../../utils/request.js');
var hp = require('../../utils/helper.js');
Page({
  data: {
    pageShow: false,
    showMask: false,
    showCancel: false,
    showResult: false,
    historicalSearch: [],//历史搜索
    voteTitle: '',
    dataPrompt: {},//搜索提示信息
    offset: 0,
    limit: 20,
    dataList: '',//搜索数据
    hotData: '',//热门数据
    numData: 0,
    inputFocus:false
  },
  onLoad: function (options) {
    var _this = this;
    var historyKeys = wx.getStorageSync('searchHistory');
    if (historyKeys) {
      _this.data.historicalSearch = historyKeys;
    }
    _this.data.pageShow = true;
    rq.get('/api/minihotsearch', {},
      function (res) {
        _this.setData({
          historicalSearch: _this.data.historicalSearch,
          hotData: res.data.data,
          pageShow: _this.data.pageShow
        })
      });
  },
  //搜索信息
  searchInfo: function (keyword) {
    var _this = this;
    keyword = keyword.trim();
    if (keyword != '') {
      rq.get('/api/minisearchhint', { keyword: keyword },
        function (res) {
          _this.data.dataPrompt = res.data.data;
          _this.data.voteTitle = keyword;
          _this.data.showMask = true;
          _this.setData({
            voteTitle: _this.data.voteTitle,
            dataPrompt: _this.data.dataPrompt,
            showMask: _this.data.showMask
          })
        });
    } else {
      _this.data.dataPrompt.list = [];
      _this.data.voteTitle = '';
      console.log(_this.data);
      _this.setData({
        voteTitle: _this.data.voteTitle,
        dataPrompt: _this.data.dataPrompt,
      })
    }

  },
  //搜索数据结果
  searchData: function (e) {
    
    var _this = this;
    var keyword = '';
    if (e.type == 'confirm') {
      var keyword = e.detail.value;
    } else {
      keyword = e.target.dataset.productid;
    }
    if (!keyword) {
      return false;
    }

    if (!hp.inArray(keyword, _this.data.historicalSearch)) {
      if (_this.data.historicalSearch.length < 5) {
        _this.data.historicalSearch.unshift(keyword);
      } else {
        _this.data.historicalSearch.splice(4, 1);//删除最后的
        _this.data.historicalSearch.unshift(keyword);
      }
      wx.setStorageSync('searchHistory', _this.data.historicalSearch);
    }
    _this.data.voteTitle = keyword;
    _this.data.showMask = false;
    _this.data.showResult = true;
    _this.data.dataPrompt.list = [];
    rq.get('/api/minisearch', { offset: _this.data.offset, limit: _this.data.limit, keyword: keyword },
      function (res) {
        _this.setData({
          dataList: res.data.data,
          voteTitle: _this.data.voteTitle,
          showResult: _this.data.showResult,
          showMask: _this.data.showMask,
          dataPrompt: _this.data.dataPrompt,
          historicalSearch: _this.data.historicalSearch
        })
      });
  },
  //搜索框输入内容
  funSearch: function (e) {
    var voteTitle = e.detail.value;
    this.searchInfo(voteTitle)
  },
  //清除
  funDel: function () {
    this.data.voteTitle = '';
    this.data.dataPrompt.list = [];
    this.data.inputFocus=true;
    this.setData({
      voteTitle: this.data.voteTitle,
      dataPrompt: this.data.dataPrompt.list,
      inputFocus: this.data.inputFocus
    })

  },
  //历史搜索清除
  eliminate: function (e) {
    var delIndex = e.currentTarget.dataset.index;
    this.data.historicalSearch.splice(delIndex, 1);
    wx.setStorageSync('searchHistory', this.data.historicalSearch)
    this.setData({
      historicalSearch: this.data.historicalSearch
    })
  },
  cancelSearch: function () {
    this.data.showMask = false;
    this.data.showResult = false;
    this.data.dataList = [];
    this.data.voteTitle = '';
    this.data.dataPrompt.list = [];
    this.setData({
      showMask: this.data.showMask,
      dataList: this.data.dataList,
      voteTitle: this.data.voteTitle,
      dataPrompt: this.data.dataPrompt,
      showResult: this.data.showResult
    });
  }

})