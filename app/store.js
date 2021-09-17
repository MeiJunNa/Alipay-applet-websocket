import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
/**WS数据接收统一处理 */
let store = new Vuex.Store({
	state: {
		socketTask: null,
		eventlist: [],
		wssHost,
		interval: null,
		intervalAli: null,
		socketTaskAli: null,
	},
	mutations: {
		WEBSOCKET_INIT(state, accessToken) {
			//#ifdef MP-WEIXIN
			if (state.socketTask != null) {
				console.log('=======return')
				return;
			}
			//console.log(wssHost+uid);
			// 创建一个this.socketTask对象【发送、接收、关闭socket都由这个对象操作】
			state.socketTask = uni.connectSocket({
				url: wssHost + accessToken,
				// 【非常重要】必须确保你的服务器是成功的,如果是手机测试千万别使用ws://127.0.0.1:9099【特别容易犯的错误】
				success(data) {
					console.log("websocket连接成功");
					console.log(data);
				},
				fail(data) {
					console.log("websocket连接失败");
				},
				complete(data) {
					console.log("websocket连接完成");
				},
			});

			// 消息的发送和接收必须在正常连接打开中,才能发送或接收【否则会失败】
			state.socketTask.onOpen((res) => {
				console.log("WebSocket连接正常打开中...！");
				state.is_open_socket = true;
				// 注：只有连接正常打开中 ，才能正常收到消息
				state.socketTask.onMessage((res) => {
					console.log("收到服务器内容：" + res.data);
					let d = JSON.parse(res.data)
					if (d.type != -1) { //除了心跳，其他信息都往下发布
						uni.$emit("socketMsg", d); //广播出去
					}
				});

				//启动心跳
				if (state.interval == null) {
					var msg = {
						type: '-1',
						action: 'online',
						data: '定时心跳'
					};

					state.interval = setInterval(function() {
						state.socketTask.send({
							data: JSON.stringify(msg),
							async success() {
								console.log("心跳发送成功："+JSON.stringify(msg));
							},
						})
					}, 5000);
				}
			});

			state.socketTask.onClose(function(msg) {
				if (state.interval != null) {
					clearInterval(state.interval);
					state.interval = null;
				}
				state.socketTask = null;
				console.log("链接被关闭");

				console.log(msg);
			});

			state.socketTask.onError(function(msg) {
				console.log("链接错误:");
				console.log(msg);
			});
			//#endif


			//#ifdef MP-ALIPAY
			
			if (state.socketTaskAli != null) {
				console.log('=======return')
				return;
			}
			my.connectSocket({
				url: wssHost + accessToken, // 开发者服务器接口地址，必须是 wss 协议，且域名必须是后台配置的合法域名
				data: {},
				header: {
					'content-type': 'application/json'
				},
				success: (res) => {
					state.socketTaskAli = 'true'
					console.log("websocket连接成功", JSON.stringify(res)); // 返回 "{}",一个空的字典对象。
				},
				fail: () => {
					console.log("websocket连接失败");
				},
				complete: (res) => {
					console.log("websocket连接完成");
				},
			});

			my.onSocketOpen(function(res) {
				console.log("WebSocket连接正常打开中...！");
				state.is_open_socket = true;
				// 注：只有连接正常打开中 ，才能正常收到消息
				my.onSocketMessage(function(res) {
					console.log("收到服务器内容：" + res.data);
					let d = JSON.parse(res.data)
					if (d.type != -1) { //除了心跳，其他信息都往下发布
						uni.$emit("socketMsg", d); //广播出去
					}
				});

				//启动心跳
				if (state.intervalAli == null) {
					var msg = {
						type: '-1',
						action: 'online',
						data: '定时心跳'
					};
					state.intervalAli = setInterval(function() {
						my.sendSocketMessage({
							data: JSON.stringify(msg),
							async success() {
								console.log("心跳发送成功：" + JSON.stringify(msg));
							},
						})
					}, 5000);
				}
			});

			my.onSocketClose((res) => {
				if (state.intervalAli != null) {
					clearInterval(state.intervalAli);
					state.intervalAli = null;
				}
				// 支付宝小程序的ws连接问题，关闭连接时需关闭对于接受，防止关闭失败
				my.offSocketMessage();
				my.offSocketError();
				my.offSocketOpen();
				my.offSocketClose();
							
				state.socketTaskAli = null;
				console.log("链接被关闭");

				console.log(res);
			});
			my.onSocketError(function(res) {
				console.log("链接错误:");
				console.log(res);
			});
			
			
			//#endif
		},

		WEBSOCKET_SEND(state, p) {
			console.log("ws发送！");


			//#ifdef MP-WEIXIN
			state.socketTask.send({
				data: p,
				async success() {
					console.log("消息发送成功");
				},
			});
			//#endif

			//#ifdef MP-ALIPAY
			my.sendSocketMessage({
				data: p, // 需要发送的内容
				async success() {
					console.log("消息发送成功");
				},
			});
			//#endif
		},
		WEBSOCKET_CLOSE(state, accessToken) {
			console.log("关闭推送");


			//#ifdef MP-WEIXIN
			if (state.socketTask == null) {
				return;
			}
			state.socketTask.close();
			//#endif

			//#ifdef MP-ALIPAY
			if (state.socketTaskAli == null) {
				return;
			}
			my.onSocketClose((res) => {
				if (state.intervalAli != null) {
					clearInterval(state.intervalAli);
					state.intervalAli = null;
				}
				// 支付宝小程序的ws连接问题，关闭连接时需关闭对于接受，防止关闭失败
				my.offSocketMessage();
				my.offSocketError();
				my.offSocketOpen();
				my.offSocketClose();
							
				state.socketTaskAli = null;
				console.log("链接被关闭");
			
				console.log(res);
			});
			
			// my.onSocketClose();
			//#endif
		}
	},


	actions: {
		WEBSOCKET_INIT({
			commit
		}, accessToken) {
			commit('WEBSOCKET_INIT', accessToken)
		},
		WEBSOCKET_SEND({
			commit
		}, p) {
			commit('WEBSOCKET_SEND', p)
		},
		WEBSOCKET_CLOSE({
			commit
		}, p) {
			commit('WEBSOCKET_CLOSE', p)
		}
	}
})
export default store
