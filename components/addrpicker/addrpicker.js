// components/addrpicker/addrpicker.js
var rq = require('../../utils/request.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    addrid: {
      type: Number
    },
    ispick: {
      type: Boolean,
      value: true
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    showList: true,
    curIndex: 0, //当前选中了第几个
    editAddress: {},
    editIndex: -1,
    addrList: [],
    provinceList: [],
    cityList: [],
    districtList: []
  },
  attached: function () {
    var self = this;
    rq.get('/api/miniuseraddress', {}, function (res) {
      self.data.addrList = res.data.data.list;
      if (self.properties.ispick && self.data.addrList.length == 0) {
        self.data.showList = false;
      }
      self.setData({
        showList:self.data.showList,
        addrList: self.data.addrList
      });
    });
    rq.get('/api/miniprovinces', {}, function (res) {
      self.data.provinceList = res.data.data.list;
      self.setData({
        provinceList: self.data.provinceList
      });
    });
  },
  /**
   * 组件的方法列表
   */
  methods: {
    pickAddr: function (e) {
      var self = this;
      self.properties.addrid = e.currentTarget.dataset.addrid;
      self.data.curIndex = e.currentTarget.dataset.index;
      self.setData({
        curIndex: self.data.curIndex,
        addrid: self.properties.addrid
      });
      self.triggerEvent('pickAddr', self.data.addrList[self.data.curIndex]);
    },

    showEdit: function (e) {
      var self = this;
      self.data.showList = false;
      if (e.currentTarget.dataset.index == undefined) {
        self.data.editAddress = {};
        self.data.editIndex = -1;
        self.setData({
          showList: self.data.showList,
          editAddress: self.data.editAddress
        });
      } else {
        var editIndex = e.currentTarget.dataset.index;
        self.data.editIndex = editIndex;
        self.data.editAddress = self.data.addrList[editIndex];
        //初始化地区列表
        if (self.data.editAddress.cityid == self.data.editAddress.provinceid) {
          for (var i = 0; i < self.data.provinceList.length; i++) {
            if (self.data.editAddress.provinceid == self.data.provinceList[i].areadid) {
              self.data.cityList = [self.data.provinceList[i]];
              break;
            }
          }
          rq.get('/api/miniareachildren', {
            pid: self.data.editAddress.provinceid
          }, function (res) {
            self.data.districtList = res.data.data.list;
            self.setData({
              showList: self.data.showList,
              editAddress: self.data.editAddress,
              cityList: self.data.cityList,
              districtList: self.data.districtList,
            });
          });
        } else {
          rq.get('/api/miniareachildren', {
            pid: self.data.editAddress.provinceid
          }, function (res) {
            self.data.cityList = res.data.data.list;
            rq.get('/api/miniareachildren', {
              pid: self.data.editAddress.cityid
            }, function (res) {
              self.data.districtList = res.data.data.list;
              self.setData({
                showList: self.data.showList,
                editAddress: self.data.editAddress,
                cityList: self.data.cityList,
                districtList: self.data.districtList,
              });
            });
          });

        }
      }
    },

    hideEdit: function (e) {
      var self = this;
      self.data.editIndex = -1;
      self.data.showList = true;
      self.setData({
        showList: self.data.showList,
      });
    },

    pickProvince: function (e) {
      var self = this;
      var provinceIndex = e.detail.value;
      var pickeredArea = self.data.provinceList[provinceIndex];
      var provinceId = pickeredArea.areadid;
      var provinceName = pickeredArea.name;


      if (self.data.editAddress.provinceid == pickeredArea.areadid) {
        return false;
      }
      self.data.editAddress.district = '';
      self.data.editAddress.districtid = 0;
      self.data.editAddress.city = '';
      self.data.editAddress.cityid = 0;


      self.data.editAddress.province = provinceName;
      self.data.editAddress.provinceid = provinceId;

      if (pickeredArea.type == 2) { //省份和城市一样
        self.data.editAddress.province = '';
        self.data.editAddress.city = provinceName;
        self.data.editAddress.cityid = provinceId;
        self.data.cityList = [pickeredArea];
      }

      rq.get('/api/miniareachildren', {
        pid: provinceId
      }, function (res) {
        if (pickeredArea.type == 2) {
          self.data.districtList = res.data.data.list;
        } else {
          self.data.districtList = [];
          self.data.cityList = res.data.data.list;
        }
        self.setData({
          editAddress: self.data.editAddress,
          cityList: self.data.cityList,
          districtList: self.data.districtList
        });
      });
    },
    pickCity: function (e) {
      var self = this;
      var cityIndex = e.detail.value;
      var pickeredArea = self.data.cityList[cityIndex];
      var cityId = pickeredArea.areadid;
      if (pickeredArea.areadid == self.data.editAddress.cityid) {
        return false;
      } else {
        self.data.editAddress.cityid = cityId;
        self.data.editAddress.city = pickeredArea.name;
        self.data.editAddress.districtid = 0;
        self.data.editAddress.district = '';
        rq.get('/api/miniareachildren', {
          pid: cityId
        }, function (res) {
          self.data.districtList = res.data.data.list;
          self.setData({
            editAddress: self.data.editAddress,
            districtList: self.data.districtList
          });
        });
      }
    },
    pickDistrict: function (e) {
      var self = this;
      var districtIndex = e.detail.value;
      var pickeredArea = self.data.districtList[districtIndex];

      if (pickeredArea.areadid == self.data.editAddress.districtid) {
        return false;
      } else {
        self.data.editAddress.districtid = pickeredArea.areadid;
        self.data.editAddress.district = pickeredArea.name;
        self.setData({
          editAddress: self.data.editAddress
        });
      }
    },
    inputName: function (e) {
      this.data.editAddress.name = e.detail.value;
    },
    inputMobile: function (e) {
      this.data.editAddress.mobile = e.detail.value;
    },
    inputAddress: function (e) {
      this.data.editAddress.address = e.detail.value;
    },
    changeDefault: function (e) {
      this.data.editAddress.isdefault = e.detail.value ? 1 : 0
    },
    setDefault: function (e) {
      var self = this;      
      var setIndex = e.currentTarget.dataset.index;
      var setAddressId = self.data.addrList[setIndex].addressid;
      rq.post('/api/minisetdefaultaddr', { addressid: setAddressId }, function (res) {
        for (var i = 0; i < self.data.addrList.length; i++) {
          if (i == setIndex) {
            self.data.addrList[i].isdefault = 1;
          } else {
            self.data.addrList[i].isdefault = 0;
          }
        }
        console.log(self.data.addrList);
        self.setData({
          addrList: self.data.addrList
        });
      });
    },
    saveAddr: function () {
      var self = this;
      if (self.checkAddress()) {
        //保存地址
        var addrIsDefaut = self.data.editAddress.isdefault;
        rq.post('/api/minisaveaddress', {
          addressid: self.data.editAddress.addressid ? self.data.editAddress.addressid : 0,
          name: self.data.editAddress.name,
          mobile: self.data.editAddress.mobile,
          provinceid: self.data.editAddress.provinceid,
          cityid: self.data.editAddress.cityid,
          districtid: self.data.editAddress.districtid,
          address: self.data.editAddress.address,
          isdefault: self.data.editAddress.isdefault ? 1 : 0
        }, function (res) {
          if (addrIsDefaut) {
            for (var i = 0; i < self.data.addrList.length; i++) {
              self.data.addrList[i].isdefault = 0;
            }
          }
          if (self.data.editAddress.addressid) {
            self.data.editAddress.addressid = res.data.data.addressid;
            self.data.addrList[self.data.editIndex] = self.data.editAddress;
            self.data.addrList[self.data.editIndex]['isdefault'] = addrIsDefaut ? 1 : 0;
          } else {
            self.data.editAddress.addressid = res.data.data.addressid;
            self.data.addrList.unshift(self.data.editAddress);
          }
          self.data.showList = true;
          self.setData({
            showList: self.data.showList,
            addrList: self.data.addrList
          })
        }, function (res) {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        });
      }
    },

    removeAddr: function (e) {
      var self = this;
      var rmIndex = e.currentTarget.dataset.index;
      var rmAddr = self.data.addrList[rmIndex];
      rq.post('/api/miniremoveaddress', {
        addressid: rmAddr.addressid
      }, function (res) {
        self.data.addrList.splice(rmIndex, 1);
        wx.showToast({
          title: '删除成功',
        })
        self.setData({
          addrList: self.data.addrList
        })
      });
    },

    checkAddress: function () {
      var self = this;
      if (!self.data.editAddress.name) {
        wx.showToast({
          title: '请输入姓名',
          icon: 'none'
        })
        return false;
      }
      if (!self.data.editAddress.mobile) {
        wx.showToast({
          title: '请输入手机号',
          icon: 'none'
        })
        return false;
      }
      if (!self.data.editAddress.provinceid) {
        wx.showToast({
          title: '请选择省份',
          icon: 'none'
        })
        return false;
      }
      if (!self.data.editAddress.cityid) {
        wx.showToast({
          title: '请选择城市',
          icon: 'none'
        })
        return false;
      }
      if (!self.data.editAddress.districtid) {
        wx.showToast({
          title: '请选择区县',
          icon: 'none'
        })
        return false;
      }
      if (!self.data.editAddress.address) {
        wx.showToast({
          title: '请输入街道地址',
          icon: 'none'
        })
        return false;
      }
      return true;
    }

  }
})