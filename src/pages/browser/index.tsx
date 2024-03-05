/*
 * @Author: WangZhuoYi 13317149311@163.com
 * @Date: 2023-07-25 13:42:57
 * @LastEditors: WangZhuoyi 13317149311@163.com
 * @LastEditTime: 2023-10-24 11:20:08
 * @FilePath: \WebApp2.0\src\pages\login\index.tsx
 * @Description:
 */

import styles from './index.module.less'

import { useEffect, useState, useRef } from 'react';
import { Space, Form, message, Row, Col } from 'antd';
// import { HttpReqPost } from '@/core/trade';
//@ts-ignore
import GGRtcClient from '@/core/GGRtcClient-1.3.0'
import { getConfigFromBroswer, Trade } from '@/utils';
import { HourglassOutlined, RightCircleTwoTone, VideoCameraTwoTone, SyncOutlined } from '@ant-design/icons';
import JsBridge from '@/utils/JsBridge';

const Browser: React.FC = () => {
  // 终端设备id
  const term_id = useRef('')
  // 流水号
  const media_seq_no = useRef('');
  // 登记类型
  const trd_type = useRef('')
  // 当前时间
  let time = new Date()
  // 提示信息
  const [msg, setMsg] = useState('正在连接...')

  // 等待音频
  const mp3Url_wait = "/src/assets/waiting.mp3";
  let player_wait = useRef(new Audio(mp3Url_wait));
  player_wait.current.loop = true;

  // 挂断音频
  const mp3Url_hangup = "/src/assets/hangup.mp3";
  let player_hangup = useRef(new Audio(mp3Url_hangup));

  // 控制vtm视频开关
  // const vtmState = useRef(0); // 0未连接 1正在连接 2已连接
  const [flag, setFlag] = useState(0)
  // 检测状态,避免反复发起交易
  const isConnecting = useRef(false)
  // const [waitTrade,setWait] = useState(false)
  // 判断注册交易的状态
  const waitTrade = useRef(false);

  // 当前排队人数
  const [current_user, setcurrentUser] = useState(2)

  //在线用户数据列表
  // const [onlineUsers, setOnlineUsers] = useState<any>([]);
  // //摄像头
  // const [vdSource, setVdSource] = useState<Array<any>>([]);
  // //像素
  // const [pixel, setPixel] = useState<Array<any>>([]);
  //帧率
  const frame = useRef<Array<any>>([
    '15', '20', '25', '30', '60'
  ]);
  //码率
  const bitRate = useRef<Array<any>>([
    'unlimited', '2000', '1000', '500', '250', '125'
  ]);

  //摄像头
  // const [micSource, setMicSource] = useState<Array<any>>([]);

  // const [calleeUserName, setCalleeUserName] = useState<any>('');
  // const [callerUserName, setCallerUserName] = useState<any>('');
  // const [resvRate, setResvRate] = useState<any>('N/A');
  // const [sendRate, setSendRate] = useState<any>('N/A');

  const shareList = useRef([]);

  const rtcClient: any = useRef(null);
  const g_constraints: any = useRef({ audio: true, video: true });
  //当前使用的摄像头分辨率
  const g_currentPixel: any = useRef('');
  //当前帧率
  const g_currentFrameRate: any = useRef('15');
  //当前麦克风设备id
  const g_currentAudioID: any = useRef('');
  //当前摄像头设备id
  const g_currentVideoID: any = useRef('');
  //是否进入了房间
  const g_isJoinRoom: any = useRef(false);
  //当前用户是否在通话中
  const g_isCalling: any = useRef(false);

  //房间号
  const g_roomId: any = useRef('room1');
  //用户名
  const g_userName: any = useRef('');
  //被叫的用户名
  const g_calleeUserName: any = useRef('');

  //标记Form
  const [formRef] = Form.useForm();

  //静音和静视
  // const [muteAudio,setmAudio] = useState(false);
  // const [muteVideo,setmVideo] = useState(false);

  // 结束业务交易接口
  const endTrcd = async () => {
    // const ret: any = await HttpReqPost('/dispatch/endTrcd', {
    //   media_seq_no: media_seq_no.current,
    // });
    Trade.post('/dispatch/endTrcd',
      {
        media_seq_no: media_seq_no.current,
      }
    ).then((ret:any)=>{
      JsBridge.log(`endTrcd交易返回参数:${ret}`)
      console.log('end_media:', media_seq_no.current);
    })
    
  }

  // 离开房间
  const LEAVE_ROOM = () => {
    if (!g_isJoinRoom.current) {
      return; // 未加入房间，直接退出
    }
    console.log(`用户:${g_userName} 离开了房间[${g_roomId}]`);

    // 执行离开房间
    rtcClient.current.leave((result: any) => {
      console.log("离开房间的执行结果：" + JSON.stringify(result))
      if (JsBridge) {
        JsBridge.log(`离开房间执行结果:${JSON.stringify(result)}`)
      }

      // 如果服务端成功执行
      if (result.code === 0) {
        console.log("会话状态标志 => false");
        g_isCalling.current = false;
        console.log("退出房间标志 => false");
        g_isJoinRoom.current = false;
        console.log("清空GGRtcClient对象");
        rtcClient.current = null;
        // message.info('成功退出房间');
        setMsg('已结束远程')

        endTrcd();
      }
      else {
        setMsg(result.msg)
      }
    }
    );
  }

  // 视频结束处理
  const endVideo = () => {
    setFlag(0)
    g_isCalling.current = false;
    isConnecting.current = false;
    LEAVE_ROOM()
    if (JsBridge) JsBridge.emit('set_state', 0);
  }

  // 本地桌面视频分享
  const SHARE = async (id?: any) => {
    if (!rtcClient.current) return;
    if (!JsBridge) {
      setMsg('未获取到IPCRender')
      return;
    }

    try{
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          //@ts-ignore
          mandatory: {
            chromeMediaSource: 'desktop',
            // chromeMediaSourceId: "window:312546:0" // 固定获取主桌面流
            chromeMediaSourceId: id ? id : shareList.current[0].id,
            // 'screen:724848853:0',
            // minWidth: 1000,
            // maxWidth: 1000,
            // minHeight: 500,
            // maxHeight: 500
          }
        }
      })
      JsBridge.log(`streamId:`+shareList.current[0].id)
      // video.srcObject = stream;
      // video.play();
      rtcClient.current.doLocalShare(stream)
    } catch(e) {
      console.log(e);
      JsBridge.log(`dsekTopError:${JSON.stringify(e)}`)
    }
  }

  const options: any = useRef(
    {
      // userId: `${g_userName.current}`,            // 用户id
      // roomId: `${g_roomId.current}`,            // 房间号
      userId: ``,            // 用户id
      roomId: ``,
      cameraId: '',         // 当前摄像头id（如果不传，则取系统默认值）
      microphoneId: '', // 当前麦克风id（如果不传，则取系统默认值）

      // 设置本地和远程视频播放的dom-video的id
      local_stream_play_video: 'rtcA',
      remote_stream_play_video: 'rtcB',
      // 分享流播放的dom-video的id
      remote_share_stream_play_video: 'rshare',

      // 音视频约束参数（重要）
      constraints: g_constraints.current,

      // 信令服务器地址
      // SignalServerAddr : "http://127.0.0.1:3000",
      //   SignalServerAddr: "https://127.0.0.1:8443",

      //238服务器地址
      // SignalServerAddr: "https://wx.ggzzrj.cn:8443",
      //   SignalServerAddr: 'https://192.168.2.234:8443',
      SignalServerAddr: 'https://192.168.1.124:8443', // 本地

      // 上传音视频文件的服务端URL
      uploadServerURL: "https://ggplat.ggzzrj.cn/hbjx-wxplatpro/wxplatpro/UploadWebRtcVideo.do",

      // 是否禁用视频(false或不配置，则不禁用) （默认false）
      muteVideo: false,
      // 是否禁用流量监控（默认false）
      disableRateMonitor: false,

      // 绑定回调函数
      callback: {

        // ================== 其他人加入房间通知 ==================
        onAnotherUserJoin: (account: any, userlist: any) => {
          console.log(userlist);
          setMsg(`${account} 已连接`)
        },

        // ================== 群发送消息通知 ==================
        onBroadcastMsg: (data: any) => {
          console.log('收到远端用户传来的消息message...');
          message.destroy();
          message.warn(`收到远程终端传来消息...${data}`);
        },

        // ================== 其他人离开房间通知 ==================
        onAnotherUserLeave: (account: any, userlist: any) => {
          console.log(userlist);
          endVideo()

          setMsg(`${account} 已退出`)
          if (JsBridge) {
            JsBridge.log(`坐席${account}离开房间,我也离开...`)
          }
        },

        // ================== （被呼叫端）收到呼叫请求消息 ==================
        onCall: (data: any, isCalling: any) => {
          console.log("onCall", data); // 格式： {roomid: "room1", callee: "user_17", caller: "user_84"}
          console.log("isCalling", isCalling);  // 当前是否正在视频会话中，true-是，false-否
          try {
            if (isCalling) { // 判断自己是否在通话中
              console.log("收到呼叫，但当前已经处在通话中");
              data.replyCode = 3;  // 发送响应（状态码为3，表示在通话中）
              return;
            }

            if (confirm("用户 " + data.caller + ' 向你请求视频通话, 是否同意?')) {
              console.log("同意");
              g_isCalling.current = true;  // 保存到全局变量
              data.replyCode = 1;  // 发送响应（状态码为1，表示同意）
            }
            else {
              console.log("拒绝");
              data.replyCode = 2;  // 发送响应（状态码为2，表示拒绝）
            }
          }
          finally {
            console.log("准备发送reply响应");
            rtcClient.current.reply(data);    // 主动发送回应(给呼叫端)
          }
        },

        // ================== （呼叫端）收到被呼叫端请求响应消息 ==================
        onReply: (data: any, isCalling: any) => {
          console.log("onReply", data);  // {roomid: "room1", callee: "user_85", caller: "user_9", replyCode: 1}
          console.log("isCalling", isCalling);  // 是否正在视频会话中，true-是，false-否
          g_isCalling.current = isCalling; // 保存到全局变量
          JsBridge.log(`video_enable${getConfigFromBroswer(['video_enable']).video_enable}`)
          JsBridge.log(`### Step5:onReply${data} ###`)
        },

        // ================== 视频P2P握手连接完成 ==============================
        onP2PConnectCompleted: () => {
          console.log("视频P2P握手连接完成...");

          console.log("开启码率设置功能");
          // $('#bandwidth').attr("disabled", false);  // 在P2P对接成功后设置


          if (g_isCalling.current === true) {
            setMsg('正在进行视频通话')
            SHARE();
            // 通知应用层正在连接
            if (JsBridge) {
              JsBridge.log(`### Step6:P2P握手成功,准备通信 ###`)
              JsBridge.log(`终端:P2P握手连接完成,正在连接通话,准备分享桌面...`)
              JsBridge.emit('set_state', 1)
            }
          }
        },

        // ================== 收到远端静音/视消息 ==================
        onRemoteMute: (data: any, isCalling: any) => {
          console.log("收到远端静音/视消息...", data, isCalling);
          setMsg("对方" + (data.op === "mute" ? "开启" : "关闭") + (data.type === "audio" ? "静音" : "静视"))
        },

        // ================== 收到远端切换摄像头消息 ==================
        onRemoteChangeCamera: (data: any, isCalling: any) => {
          console.log("收到远端切换摄像头消息...", data, isCalling);
          message.destroy();
          setMsg('收到远端切换摄像头消息...')
        },

        // ================== 收到远端视频会话挂断消息 ==================
        onRemoteHandup: (data: any, isCalling: any) => {
          console.log("收到远端视频会话挂断消息...", data, isCalling);
          setMsg('收到远端视频会话挂断消息...')
          if (JsBridge) {
            JsBridge.log(`座席端远端挂断,我离开房间...`)
          }

          endVideo()
          player_hangup.current.play()

          // 结束时发的交易
          endTrcd()


          console.log("关闭码率设置功能");
          // $('#bandwidth').attr("disabled", true);
        },

        // ================== 收到远端用户断线消息 ==================
        onRemoteDisconnect: (roomid: any, disconnect_user: any, userlist: any) => {
          console.log("收到远端用户断线消息...");

          console.log("会话状态标志 => false");

          console.log(userlist);

          player_hangup.current.play()
          endVideo()
          setMsg(`收到远端用户[ ${disconnect_user} ]断线消息...`)

          // 结束时发的交易
          endTrcd()
        },

        // ================== webSocket连接断开处理 ==================
        onDisconnect: () => {
          console.log("webSocket连接断开...");
          if (JsBridge) JsBridge.log(`webSocket连接断开...`);
          endVideo()
          // rtcClient.current=null
          setMsg('webSocket连接断开...')
          endTrcd()
        },

        // ================== webSocket连接错误处理 ==================
        onConnectError: () => {
          console.log("webSocket错误...");
          if (JsBridge) JsBridge.log(`webSocket错误...`);
          endVideo()
          // rtcClient.current=null
          setMsg('webSocket错误...')
          endTrcd()
        },

        // 码率数据事件（每隔一秒回调）
        onStreamRate: (sendRate: any, resvRate: any) => {
          console.log(sendRate, resvRate)
        },

        // ================== 收到远端用户传来(坐标)消息 ==================
        onRemoteSendMessage: (type: any, data: any) => {
          console.log('收到远端用户传来的消息message...');
          message.destroy();
          message.warn(`收到远程终端传来消息...{type:${type},data:${data}}`);
        },
      }
    });

  // 更新设备信息
  const update_g_constraints = () => {
    if (!g_currentAudioID.current || !g_currentVideoID.current) return;

    g_constraints.current = {
      audio: { deviceId: g_currentAudioID.current },
      video: { deviceId: g_currentVideoID.current }
    };

    if (g_currentPixel.current) {  // 格式：640x480
      g_constraints.current.video.width = g_currentPixel.current.split("x")[0];
      g_constraints.current.video.height = g_currentPixel.current.split("x")[1];
    }
    g_constraints.current.video.frameRate = { ideal: g_currentFrameRate.current, max: 24 };  // 帧率
    console.log("g_constraints", g_constraints.current);

    // 如果初始化了GGRtcClient，则务必要更新
    if (rtcClient.current) {
      console.log("更新rtcClient的_constraints");
      rtcClient.current._constraints = g_constraints.current;
    }
  }

  // 列举媒体设备
  const listEnumerateDevices = () => {
    let getDeviceListCB: any = (deviceArray: any) => {

      // 列举媒体设备
      console.log("========== 列举媒体设备 ===========");

      let vdList: any = [];
      let micList: any = [];
      // 分别将音频和视频设备添加到下拉框
      deviceArray.forEach((device: any) => {
        // console.log('cyxDevice:',device)
        let [type, direction] = device.kind.match(/(\w+)(input|output)/i);
        if (type === "audio" && direction === "input") {
          micList.push({ value: device.deviceId, text: device.label });
        }
        else if (type === "video" && direction === "input") {
          vdList.push({ value: device.deviceId, text: device.label });
        }
      });
      formRef.setFieldsValue({ vd: vdList[0].text })
      formRef.setFieldsValue({ mic: micList[0].text })
      JsBridge.emit('setCfg', ['VTM配置', 'vd', vdList[0].text])
      JsBridge.emit('setCfg', ['VTM配置', 'mic', micList[0].text])
      JsBridge.log(`自动获取的video设备id:${vdList[0].text}`)
      JsBridge.log(`自动获取的audio设备id:${micList[0].text}`)
    };

    // 初始化设备
    GGRtcClient.GetInitLocalDevices(getDeviceListCB)
      .then(() => {
        // 设置默认设备id（当前下拉框所选的设备作为默认）
        g_currentVideoID.current = formRef.getFieldValue('vd');
        g_currentAudioID.current = formRef.getFieldValue('mic');
        console.log("g_currentVideoID = ");
        console.log(g_currentVideoID.current);
        console.log("g_currentAudioID = ");
        console.log(g_currentAudioID.current);

        if (JsBridge) {
          JsBridge.log(`video设备id:${g_currentVideoID.current}`)
          JsBridge.log(`audio设备id:${g_currentAudioID.current}`)
        }
        update_g_constraints(); // 更新g_constraints对象参数
      });
  }

  const getPermissionsAndEnumDevices = () => {
    // 先询问权限，再列举设备列表 -- 靠谱
    GGRtcClient.getPermissions()
      .then(() => {
        listEnumerateDevices();
      });

    // 绑定设备变更事件操作函数
    GGRtcClient.bindOnDeviceChange(listEnumerateDevices);
  }

  const listPixel = () => {
    let pixelList: any = [];
    // 从GGRtcClient全局定义的分辨率参数获取
    GGRtcClient.g_pixel_mode.forEach((item: any) => {
      pixelList.push({ value: item.pixel.width + "x" + item.pixel.height, text: item.desc + "(" + item.type + ")" });
    });
    formRef.setFieldsValue({ pixel: pixelList[0].text })
  }

  const INIT = async () => {
    // step1  检测浏览器是否支持RTC
    const support: any = GGRtcClient.CheckSupportWebRTC();
    console.log(support);
    // step2  提示获取摄像头等设备权限后，再列举设备
    await getPermissionsAndEnumDevices();
    // step3 初始化其他
    listPixel(); // 列举和选定默认分辨率


  }

  // 初始化用户列表
  const initAccount = (res: any) => {
    console.log('用户列表:', res)
    if (JsBridge) {
      JsBridge.log(`用户列表:${res}`)
    }
    for (let i = 0; i < res.length; i++) {
      if (res[i].account !== g_userName.current) {
        g_calleeUserName.current = res[i].account;
        break;
      }
    }
  }

  // 发起视频呼叫
  const CALL = () => {
    if (!g_isJoinRoom.current) {
      message.error("您未进入房间");
      return;
    }

    if (g_isCalling.current) {
      setMsg("当前正在与用户" + rtcClient.current._remoteUser + "通话，请先挂断")
      return;
    }

    const caller = g_userName.current;   // 当前用户
    const callee = g_calleeUserName.current;   // 被呼叫用户

    console.log('🚀');
    console.log(caller);
    console.log(callee);

    if (!callee) {
      setMsg("未选择被呼叫用户")
      return;
    }
    if (caller === callee) {
      setMsg('不能跟自己进行视频会话')
      return;
    }

    console.log(caller + " 呼叫 " + callee);
    if (JsBridge) {
      JsBridge.log(`${caller}呼叫${callee}`)
    }
    // 与信令服务交互
    rtcClient.current.call(callee, (result: any) => {
      // 打印回调信息
      JsBridge.log("视频呼叫的执行结果: " + JSON.stringify(result))
      console.log("视频呼叫的执行结果: " + JSON.stringify(result)); // {"code":0,"msg":"send call msg to user_2199327"}
      // 提示错误信息
      if (result.code !== 0) {
        setMsg("呼叫失败: " + result.msg)
        JsBridge.log("呼叫失败: " + JSON.stringify(result.msg))
      } else {
        // setVTM(true);
        JsBridge.log(`### Step4:Call呼叫成功 ###`)
        setFlag(2)
        setMsg('准备视频通话中...')
      }
    });
  }

  // 用户加入视频房间
  const JOIN_ROOM = () => {
    // message.destroy();
    options.current.roomId = g_roomId.current;
    options.current.userId = g_userName.current;
    // 初始化RTCClient对象
    if (!rtcClient.current)
      rtcClient.current = new GGRtcClient(options.current);

    rtcClient.current.join((result: any) => {
      // 打印加入房间后服务端返回的信息
      // {"code":0,"msg":"enter successful","room":"room1","accounts":[{"account":"user_32860","id":"ttT5-gWXY0wBpcKbAAAH"}]}
      // console.log("加入房间的执行结果: " + JSON.stringify(result));

      console.log(':: JOIN ROOM ::');
      console.log(result);
      if (result.code === 0) {
        console.log("进入房间标志");
        if (JsBridge) {
          JsBridge.log(`### Step3:加入房间成功 ###`)
          JsBridge.log(`进入房间标志`)
        }
        // 进入房间标志
        g_isJoinRoom.current = true;
        // message.info('成功进入房间');
        setMsg('等待远程协助...')
        console.log('等待对方连接...');

        initAccount(result.accounts)

        CALL();

      }
      else {
        setMsg(result.msg)
        endVideo()
      }

    }
    );
  }

  // 设置视频设备信息
  const doBindChangeEvent = async (type: any, val: any) => {
    console.log(type, val)

    options.current.roomId = g_roomId.current;
    options.current.userId = g_userName.current;
    if (!rtcClient.current)
      rtcClient.current = new GGRtcClient(options.current);

    switch (type) {
      case 'vd':
        // formRef.setFieldsValue({vd:val.label});
        // async function (evt:any) {
        console.log("切换摄像头设备id = " + val.value);
        if (JsBridge) {
          JsBridge.log(`切换摄像头设备id:${val.value}`)
        }
        g_currentVideoID.current = val.value;
        update_g_constraints();  // 刷新g_constraints参数

        // 每次切换，静音/视按钮复位
        // setmAudio(false);
        // setmVideo(false);

        // 如果在通话中，则切换视频
        if (g_isCalling.current) await rtcClient.current.doChangeCamera();
        // }
        break;
      case 'mic':
        // formRef.setFieldsValue({mic:val.label});
        console.log("当前麦克风设备id = " + val.value);
        if (JsBridge) {
          JsBridge.log(`当前麦克风设备id:${val.value}`)
        }
        g_currentAudioID.current = val.value;
        update_g_constraints(); // 刷新g_constraints参数
        break;
      case 'pixel':
        // 分辨率选择事件
        // formRef.setFieldsValue({pixel:val.label})
        g_currentPixel.current = val.value;
        console.log("当前分辨率 g_currentPixel = " + g_currentPixel.current);
        if (JsBridge) {
          JsBridge.log(`当前分辨率:${g_currentPixel.current}`)
        }
        update_g_constraints();  // 更新g_constraints

        // 如果在通话中，则切换视频
        if (g_isCalling.current) await rtcClient.current.doChangeCamera();
        // selectedIndex属性设置不会触发change事件
        // 所以此处先触发一次change事件，方便更新g_constraints参数
        // $('#cameraPixel').trigger("change"); 
        break;
      case 'frame':
        // 帧率改变事件
        // 如果正在视频当中，则不重新做媒体协商
        // formRef.setFieldsValue({frame:val.label})
        g_currentFrameRate.current = parseInt(val.value);
        if (g_currentFrameRate > 24) g_currentFrameRate.current = 60;
        if (g_currentFrameRate <= 0) g_currentFrameRate.current = 15;
        console.log("当前帧率 g_currentFrameRate = " + g_currentFrameRate.current);
        if (JsBridge) {
          JsBridge.log(`当前帧率:${g_currentFrameRate.current}`)
        }
        update_g_constraints(); // 更新g_constraints
        break;
      case 'bitRate':
        // 码率切换（需要在视频交互过程中切换）
        // formRef.setFieldsValue({bitRate:val.label})
        console.log("当前码率 = " + val.value + " kbps");
        if (JsBridge) {
          JsBridge.log(`当前码率:${val.value}kbps`)
        }
        update_g_constraints();
        val.disabled = true;  // 每次设置时，在没成功设置前，先把本下拉框设为无效，防止用户频繁设置
        // const bw = val.value;
        if (g_isCalling.current) rtcClient.current.doChangeBandwidth(val.value);  // 设置
        val.disabled = false;	// 设置成功后，再次启用本下拉框
        break;
      default: break;
    }
  }

  // 读取浏览器视频设备配置
  const autoInit = () => {
    if (JsBridge) {
      doBindChangeEvent('vd', { value: getConfigFromBroswer(['vd']).vd });
      doBindChangeEvent('pixel', { value: getConfigFromBroswer(['pixel']).pixel });
      doBindChangeEvent('frame', { value: getConfigFromBroswer(['frame']).frame });
      doBindChangeEvent('biteRate', { value: getConfigFromBroswer(['biteRate']).biteRate });
      doBindChangeEvent('mic', { value: getConfigFromBroswer(['mic']).mic });
    }
    JOIN_ROOM();
  }

  // 停止本地视频分享
  const STOP_SHARE = async () => {
    if (!rtcClient.current) return;
    if (g_isCalling.current) rtcClient.current.stopLocalShare();
  }

  // 挂断视频
  const HANGUP = () => {
    // message.destroy();
    if (!g_isCalling.current) {
      // message.error("当前未建立通话");
      setMsg("当前未建立通话")
      endTrcd()
      console.log('HANGUP:当前未建立通话');
      return;
    }

    // 发出挂断信令
    rtcClient.current.hangup(() => {
      // message.info("挂断成功");
      setMsg("挂断成功")
      console.log("会话状态标志 => false");
      g_isCalling.current = false;

      // 通知应用层连接断开
      if (JsBridge) {
        JsBridge.emit('set_state', 0)
      }
      player_hangup.current.play()
      endTrcd();
    });
  }




  // 视频流程初始化
  const startInit = () => {
    // const randomUser: any = Math.floor(Math.random() * (100 - 1)) + 1;
    // g_userName.current = `user_${randomUser}`;
    console.log(`终端用户名:${term_id.current}`);
    if (JsBridge) {
      JsBridge.log(`终端用户名:${term_id.current}`)
    }
    if (term_id.current) {
      g_userName.current = term_id.current;
    } else {
      const randomUser: any = Math.floor(Math.random() * (100 - 1)) + 1;
      g_userName.current = `user_${randomUser}`;
    }
    INIT();

    formRef.setFieldsValue({ frame: frame.current[0] })
    formRef.setFieldsValue({ bitRate: bitRate.current[0] })

    autoInit()
  }

  // 注册交易接口
  const registerTrcd = async () => {
    let no = `${term_id.current}_`;
    no += time.getFullYear() + ''
      + (time.getMonth() + 1 < 10 ? '0' + (time.getMonth() + 1) : time.getMonth() + 1) + ''
      + (time.getDate() < 10 ? '0' + time.getDate() : time.getDate()) + ''
      + (time.getHours() < 10 ? '0' + time.getHours() : time.getHours()) + ''
      + (time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes()) + ''
      + (time.getSeconds() < 10 ? '0' + time.getSeconds() : time.getSeconds()) + '';
    console.log(no)

    media_seq_no.current = no

    waitTrade.current = true;

    // 先重置，防止之前未播完
    player_wait.current.pause();
    player_wait.current.load();
    player_wait.current.play(); //播放 mp3这个音频对象

    console.log('参数:', media_seq_no.current, term_id.current, trd_type.current)
    if (JsBridge) {
      JsBridge.log(`登记业务参数:${media_seq_no.current},${term_id.current},${trd_type.current}`)
    }
    // const ret = await HttpReqPost('/dispatch/registerTrcd', {
    //   hospital_id: getConfigFromBroswer(['hospital_id']).hospital_id,
    //   media_seq_no: media_seq_no.current,
    //   swm_id: term_id.current,
    //   trd_type: trd_type.current,
    // });

    Trade.post('/dispatch/registerTrcd',
      {
        hospital_id: getConfigFromBroswer(['hospital_id']).hospital_id,
        media_seq_no: media_seq_no.current,
        swm_id: term_id.current,
        trd_type: trd_type.current,
      }
    ).then((ret:any)=>{
      if (ret && ret.header.returnCode === '0') {
      isConnecting.current = true
      JsBridge.log(`### Step1:registerTrcd注册成功 ###`)
      } else {
        endVideo();
        waitTrade.current = false;
      }
      JsBridge.log(`registerTrcd交易返回参数:${ret}`)

      console.log('ret:', ret)
    })
  }

  // 等待连接状态转初始状态
  const state_1to0 = () => {
    waitTrade.current = false;
    STOP_SHARE();
    HANGUP();
    endVideo()
  }

  // 直接返回初始状态
  const return_state_0 = () => {
    waitTrade.current = false;
    endVideo()
    player_wait.current.pause();
    player_wait.current.load();
    endTrcd();
  }

  useEffect(() => {

    // console.log(window.z.config);

    if (JsBridge) {
      // JsBridge.on('get_state',async (e,res)=>{alert(`连接状态:${res}`)})

      // 设置副屏坐标流水号等
      JsBridge.emit('swmSecond', { open: true, trd_type: 'DLS', xPos: 800, yPos: 0 })

      options.current.SignalServerAddr = getConfigFromBroswer(['remoteUrl']).remoteUrl;

      // 获取浏览器的桌面流
      JsBridge.on('DESKTOP', async (data: any) => {
        if (data.cmd === 'screens') {
          console.log(`获取的桌面流:`);
          console.log(data.list)
          JsBridge.log(`### Step0:获取桌面流成功 ###`)
          JsBridge.log(`获取的桌面流:${JSON.stringify(data.list)}`)
          shareList.current = data.list
        }
      });
      JsBridge.emit('DESKTOP', { cmd: 'screens', type: 'second' });

      // 获取浏览器发来的MQ消息
      JsBridge.on('MQ_MSG', async (args: any) => {
        console.log('MQ消息:', JSON.parse(args));
        JsBridge.log(`### Step2:获取MQ消息成功 ###`)
        JsBridge.log(`MQ消息:${JSON.parse(args)}`)

        // const roomid = 'SWM002' // 测试用
        if (JSON.parse(args).room_id) { // 删除
          g_roomId.current = JSON.parse(args).room_id;
          // g_roomId.current = roomid // 测试用
          console.log('connect:', isConnecting.current);

          if (isConnecting.current) {
            console.log('isConnecting...开始初始化startInit()');
            JsBridge.log(`终端:isConnecting...开始初始化startInit()`)

            await startInit();
            // 可再次点击请求协助按钮
            player_wait.current.pause();
            player_wait.current.load();
            waitTrade.current = false;
          }
        }
      });

      console.log("MQ_OPEN")
      JsBridge.emit('MQ_OPEN');

      // 接收关闭浏览器消息通信后的函数处理
      JsBridge.on('closeVTM', async () => {
        if (g_isCalling.current) {

        }

        HANGUP();
        endVideo()
        player_wait.current.pause();
        player_wait.current.load();
        waitTrade.current = false
      })

      // 发送消息通信从浏览器获取终端号和交易类型
      JsBridge.on('startInvoke', async () => {
        console.error('startInvoke');
        JsBridge.invoke('get_NoandType', '02').then((result: any) => {
          console.error('get_NoandType');
          console.error(result);

          term_id.current = result.term_id
          // media_seq_no.current = result.media_seq_no;
          trd_type.current = result.trd_type

          console.log('result:', result)
        })
      })

    }
    return () => { }
  }, []);

  return (
    <Space className={styles.main} direction="vertical" size="middle" style={{ overflow: 'hidden', width: '455px' }}>

      <div style={{ width: '100%', overflow: 'hidden' }}>
        {
          // 接通状态
          flag === 2 ? <div
            className={
              !getConfigFromBroswer(['video_enable']).video_enable && g_isCalling.current ? styles.block3_2
                : styles.block3}>
            <div style={{ height: '80vh' }}>
              <video id={'rtcB'
              } src=""
                poster={
                  !getConfigFromBroswer(['video_enable']).video_enable && g_isCalling.current ? '' :
                    '/src/assets/poster.jpg'
                }
                // controls
                className={styles.vd}
                style={{ width: '100%', height: '75vh',zIndex: getConfigFromBroswer(['video_enable']).video_enable?0:-10 }}
              ></video>

              <video id='rtcA' src="" muted
                poster={'/src/assets/poster.jpg'}
                // controls
                className={styles.vd}
                // style={{width:'227px',height:'210px',top:'-216px',left:'228px'}}
                style={{ width: '50%', height: '40%', top: '-41.2%', left: '50%' }}
              ></video>
            </div>
            <div style={{
              position: 'relative',
              top: '-20px',
              fontSize: '20px'
            }}>{msg}</div>

            <Space className={styles.block} style={{ width: '95%' }} onClick={() => {
              state_1to0();
            }}>
              <Row className={styles.row1}>
                <Col span={10} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '182px' }}>
                  <RightCircleTwoTone style={{ fontSize: '55px' }} twoToneColor="red" />
                </Col>

                <Col span={14} style={{ display: 'grid', alignItems: 'center', justifyContent: 'center', width: '136.5px' }}>
                  <Row style={{ fontSize: '30px', display: 'flex', justifyContent: 'center', color: 'white' }}>关闭远程</Row>
                  <Row style={{ display: 'flex', justifyContent: 'center', color: 'white' }}>无需帮助可关闭</Row>
                </Col>
              </Row>
            </Space>
          </div> :
            (
              // 初始首页状态
              flag === 0 ?
                <div className={styles.block2} style={{
                  background: `url('/src/assets/2.jpg') no-repeat`,
                  backgroundSize: '100% 100%',
                  overflow: 'hidden',
                }}
                >
                  <Space className={styles.block} onClick={() => {
                    console.log('视频按钮');
                    console.log(waitTrade.current);
                    if (!waitTrade.current) {
                      setFlag(1)
                      registerTrcd();
                    }
                  }}>
                    <Row className={styles.row1}>
                      <Col span={10} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '182px' }}>
                        <VideoCameraTwoTone style={{ fontSize: '55px' }} />
                      </Col>

                      <Col span={14} style={{ display: 'grid', alignItems: 'center', justifyContent: 'center', width: '136.5px' }}>
                        <Row style={{ fontSize: '30px', display: 'flex', justifyContent: 'center', color: 'white' }}>远程协助</Row>
                        <Row style={{ fontSize: '15px', display: 'flex', justifyContent: 'center', color: 'white' }}>点此呼叫客服</Row>
                      </Col>
                    </Row>
                  </Space>
                </div> :
                // 等待连接状态
                <div className={styles.block2}>
                  <div style={{ height: '55vh', display: 'block', alignItems: 'center', justifyContent: 'center' }}>
                    <Row style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',fontSize:'45px' }}>
                      <div><HourglassOutlined twoToneColor="#52c41a" /></div>
                      <div style={{ color: 'white' }}>视频接通中...</div>
                    </Row>
                    {
                      current_user - 1 > 0 ?
                        <Row style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' }}>
                          <Row>正在排队，前面还有{current_user - 1}人</Row>
                          <Row onClick={() => { setcurrentUser(current_user + 1) }}>预计等待{(current_user - 1) * 5}分钟</Row>
                        </Row>
                        : ''
                    }
                  </div>
                  <Space className={styles.block} onClick={() => {
                    return_state_0()
                  }}>
                    <Row className={styles.row1}>
                      <Col span={10} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '182px' }}>
                        <SyncOutlined spin style={{ fontSize: '50px', color: "dodgerblue" }} />
                        <div><audio id='audio_wait' controls={false} src={mp3Url_wait}></audio></div>
                      </Col>

                      <Col span={14} style={{ display: 'grid', alignItems: 'center', justifyContent: 'center', width: '136.5px' }}>
                        <Row style={{ fontSize: '30px', display: 'flex', justifyContent: 'center', color: 'white' }}>正在等待</Row>
                        <Row style={{ fontSize: '15px', display: 'flex', justifyContent: 'center', color: 'white' }}>取消呼叫</Row>
                      </Col>
                    </Row>
                  </Space>
                </div>
            )
        }

      </div>
    </Space>
  );
};

export default Browser;

