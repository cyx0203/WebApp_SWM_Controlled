import { isApk, isElectron } from './index'

const {ipcRenderer} = isElectron ? require('electron') : '';

/**
 * 写入日志
 * web写日志默认wLog
 */
function log(logData: any) {
  console.log('logData', logData)
  if (isApk) {
    window.ggie.webLog(`${JSON.stringify(logData)}`);
  } else if (isElectron) {
    ipcRenderer.send('wLog', JSON.stringify(logData));
  }
  console.log(`log----${JSON.stringify(logData)}`)
}

/**
 * 向浏览器单方面发送事件
 * 此方法会记录日志
 */
function emit(event: any, props?: any) {
  if (isApk) {
    // 和apk具体交互方法要统一好，这边默认参数是json字符串
    window.ggie[event](props);
  } else if (isElectron) {
    if (event !== 'wLog') {
      ipcRenderer.send(event, props);
    }
  }
  log(props)
}

/**
 * 向浏览器发送事件，并有回调，例如获取配置信息、读写文件等一些异步操作
 * @param event
 * @param props
 */
async function invoke(event: any, props: any) {
  if (isElectron) {
    return await ipcRenderer.invoke(event, props)
  }
}


/**
 * web被动监听浏览器事件，例如MQ等
 * 目前只用于浏览器，不适用apk
 * @param event
 * @param callback
 * @returns
 */
function on(event: any, callback: any) {
  if (isElectron) {
    ipcRenderer.on(event, (e: any, arg: any) => {
      callback(arg);
    });
  }
}

function apkOn(type: any, callback: any) {
  window[type] = (res: any) => callback(res)
}

export default {
  log,
  emit,
  invoke,
  on,
  apkOn,
};
