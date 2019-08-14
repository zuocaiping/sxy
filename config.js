module.exports = {
  appId: 1,
  version:'V1.07',
  appKey:'5vrNqqKlo78gfEp8txBWno09xVHs25WA',//appkey
  // apiHost: 'https://dev.booktopaper.com', //测试环境
  apiHost: 'https://beta.booktopaper.com', //正式环境
  // apiHost: 'http://dev.shuxiaoye.com', //周滨开发环境
  isLocal:false,
  userInfoKey:'userInfo',//用户信息缓存键名,
  loginCodeKey:'loginCodeInfo',
  sucStatus:200, //200 成功状态
  failStatus:201,
  authAxcepts :[//不需要检查登录的接口
    '/api/minilogin',
    '/api/minismscode',
    '/api/miniregbysms',
    '/api/minihome',
    '/api/minilist',
    '/api/minitopcategories',
    '/api/minibookinfo',
    '/api/minicollectlist',
    '/api/minisearch',
    '/api/minihotsearch',
    '/api/minisearchhint',
    '/api/miniauthor',
    '/api/miniordershipping',
    '/api/miniordercomments'
  ]
}