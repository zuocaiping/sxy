var fakedAreaIds = [460500, 441901, 442001, 620201, 421401, 411801, 421405, 620205, 650606, 421513, 442008, 441906, 421704];

module.exports = {
  inArray: function(item, Arr) {
    if (Arr instanceof Array) {
      for (var i = 0; i < Arr.length; i++) {
        if (Arr[i] == item) {
          return true;
        }
      }
      return false;
    } else {
      console.log('inArray arg[1] must be Array');
    }
  },
  moneyToYuan: function(num) {
    return (num / 100).toFixed(2);
  },
  formatAddr: function(addrObj) {
    var str = '';
    str += addrObj.province;
    if (addrObj.cityid != addrObj.provinceid && !this.inArray(addrObj.cityid, fakedAreaIds)) {
      str += addrObj.city;
    }
    if (!this.inArray(addrObj.districtid, fakedAreaIds)) {
      str += addrObj.district;
    }
    str += addrObj.address
    return str;
  }
}