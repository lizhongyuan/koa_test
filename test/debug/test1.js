

let getData = (paraPathname, paraRoutes) => {
  // let result = [];
  let result;
  
  matchParamsPath(paraPathname, paraRoutes);
  
  return result;

  function matchParamsPath(pathname, routes) {

    routes.forEach((item) => {
      if(item.routes && item.routes.length > 0) {
        matchParamsPath(pathname, item.routes)
      } else {
        if(item.path === pathname) {
          // result.push(item);
          result = item;
        }
      }
    });

  }
  
  return result;
};


const testRoutes = [
  {
    path: '/dashboard',
    name: '首页'
  },
  {
    path: '/form',
    name: '表单',
    routes: [
      {
        path: '/form/base',
        name: '基础'
      },
      {
        path: '/form/group',
        name: '组合'
      }
    ]
  },
  {
    path: '/list',
    name: '列表',
    routes: [
      {
        path: '/list/base',
        name: '基础'
      },
      {
        path: '/list/group',
        name: '组合'
      }
    ]
  },
  {
    path: '/analysis',
    name: '分析',
    routes: [
      {
        path: '/analysis/base',
        name: '数据分析'
      },
      {
        path: '/analysis/monitor',
        name: '监控'
      }
    ]
  },
  {
    path: '/other',
    name: '其它',
    routes: []
  }
];

const getPageTitle = (pathname, routes) => {
  let routeData = matchParamsPath(pathname, routes)
  console.log(routeData, 'result')
  return 'Page - Title'
  // return `${routeData.name} - Title`
};


// let res = getPageTitle('/list/base', testRoutes);
let res = getData('/list/base', testRoutes);

console.log(res);