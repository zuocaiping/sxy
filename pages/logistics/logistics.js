// pages/list/list.js
//获取应用实例
const app = getApp()
var rq = require('../../utils/request.js');
var cm = require('../../utils/common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // _Boolean:true,
    _printing:0, //打印机完成状态
    _transported: 0, //正在运输
    _distribution: 0, //等待配送
    _collect: 0,//已收货
    data:'',
    _state:0
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    var _this = this;
    rq.get('/api/miniordershipping', { orderid: options.orderid },
      function (res) {
        console.log(res)
        var data = res.data.data;
       // data.shippingdata.slice(1, 4);    
        var shippingdata = data.shippingdata.slice(0, 3);   //物流文件列表  
        _this.setData({
          data: data,
          shippingdata: shippingdata
        })
        console.log('物流状态：' + data.shippingstate)
        //1、打印中        0、运输中        5、正在派送        3、待收包裹      
        //  _printing:0, //打印机完成状态
        //  _transported: 0, //正在运输
        //  _distribution: 0, //正在派送
        //  _collect: 0,//已收货
        var _shippingdata = Number(data.shippingstate);
        if (_shippingdata==1){
          _this.setData({
            _printing: 1
          })
        } else if (_shippingdata == 0){
          _this.setData({
            _printing: 2,
            _transported:1
          })
        } else if (_shippingdata == 5) {
          _this.setData({
            _printing: 2,
            _transported: 2,
            _distribution:1
          })
        } else if (_shippingdata == 3) {
          _this.setData({
            _printing: 2,
            _transported: 2,
            _distribution: 2,
            _collect:2
          })
        }
        
      });
  },//复制
  copy:function(){
    var _this = this;
    wx.setClipboardData({
      data: _this.data.data.orderno,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            console.log(res.data) // data
          }
        })
      }
    })
  },
  //查看详情
  details:function(){
    var _this = this;
    _this.setData({
      _state: 1,
    })
  }

})