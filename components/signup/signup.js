var behavior = require('../../behaviors/behaviors.js')
var app = getApp();
var config = require('../../config.js');
Component({
  behaviors: [behavior],
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    force: {
      type: Boolean,
      value: false,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    page: 1, //
    time: 60,
    mobile: '',
    sendSmsStep: 1, //1 没发 2已发 3 60s完成
  },

  /**
   * 组件的方法列表
   */
  methods: {
    hideModal: function() {
      if (!this.properties.force) {
        this.properties.show = false;
        this.setData({
          show: this.properties.show
        });
      }
    },
    toMoibleLogin: function() {
      this.data.page = 2;
      this.setData({
        page: this.data.page
      });
    },
    inputMobile: function(mobile) {
      this.data.mobile = mobile;
    },
    getSmsCode: function() {
      if (!this.data.mobile) {
        wx.showToast({
          title: '请填写手机号',
          icon: 'none'
        })
      }
    },
    //读秒
    runSecond: function() {
      this.data.time = 60;
      var flag = setInterval(function() {
        this.data.time--;
        if (this.data.time == 0) {
          this.data.sendSmsStep = 3;
          this.setData({
            sendSmsStep: this.data.sendSmsStep,
            time: this.data.time
          });
          clearInterval(flag);
        } else {
          this.setData({
            time: this.data.time
          });
        }
      }, 1000);
    }
  }
})