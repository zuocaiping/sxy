// pages/list/list.js
const app = getApp()
var rq = require('../../utils/request.js');
var cm = require('../../utils/common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // tab 切换
    tabArr: {
      curHdIndex: 0,
      curBdIndex: 0
    }, 
    ishide:false,
    index:'',//当前评论数据
    ceshi:''
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
    //console.log(e);
  }, 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this;
    rq.get('/api/miniordercomments', { orderid:options.orderid},
      function (res) {
        console.log(res)
        var waitinglist = res.data.data.waitinglist;//未评价数据
        var commentedlist = res.data.data.commentedlist;//已评价数据
        _this.setData({
          waitinglist: waitinglist,
          commentedlist: commentedlist,
          orderid: options.orderid
        })
        // console.log(waitinglist)
        // console.log(commentedlist)
      })
  },
  hidePack: function () {
    var ishide = false;
    this.setData({
      ishide: ishide
    })
  },
  //评论内容
  bindTextAreaBlur: function (e) {
    this.setData({
      ceshi: e.detail.value
    })
  }, 
  //提交评论
  fun_comment: function () {
    var _this = this;

    

    if (_this.data.ceshi == ''){
      wx.showToast({
        title: '请填写评价内容',
        icon: 'none',
        duration: 4000
      })
    } else{      

      rq.post('/api/miniaddcomment', { orderid: _this.data.orderid, bookid: _this.data.index.bookid, comment: _this.data.ceshi },
        function (res) {
          console.log(res)
        })

      var waitinglist = _this.data.waitinglist;
      var waitinglist_index = waitinglist[_this.data.eq];//未评论内容索引
      waitinglist_index.comment = _this.data.ceshi;
      var commentedlist = _this.data.commentedlist;
      commentedlist.unshift(waitinglist_index);
      var _eq = _this.data.eq;
      waitinglist.splice(_eq, 1);//截取待评价指定元素
      console.log(commentedlist)
      console.log(waitinglist)
     

      _this.setData({
        ishide: false,
        commentedlist: commentedlist,
        waitinglist:waitinglist
      })
    //  console.log(_this.data.commentedlist)
    }
    
  },
  //填写评论按钮
  Fill_comments:function(e){
    console.log(e.target.dataset.index)
    var ishide = true;
    this.setData({
      ishide: ishide,
      index: e.target.dataset.index,
      eq: e.target.dataset.eq
    })
  }
})