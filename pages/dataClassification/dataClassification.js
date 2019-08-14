// pages/list/list.js
const app = getApp()
var rq = require('../../utils/request.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this;   
    var categoryid = app.globalData.categoryid;
   // console.log(categoryid)
    rq.get('/api/minitopcategories', {},
      function (res) {
        console.log(res)
        var list = res.data.data.list;
        _this.setData({
          list: list
        })
      });
  }
})