var auth = require('../../utils/auth.js');
var behavior = require('../../behaviors/behaviors.js')
Component({
  behaviors: [behavior],
  properties: {

  },

  data: {
    pageShow: false,
    isReg: false,
    text: true,
    curGuideIndex: 0,
    guidesText: 'hi!欢迎来到小店！\n我是本打印店的老板娘',
    guides: [{
      btntext: '赶紧去看看',
      content: '欢迎来到书小页，本店有市面上找不到的各种精品考试资料：公务员、考研、四六级、教师、财会...。每本都是从几百上千页书浓缩成几十页，帮助你高效备考、快速提分。',
      bgimg: 'http://img.yaotia.com/act/dialogue2.png',
    }],
    arry: [false, false, false],
  },

  /**
   * 组件的方法列表
   */
  attached: function() {
    // var self = this;
    // auth.login(function(userInfo) {
    //   var setData = {};
    //   setData.pageShow = self.data.pageShow = true;
    //   if (userInfo){
    //     setData.isReg = self.data.isReg = true;
    //   }else{
    //     setData.isReg = self.data.isReg = false;
    //   }     
    //   self.setData(setData);
    // }, false);
  },
  methods: {
    endGuide: function() { 
      this.triggerEvent('endGuide');
    }
  },
})