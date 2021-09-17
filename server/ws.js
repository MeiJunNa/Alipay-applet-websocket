
var WebSocketServer = require("ws").Server;
const Koa = require('koa')
const Router = require('koa-router');
const app = new Koa();
const router = new Router();
let fs = require('fs');
let qs = require('qs');
const path = require('path');
let http = require('http');
let https = require('https');
const Multer = require('multer');
let cors = require('koa2-cors');
//creating a websocket server at port 9090 
var wss = new WebSocketServer({ port: 998 });

//all connected to the server users 
var users =new Map();
var cons = {}
var roomlist={}
function param(url) {
    if(!url) ""
    let d= url.substr(url.indexOf("?")+1,url.length)
    return qs.parse(d)
}
//when a user connects to our sever 
wss.on("connection", function (connection, req) {
    //when server gets a message from a connected user 
    // console.log("---------------",param(req.url));
    // let objs= param(req.url)
    connection.on("message", function (message) {
        var data;
        //accepting only JSON messages 
        try {
            data = JSON.parse(message);
        } catch (e) {
            console.log("Invalid JSON");
            data = {};
        }
        if (data == "off") return connection.close()
        //switching type of the user message 
        switch (data.type) {
            //when a user tries to login 
            case "login":
                console.log("登录用户：", data.type);                
                //if anyone is logged in with this username then refuse 
                if (users.get(data.name)) {
                    connection.send(JSON.stringify({
                        type: "login",
                        message: "号已存在！",
                        success: false
                    }))
                } else {
                    //save user connection on the server 
                    connection.send(JSON.stringify({ 
                        type: "login",
                        message: "号创建成功！",
                        success: true
                    }));
                    users.set(data.name,connection)
                }
                break;   
                case "msg":
                console.log("msg: ", data);
                //for ex. UserB answers UserA 
                users.get(data.name).send(JSON.stringify(data))              

                break;
                case "-1":
                    console.log("------------------------",data,data.type);
                    connection.send(JSON.stringify(data))
                    break;
            default:
                console.log("没有类型",data);

                break;
        }
    });

    //when user exits, for example closes a browser window 
    //this may help if we are still in "offer","answer" or "candidate" state 
    connection.on("close", function () {
        console.log("有信息退出",connection.name,connection.roomid);
        
        if (connection.name) {
            delete cons[connection.key];
            delete users[connection.name]
            if(roomlist[connection.roomid]&&roomlist[connection.roomid].length>=1){
                roomlist[connection.roomid]&&roomlist[connection.roomid].length>=1?roomlist[connection.roomid].map((d,i)=>{
                    console.log(d)
                    if(d.name==connection.name){
                        roomlist[connection.roomid].splice(i,1)
                    }
                }):null
            }
            

        }
        console.log(roomlist[connection.roomid]);
    });
    // connection.on() 

    connection.send(JSON.stringify({data:"欢迎使用！"}));
});

function sendTo(roomid,name,message) {
    if(roomlist[roomid]&&roomlist[roomid].length>=1){
        roomlist[roomid]&&roomlist[roomid].length>=1?roomlist[roomid].map((d,i)=>{
            if(d.name==name){
                d.isZb=true
            }else{
                d.isZb=false
                d.conn.send(JSON.stringify(message));
            }
        }):null
    }
    
}
console.log("奥力给！")