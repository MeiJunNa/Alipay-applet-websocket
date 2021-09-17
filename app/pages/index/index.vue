<template>
	<view class="index">

		<view class="viewline" @click="login">

		</view>
		<view class="viewline">
			消息内容：<input class="input" v-model="msg" />
		</view>
		<view class="viewline">
			对方身份：<input class="input" v-model="name" />
		</view>
		<view class="viewline">
			自己身份：<input class="input" v-model="id" />
		</view>
		<view class="viewline">
			<view class="btn" @click="init">
				初始化
			</view>
			<view class="btn" @click="login">
				登录
			</view>
			<view class="btn" @click="meSend">
				发送消息
			</view>
		</view>
		<view class="msglist">
			{{msglist}}
		</view>
	</view>
</template>

<script>
	import store from "../../store.js"
	export default {
		data() {
			return {
				id:"",
				msg: "", //消息
				name: "",
				msglist: "收到的消息"
			}
		},
		onLoad() {
			//#ifdef MP-ALIPAY
			my.onSocketMessage((res) => {
				this.msglist+=JSON.stringify(res)
			})
			//#endif
			
		},
		methods: {
			onmessage(res) {
				console.log(res)
			},
			init() {
				if(this.id=="") return uni.showToast({title: '自己身份不能为空', duration: 2000});
				this.$store.commit("WEBSOCKET_INIT",this.id)
			},
			login() { //登录
			if(this.id=="") return uni.showToast({title: '自己身份不能为空', duration: 2000});
				this.$store.commit("WEBSOCKET_SEND", JSON.stringify({
					type: "login",
					name: this.id
				}))
			},
			meSend() { //发消息
				if(this.name==""||this.msg=="") return uni.showToast({title: '对方身份与消息内容不能为空！', duration: 2000});
				this.$store.commit("WEBSOCKET_SEND", JSON.stringify({
					type: "msg",
					name: this.name,
					data: this.msg
				}))
			}
		}
	}
</script>

<style>
	.page {
		/* margin: 20rpx;
				padding: 6rpx; */
		border-top: 1px solid #eee;
		margin-top: 14px;
		padding: 48rpx 20rpx 20rpx 20rpx;
		background: #fff;
	}

	.index {
		background: #FFFFFF;
	}

	.viewline {
		height: 50px;
		margin-bottom: 5px;
		line-height: 50px;
		display: flex;
		flex-direction: row;
	}

	.msglist {
		height: 300px;
		overflow-y: scroll;
		border: #999999 1px solid;
	}

	.input {
		border: #C0C0C0 1px solid;
		border-radius: 3px;
	}

	.btn {
		width: 120px;
		height: 40px;
		background: #007AFF;
		color: #FFFFFF;
		line-height: 40px;
		text-align: center;
		border-radius: 6px;
		margin: 2px auto;
	}
</style>
