//Vue.prototype.$http = axios;
var Utils = {
  // 毫秒转换成天（结果向上取整）
  msToDays: function (ms) {
    var DAY_HAS_MS = 1000 * 60 * 60 * 24;
    return Math.ceil(ms / DAY_HAS_MS);
  },
  // 获取当月的最后一天的日期
  getEndDateOfMonth: function () {
    var d = new Date();
    var monthEndDate = new Date(d.getFullYear(), (d.getMonth() + 1), 0);
    var year = monthEndDate.getFullYear();
    var month = monthEndDate.getMonth() + 1;
    var day = monthEndDate.getDate();
    return (year + '年' + month + '月' + day + '日');
  },
  getFormData: function (object) {
    var formData = new URLSearchParams();
    for (var key in object) {
      formData.append(key, object[key]);
    }
    return formData;
  },
  ajax: function (options) {
    options = options || {};
    options.type = (options.type || "GET").toUpperCase();
    options.dataType = options.dataType || "json";
    var params = formatParams(options.data);
    var xhr = new XMLHttpRequest();
    //接收 - 第三步
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        var status = xhr.status;
        if (status >= 200 && status < 300) {
          options.success && options.success(JSON.parse(xhr.responseText), xhr.responseXML);
        } else {
          options.fail && options.fail(status);
        }
      }
    };

    //连接 和 发送 - 第二步
    if (options.type == "GET") {
      xhr.open("GET", options.url + "?" + params, true);
      xhr.send(null);
    } else if (options.type == "POST") {
      xhr.open("POST", options.url, true);
      //设置表单提交时的内容类型
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.send(params);
    }

    function formatParams(data) {
      var arr = [];
      for (var name in data) {
        arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
      }
      arr.push(("noCache=" + Math.random()).replace(".", ""));
      return arr.join("&");
    }
  }
};

var ua = navigator.userAgent.toLocaleLowerCase();
var version = ua.match(/ecloud\/(\d+\.\d+\.\d+\.\d+)/) || ua.match(/ecloud\/(\d+\.\d+\.\d+)/) || ua.match(/ecloud\/(\d+\.\d+)/);
var config = {
  domain: 'https://m.cloud.189.cn/',
  // domain: '//api/',
  url: {
    getLoginedInfos: 'v2/getLoginedInfos.action', //获取用户信息
    listPackages: 'vip/listPackages.action', //获取列表信息(铂金)
    listPackages1: 'vip/listPackages1.action', //获取列表信息(黄金)
    // 模拟本地
    getAPIPayInfo: 'vip/getAPIPayInfoLocal.action', //获取支付信息
    createOrder: 'vip/createOrderLocal.action',
    successReturn: 'vipOrderSuccess.action',
  },
  client: {
    isAndroid: /android/i.test(ua),
    isIOS: /(iphone|ipad|ipod|ios)/i.test(ua),
    isEcloud: /ecloud/i.test(ua),
    appVersion: version ? version[1] : '',
    payVersion: {
      ios: "5.0.0",
      andriod: "5.0.1"
    }
  }
};

