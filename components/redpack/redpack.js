// components/redpack/redpack.js
var app = getApp();
var rq = require('../../utils/request.js');
Component({
  properties: {
    redstyle: { //红包风格
      type: Number,
      value: 1,
    },
    redId: { //红包类型
      type: Number,
      value: 0,
      observer: 'resetPack'
    },
    itemId: { //红包类型
      type: Number,
      value: 0,
      observer: 'resetPack'
    },
    pages: {
      type: Number,
      value: 0
    },
    ishide: {
      type: Boolean,
      value: false
    },
    canDouble: {
      type: Boolean,
      value: false,
      observer: 'resetPack'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    step: 1,
    isDouble: false //页数是否翻倍
  },


  /**
   * 组件的方法列表
   */
  methods: {
    hidePack: function() {
      this.data.ishide = true;
      this.setData({
        ishide: this.data.ishide
      })
    },
    getPack: function(getType) {
      //type =1,普通领取 type = 2 分享翻倍领取
      var self = this;
      getType = getType || 1;
      rq.post('/api/minigetred', {
        redid: self.properties.redId,
        itemid: self.properties.itemId,
        type: getType
      }, function(res) {
        if (getType == 2) {
          app.globalData.freePages += self.properties.pages * 2;
        } else {
          app.globalData.freePages += self.properties.pages
        }
        if (self.properties.redstyle == 2) {
          self.data.step = 3;
          self.data.isDouble = getType == 2 ? true : false;
          self.setData({
            step: self.data.step,
            isDouble: self.data.isDouble
          })
        } else {
          self.properties.ishide = true;
          self.setData({
            ishide: self.properties.ishide
          })
          wx.showToast({
            title: '领取成功',
          })
        }

        self.triggerEvent('getRedSuccess', {
          pages: self.properties.pages
        });
      }, function() {
        self.properties.ishide = true;
        self.setData({
          ishide: self.data.ishide
        })
        wx.showToast({
          title: '已经领取过红包',
          icon: 'none'
        })
      })
    },
    stopPropagation: function() {
      return false;
    },
    forgiveTake: function() {
      this.data.step = 2;
      this.setData({
        step: this.data.step
      });
    },
    realForgiveTake: function() {
      this.data.step = 1;
      this.data.ishide = true;
      this.setData({
        step: this.data.step,
        ishide: this.data.ishide
      });
    },
    justTake: function() {
      this.getPack();
    },
    shareTake: function() {
      //todo show share
      this.getPack(2);
    },
    backTake: function() {
      this.data.step = 1;
      this.setData({
        step: this.data.step
      });
    },
    resetPack: function(e) {
      this.data.step = 1;
      this.data.isDouble = false;
      this.setData({
        step: this.data.step,
        isDouble: this.data.isDouble
      });
    },
    hideModal:function(){
      this.data.ishide = true;
      this.setData({        
        ishide: this.data.ishide
      });
    }
  }
})