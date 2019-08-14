//index.js
//获取应用实例
const app = getApp()
var rq = require('../../utils/request.js');
var cm = require('../../utils/common.js');
Page({
  data: {
    mode: 'aspectFit',
  },
  onLoad: function (options) {
    var _this = this;
    rq.get('/api/minirandbooks', {},
      function (res) {
        console.log(res)
        var data = res.data.data;
        _this.setData({
          data: data
        })
      })
  }
})