var app = new Vue({
  el: '#app',
  data: {
    user: {
      nickname: '',
      account: '',
      avatar: '/source/images/account-profile.png',
      vip: {
        level: 0
      },
      superEndTime: null,
      leftTimeMs: null,
      orderChannel: null,
      orderStatus: null,
      info: ''
    },
    listSkeleton:[1,1,1,1],
    right: true,
    payMethod: "EPAYACC",
    listPackages: [{
        time: 12,
        integral: 6000,
        discount: 148,
        price: 198,
        originPrice: {
          money: "",
          show: false
        },
        choosePackage: true
      },
      {
        time: 6,
        integral: 100,
        discount: 78,
        price: 78,
        originPrice: {
          money: "",
          show: false
        },
        choosePackage: false
      },
      {
        time: 3,
        integral: 100,
        discount: 48,
        price: 48,
        originPrice: {
          money: "",
          show: false
        },
        choosePackage: false
      },
      {
        time: 1,
        integral: 100,
        discount: 19,
        price: 19,
        originPrice: {
          money: "",
          show: false
        },
        choosePackage: false
      },
    ],
    listPackages1: [{
        "channelId": "IOS_TEST",
        "channelName": "IOS渠道_TEST",
        "contractId": "8136111102",
        "discount": 11800,
        "price": 11700,
        "productId": "com.21cn.cloud189.248day",
        "saleType": 4,
        "time": 8
      },
      {
        "channelId": "IOS_TEST",
        "channelName": "IOS渠道-TEST",
        "contractId": "9136111008",
        "discount": 6000,
        "price": 6000,
        "productId": "com.21cn.cloud189.124day",
        "saleType": 4,
        "time": 4
      },
      {
        "channelId": "IOS_TEST",
        "channelName": "IOS渠道-TEST",
        "contractId": "9136111007",
        "discount": 23300,
        "price": 23300,
        "productId": "com.21cn.cloud189.527day",
        "saleType": 4,
        "time": 17
      },
      {
        "channelId": "IOS_TEST",
        "channelName": "IOS渠道-TEST",
        "contractId": "9136111006",
        "discount": 23800,
        "price": 23800,
        "productId": "com.21cn.cloud189.372day",
        "saleType": 1,
        "time": 12
      },
    ],
    classGroup: {
      icon: "icon",
      iconUp: "icon-up",
      iconVipInfo: "icon-vip-info",
      iconVipInfoDown: "icon-vip-info-down"
    },
    flag: {
      init: false,
      showExplain: false,
      mask: false,
      actionSheet: false,
      actionSheetAnimating: false,
      popup: false,
      changeIcon: false,
      isAjaxing: false,
      chooseGold: false, //选择黄金会员福袋
      showVipInfoIcon: false, //vipInfo的折叠图标显示
      changeVipInfoIcon: false, //vipInfo的折叠图标切换
      clickPackage: false, //是否点击套餐
      changeState: false //是否切换套餐
    },
    currentPackage: { //当前选择的套餐
      contractId: '',
      realMoney: '',
      productId: '',
      originPrice: {
        money: '',
        show: false
      },
    }
  },

  created: function () {
    this.getLoginedInfos(this.handleVipInfo);
    this.getPackagesList();
    this.listPackages1 = this.processPackageList(this.listPackages1);
  },
  methods: {
    // 获取套餐列表
    getPackagesList: function () {
      var _this = this;
      Utils.ajax({
        // url: config.domain + config.url.listPackages,
        url: 'data/listPackages.json',
        type: "GET",
        dataType: "json",
        data: {
          channelId: config.client.isAndroid ? 'WEBSITE' : 'IOS'
        },
        success: function (d) {
          _this.listPackages = _this.processPackageList(d);
          setTimeout(function () {
            _this.flag.init = true;
          }, 50);
        },
        fail: function (status) {
          // 此处放失败后执行的代码
        }
      });
    },

    // 处理套餐列表，供页面渲染
    processPackageList: function (array) {
      var _arrayBuffer = []
      for (var i = 0, len = array.length; i < len; i++) {
        var item = {}
        var _item = array[i]
        item.choosePackage = false;
        item.time = _item.time < 12 ? _item.time + '个月' : '1年';
        item.productId = _item.productId;
        item.realPrice = _item.discount / 100
        item.originPrice = {
          show: _item.discount !== _item.price,
          money: _item.price / 100 + '元'
        }
        item.contractId = _item.contractId
        item.discount = _item.discount

        if (_item.time !== 1) {
          item.explain = '平均每月' + parseFloat((item.realPrice / _item.time).toFixed(1)) + '元'
        }

        if (_item.saleType === 3) {
          item.explain = '首次充值：享受更低价的优惠'
        }
        _arrayBuffer.push(item)
      }
      _arrayBuffer[0].choosePackage = true;
      return _arrayBuffer
    },
    // 获取登陆后的用户信息
    getLoginedInfos: function (func) {
      var _this = this;
      Utils.ajax({
        // url: config.domain + config.url.getLoginedInfos,
        url: 'data/getLoginedInfos.json',
        type: "GET",
        dataType: "json",
        success: function (d) {
          _this.user.nickname = !!d.nickname ? d.nickname : d.userAccount;
          _this.user.avatar = !!d.icon ? d.icon : config.domain + config.defaultAvatar;
          _this.user.account = d.userAccount;
          if (d.superVip) {
            _this.user.vip.level = d.superVip;
          }
          _this.user.superEndTime = d.superEndTime;
          _this.user.leftTimeMs = d.leftTimeMs;
          _this.user.orderChannel = d.orderChannel;
          _this.user.orderStatus = d.orderStatus;
          func && func();
          _this.user.info = _this.handleVipInfo();
        },
        fail: function (status) {
          // 此处放失败后执行的代码
        }
      });
    },

    //处理头部会员的vipInfo问题
    handleVipInfo: function () {
      var info = this.getVipInfo();
      // var info="qweqdqdsa";
      info = info.split('<br>');
      this.flag.showVipInfoIcon = info.length > 1 ? true : false;
      return info;
    },

    // 头部会员信息
    getVipInfo: function () {
      var user = this.user;
      var vipDesc = '';
      // 会员
      if (user.vip.level === 100 || user.vip.level === 200) {
        if (typeof user.superEndTime === 'string') {
          user.superEndTime = user.superEndTime.replace(/-/g, '/');
        }
        if (typeof user.leftTimeMs !== 'number') {
          user.leftTimeMs = '';
        }
        // 纯互联网渠道
        if (user.orderChannel !== 'CRM') {
          var tempEndTime = new Date(user.superEndTime);
          vipDesc = this.vipName + "会员有效期：" + tempEndTime.getFullYear() + "年" + (tempEndTime.getMonth() + 1) + "月" + tempEndTime.getDate() + "日到期";
        }

        // 电信渠道
        else {
          // 纯电信
          vipDesc = '电信' + this.vipName + '套餐生效中';
          // 混合用户
          if (user.leftTimeMs) {
            vipDesc = '电信' + this.vipName + '套餐生效中<br>线上充值黄金会员有效期剩余' + Utils.msToDays(user.leftTimeMs) + '天';
          }
          // 退订电信渠道
          if (user.orderStatus === 7) {
            // 退订显示到月底到期（读接口 superEndTime 字段即可）
            var tempEndTime = new Date(user.superEndTime);
            var endDateOfMonth = tempEndTime.getFullYear() + "年" + (tempEndTime.getMonth() + 1) + "月" + tempEndTime.getDate() + "日";
            vipDesc = '电信' + this.vipName + '套餐' + endDateOfMonth + '到期';
            if (user.leftTimeMs) {
              vipDesc = '电信' + this.vipName + '套餐' + endDateOfMonth + '到期<br>线上充值黄金会员有效期剩余' + Utils.msToDays(user.leftTimeMs) + '天';
            }
          }
        }
        return vipDesc;
      }
      // 非会员
      else {
        return '开通会员享4T空间、极速传输等特权';
      }
    },
    //切换vip类型,铂金类型和黄金类型
    changeTab: function (type) {
      this.changeState = true;
      // this.clearPackage(this.listPackages);
      // this.clearPackage(this.listPackages1);
      //切换的时候清空点击状态
      // this.clickPackage = false;
      if (type === 1) {
        this.flag.chooseGold = true;
        // this.listPackages1[0]["choosePackage"] = true;
      }
      if (type === 0) {
        this.flag.chooseGold = false;
        // this.listPackages[0]["choosePackage"] = true;
      }
    },
    //选择对应的支付方式
    selectPayMethod: function (msg) {
      this.payMethod = msg;
    },

    //点击 mask 层，关闭支付页
    handleMaskClick: function () {
      var _this = this;
      _this.flag.hasShowPopup = false;
      _this.flag.mask = false;
      _this.flag.showExplain = false;
      _this.flag.popup = false;
      _this.flag.privilegeAnimation = false;
      _this.flag.actionSheet = false;
    },
    //选择套餐时
    choosePackage: function (index) {
      var _this = this;
      this.clickPackage = true;
      var current = _this.flag.chooseGold ? _this.listPackages1 : _this.listPackages;
      _this.clearPackage(current);
      current[index]["choosePackage"] = true;
      _this.currentPackage.contractId = current[index].contractId;
      _this.currentPackage.realMoney = current[index].realPrice;
      _this.currentPackage.productId = current[index].productId;
      _this.currentPackage.originPrice = current[index].originPrice;

    },

    //清掉套餐选项
    clearPackage: function (lists) {
      var len = lists.length;
      for (var i = 0; i < len; i++) {
        lists[i]["choosePackage"] = false;
      }
    },
    //立即订购
    orderPackage: function () {
      console.log(1112,config.client.isAndroid);
      console.log(this.flag.actionSheet);

      var _this = this;
      var current = _this.flag.chooseGold ? _this.listPackages1 : _this.listPackages;
      if (!_this.clickPackage) { //没点击过套餐时，默认选择第一项
        _this.currentPackage.contractId = current[0].contractId;
        _this.currentPackage.realMoney = current[0].realPrice;
        _this.currentPackage.productId = current[0].productId;
        _this.currentPackage.originPrice = current[0].originPrice;
      } else { //找到当前点击套餐
        var currentItem;
        for (var item in current) {
          if (current[item].choosePackage === true) {
            currentItem = current[item];
          }
        }
        _this.currentPackage.contractId = currentItem.contractId;
        _this.currentPackage.realMoney = currentItem.realPrice;
        _this.currentPackage.productId = currentItem.productId;
        _this.currentPackage.originPrice = currentItem.originPrice;
      }
      if (config.client.isAndroid) { //安卓，调起支付弹窗
        _this.flag.mask = true;
        setTimeout(function () {
          _this.flag.actionSheet = true;
        }, 50);
      } else if (config.client.isIOS) {
        _this.payAction('APPLEPAY');
      }
      console.log(_this.flag.actionSheet);
    },
    // 支付前处理
    dealPay: function () {
      var _this = this;
      if (_this.payMethod == "EPAYACC") {
        _this.payAction('EPAYACC');
      } else if (_this.payMethod == "ALIPAY") {
        _this.payAction('ALIPAY');
      }
    },
    payAction: function (payMethod) {
      var _this = this;
      if (_this.flag.isAjaxing === true) return;
      _this.flag.isAjaxing = true;
      switch (payMethod) {
        case 'ALIPAY':
          _this.payByAlipay();
          break;
        case 'APPLEPAY':
          _this.payByApplePay();
          break;
        case 'EPAYACC':
          _this.payByBestPay();
          break;
      }
    },
    // 支付宝
    payByAlipay: function () {
      var _this = this;
      _this.signOrder(function (signParam) {
        var clientObj = {
          cmd: "payForProduct",
          params: {
            contractId: _this.currentPackage.contractId,
            realPayMoney: _this.currentPackage.realMoney,
            payType: _this.payType,
            payModeId: _this.payModeId,
            bankId: _this.payModeId,
            remarks: signParam,
            param: signParam
          }
        };
        // 客户端调接口
        // window.nativeActionObject.runClientAction(JSON.stringify(clientObj));
        _this.flag.isAjaxing = false;
      });
    },
    // Apple Pay
    payByApplePay: function () {
      var _this = this;
      var clientObj = {
        cmd: "payForProduct",
        params: {
          productID: _this.currentPackage.productId
        }
      };
      //调客户端接口
      // window.nativeActionObject.runClientAction(JSON.stringify(clientObj));
      _this.flag.isAjaxing = false;
    },
    // 翼支付
    payByBestPay: function () {
      var _this = this;
      _this.signOrder(function (signParam) {
        Utils.ajax({
          url: config.domain + config.url.createOrder,
          type: "POST",
          dataType: "json",
          data: {
            param: signParam,
            clientType: 2,
            returnUrl: config.domain + config.url.successReturn,
            noCache: Math.random()
          },
          success: function (d) {
            _this.flag.isAjaxing = false;
            // if (d.errorCode) {
            // } else {
            //   if (d.url) {
            //     window.location.href = d.url;
            //   }
            // }
          },
          fail: function (status) {
            // 此处放失败后执行的代码
          }
        });
      });
    },
    // 订单签名
    signOrder: function (callback) {
      var _this = this;
      Utils.ajax({
        url: config.domain + config.url.getAPIPayInfo,
        type: "POST",
        dataType: "json",
        data: {
          // contractId: 3141711001,
          // realPayMoney: 16300, // _this.currentPackage.realMoney,
          // returnUrl: config.domain + config.url.successReturn,
          // payType: 2, //_this.payType(),
          // payModeId: 6, //_this.payModeId(),
          // bankId: "EPAYACC", //_this.payMethod,
          // noCache: Math.random()
          contractId: _this.currentPackage.contractId,
          realPayMoney: _this.currentPackage.realMoney,
          returnUrl: config.domain + config.url.successReturn,
          payType: _this.payType,
          payModeId: _this.payModeId,
          bankId: _this.payMethod,
          noCache: Math.random()
        },
        success: function (d) {
          if (d.errorCode) {} else {
            // 接口返回签名后的回调函数
            callback(d.param);
          }
        },
        fail: function (status) {
          // 此处放失败后执行的代码
        }
      });
    }
  },
  computed: {
    vipName: function () {
      var level = this.user.vip.level;
      // 会员类型：100 - 黄金会员、200 - 铂金会员
      if (level === 100) {
        return '黄金';
      }
      if (level === 200) {
        return '铂金';
      } else {
        return '';
      }
    },

    /* 当前选中套餐价格 */
    totalMoney: function () {
      if (this.selectedPackage !== null) {
        return this.packageData[this.selectedPackage].realPrice;
      } else {
        return '0';
      }
    },
    discount: function () {
      if (this.selectedPackage !== null) {
        return '已' + this.packageData[this.selectedPackage].explain2;
      } else {
        return '已省0元';
      }
    },
    isShowDiscount: function () {
      if (this.packageData[this.selectedPackage]) {
        if (this.packageData[this.selectedPackage].isSelectYiYuan) {
          return true;
        } else {
          return false;
        }
      }
    },
    payType: function () {
      // 会员类型：100 - 黄金会员、200 - 铂金会员
      // payType: 订购类型 1-免费订购 2-付费订购 3-续期订购 4-扩容订购
      return this.user.vip.level ? 3 : 2;
    },
    payModeId: function () {
      if (this.payMethod === 'ALIPAY') {
        return 7;
      } else if (this.payMethod === 'EPAYACC') {
        return 6;
      }
    },
    payStatus: function () {
      if (this.user.orderChannel === 'CRM') {
        return false;
      } else {
        return true;
      }
    }
  }
})
