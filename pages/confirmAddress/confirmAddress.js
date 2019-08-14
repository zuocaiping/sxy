
const app = getApp()
var rq = require('../../utils/request.js');
Page({

  data: {
    fromOrder:false,
    isChangeAddr: false,//订单修改地址
    orderId:0,
    addressId: 0,
    showList: false,
    editAddress: {},
    provinceList: [],
    cityList: [],
    districtList: []
  },

  onLoad: function (options) {
    var self = this;
    var setData = {};
    if (options.source==1){
      setData.fromOrder=self.data.fromOrder = true;
      app.globalData.orderPage.data.fromAddr = true;
    }
    if (options.orderid){
      setData.isChangeAddr = self.data.isChangeAddr = true;
      setData.orderId = self.data.orderId = options.orderid;
    }
    rq.get('/api/miniprovinces', {}, function (res) {
      setData.provinceList = self.data.provinceList = res.data.data.list;
      if (options.addressid != undefined) {
        setData.addressId = self.data.addressId = options.addressid;
        self.inItAdress(setData);
      } else {
        self.setData(setData);
      }
    });
  },
  inItAdress: function (setData) {
    var self = this;
    rq.get('/api/minigetaddress', {
      addressid: self.data.addressId
    }, function (res) {
      setData.editAddress = self.data.editAddress = res.data.data;
      //初始化地区列表
      if (self.data.editAddress.cityid == self.data.editAddress.provinceid) {
        for (var i = 0; i < self.data.provinceList.length; i++) {
          if (self.data.editAddress.provinceid == self.data.provinceList[i].areadid) {
            setData.cityList = self.data.cityList = [self.data.provinceList[i]];
            break;
          }
        }
        rq.get('/api/miniareachildren', {
          pid: self.data.editAddress.provinceid
        }, function (res) {
          setData.districtList = self.data.districtList = res.data.data.list;
          self.setData(setData);
        });
      } else {
        rq.get('/api/miniareachildren', {
          pid: self.data.editAddress.provinceid
        }, function (res) {
          setData.cityList = self.data.cityList = res.data.data.list;
          rq.get('/api/miniareachildren', {
            pid: self.data.editAddress.cityid
          }, function (res) {
            setData.districtList = self.data.districtList = res.data.data.list;
            self.setData(setData);
          });
        });
      }
    })
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
  saveAddr: function () {
    var self = this;
    if (self.checkAddress()) {
      if (self.data.isChangeAddr) {
        self.changeOrderAddr();
        return true;
      }
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
        self.data.editAddress.addressid = res.data.data.addressid;
        wx.showToast({
          title: '保存成功'          
        })
        if (self.data.fromOrder){
          app.globalData.orderPage.data.shippingAddr = self.data.editAddress;          
        } 

        wx.navigateBack({          
        })
      }, function (res) {
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      });
    }
  },
  changeOrderAddr:function(){
    var self = this;
    rq.post('/api/miniorderchangeaddr', {
      orderid: self.data.orderId,
      name: self.data.editAddress.name,
      mobile: self.data.editAddress.mobile,
      provinceid: self.data.editAddress.provinceid,
      cityid: self.data.editAddress.cityid,
      districtid: self.data.editAddress.districtid,
      address: self.data.editAddress.address,    
    }, function (res) {      
      wx.showToast({
        title: '保存成功'
      })
      wx.redirectTo({
        url: '/pages/payment/payment?orderid=' + self.data.orderId,
      })
    }, function (res) {
      wx.showToast({
        title: res.data.msg,
        icon: 'none',
        duration:3000
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
})