var dgram = require('dgram');
var server = dgram.createSocket('udp4');
var port = 4000;

var fs = require('fs');
var messageString = "";

var startTime;
var datajson = {};

var buffer = new ArrayBuffer(512);
var uint8View = new Uint8Array(buffer);

server.on('listening', function () {
    var address = server.address();
    console.log('server listening on ' + address.address + ':' + address.port);
});

server.bind(port);

function toBuffer(arrbuffer) {
    var buf = Buffer.alloc(arrbuffer.byteLength);
    var view = new Uint8Array(arrbuffer);
    for (var i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
}

server.on('message', function (message, rinfo) {
    var buff;
    var strdata = "";
    console.log('server got message:' + message);
    console.log('server got from: ' + rinfo.address + ' port:' + rinfo.port);
    createBinarydataByJSONdata();
    buff = toBuffer(buffer);
    console.log('send: ', uint8View[384], uint8View[385], uint8View[386], uint8View[387]);
    server.send(buff, 0, buff.byteLength, rinfo.port, rinfo.address);
});

server.on('close', function () {
    console.log('close event');
});

const updatemessage = setInterval(() => {
    fs.readFile('../buff.txt', 'utf8', function (err, data) {
        console.log("read file.. : ");
        if (messageString != data) {
            messageString = data;
            datajson = updateJSONdataBySigmapdata(messageString)
        }
    });
}, 3000);

function updateJSONdataBySigmapdata(messageString) {
    var timesum = 0;
    const jsonData = JSON.parse(messageString);
    console.log("traffic data updated");

    jsonData["c00"] = 0;
    jsonData["c01"] = timesum + Number(jsonData.c0105);
    timesum = timesum + Number(jsonData.c0105);
    jsonData["c02"] = timesum + Number(jsonData.c0205);
    timesum = timesum + Number(jsonData.c0205);
    jsonData["c03"] = timesum + Number(jsonData.c0305);
    timesum = timesum + Number(jsonData.c0305);
    jsonData["c04"] = timesum + Number(jsonData.c0405);
    timesum = timesum + Number(jsonData.c0405);
    jsonData["c05"] = timesum + Number(jsonData.c0505);
    timesum = timesum + Number(jsonData.c0505);
    jsonData["c06"] = timesum + Number(jsonData.c0605);
    timesum = timesum + Number(jsonData.c0605);
    jsonData["c07"] = timesum + Number(jsonData.c0705);
    timesum = timesum + Number(jsonData.c0705);
    jsonData["c08"] = timesum + Number(jsonData.c0805);
    timesum = timesum + Number(jsonData.c0805);

    uint8View.fill(0);
    startTime = new Date().getTime();

    //정적인 데이터는 여기서 채워 넣어준다.
    fillStaticBusData();

    return jsonData;
}

function createBinarydataByJSONdata() {
    
    var curtime = new Date().getTime();
    elapsedtime = curtime - startTime;
    trafficTime = (elapsedtime/1000) % datajson.c08;

    if(trafficTime < datajson.c01){
        cnum = "c01";
        befcnum = "c00";
        hyunsi = 1;
        hyunsinum = "c01";
        fillDynamicTrafficData(cnum, trafficTime, befcnum, hyunsi, hyunsinum)
        console.log("phase1");
    }else if(trafficTime < datajson.c02){
        cnum = "c02";
        befcnum = "c01";
        hyunsi = 1;
        hyunsinum = "c01";
        fillDynamicTrafficData(cnum, trafficTime, befcnum, hyunsi, hyunsinum)
        console.log("phase2");
    }else if(trafficTime < datajson.c03){
        cnum = "c03";
        befcnum = "c02";
        hyunsi = 2;
        hyunsinum = "c03";
        fillDynamicTrafficData(cnum, trafficTime, befcnum, hyunsi, hyunsinum)
        console.log("phase3");
    }else if(trafficTime < datajson.c04){
        cnum = "c04";
        befcnum = "c03";
        hyunsi = 2;
        hyunsinum = "c03";
        fillDynamicTrafficData(cnum, trafficTime, befcnum, hyunsi, hyunsinum)
        console.log("phase4");
    }else if(trafficTime < datajson.c05){
        cnum = "c05";
        befcnum = "c04";
        hyunsi = 3;
        hyunsinum = "c05";
        fillDynamicTrafficData(cnum, trafficTime, befcnum, hyunsi, hyunsinum)
        console.log("phase5");
    }else if(trafficTime < datajson.c06){
        cnum = "c06";
        befcnum = "c05";
        hyunsi = 3;
        hyunsinum = "c05";
        fillDynamicTrafficData(cnum, trafficTime, befcnum, hyunsi, hyunsinum)
        console.log("phase6");
    }else if(trafficTime < datajson.c07){
        cnum = "c07";
        befcnum = "c06";
        hyunsi = 4;
        hyunsinum = "c07";
        fillDynamicTrafficData(cnum, trafficTime, befcnum, hyunsi, hyunsinum)
        console.log("phase7");
    }else if(trafficTime < datajson.c08){
        cnum = "c08";
        befcnum = "c07";
        hyunsi = 4;
        hyunsinum = "c07";
        fillDynamicTrafficData(cnum, trafficTime, befcnum, hyunsi, hyunsinum)
        console.log("phase8");
    }
    console.log(trafficTime);
}

function fillStaticBusData()
{
    uint8View[0] = 0x09; //TYPE: OPT DATA의 형식을 지정하는 보드 타입. 신호정보 송출장치이므로 0x09
    uint8View[1] = 0; //VENDER: 장치의 제조자 코드
    uint8View[2] = 0; //RUN: run 상태 판단 값
    uint8View[3] = 1; //ReqSigInfo: 1이면 CPU는 TYPE상관없이 신호운영상태(sigdata)를 제공한다.
    uint8View[4] = 0; //RelayMsg: 센터와 옵션보드간 중개 처리되는 메시지
    uint8View[5] = 0; //ReadSize: 'RW DATA'번지로 부터 size만큼 읽음
    uint8View[6] = 0; //WriteSize: 'RW DATA 번지에 기록
    //7~15: 예약
    //16~255: OPT DATA영역, 옵션장치에서 생성된 정보를 저장하는 주소 범위
    //256~383: RW DATA영역, 옵션보드와 CPU의 데이터 교환 영역
    //384~511: SIG DATA영역, 신호운영상태를 필요로 하는 옵션장치에게 운영정보를 전달하는 주소 범위
    //*384~391: 방향신호등 출력 상태
    //*392~399: 보행신호 잔여시간 (초)
    //400~407: A링 현시별 할당 시간 (초)
    uint8View[400] = datajson.c0105 + datajson.c0205;
    uint8View[401] = datajson.c0305 + datajson.c0405;
    uint8View[402] = datajson.c0505 + datajson.c0605;
    uint8View[403] = datajson.c0705 + datajson.c0805;
    //408~415: B링 현시별 할당 시간 (초)
    uint8View[408] = datajson.c0111 + datajson.c0211;
    uint8View[409] = datajson.c0311 + datajson.c0411;
    uint8View[410] = datajson.c0511 + datajson.c0611;
    uint8View[411] = datajson.c0711 + datajson.c0811;
    //416~423: A,B링 방향별(직진) 현시 번호 -- 지금은 정적인 데이터를 직접 넣었다.
    uint8View[416] = 11; //북 B링 3현시
    uint8View[417] = 1; //동 A링 1현시
    uint8View[418] = 3; //남 A링 3현시
    uint8View[419] = 9; //서 B링 1현시
    //424~431: A,B링 방향별(좌회전) 현시 번호
    uint8View[424] = 4; //북 A링 4현시
    uint8View[425] = 10; //동 B링 2현시
    uint8View[426] = 12; //남 B링 4현시
    uint8View[427] = 2; //서 A링 2현시
    //*432~439: 신호운영 상태변수
    //440~447: A링 현시별 최소녹색시간
    uint8View[440] = datajson.c0106 + datajson.c0206;
    uint8View[441] = datajson.c0306 + datajson.c0406;
    uint8View[442] = datajson.c0506 + datajson.c0606;
    uint8View[443] = datajson.c0706 + datajson.c0806;
    //448~455: B링 현시별 최소녹색시간
    uint8View[448] = datajson.c0112 + datajson.c0212;
    uint8View[449] = datajson.c0312 + datajson.c0412;
    uint8View[450] = datajson.c0512 + datajson.c0612;
    uint8View[451] = datajson.c0712 + datajson.c0812;
    //456~463: A링 현시별 포화도 (평균)
    //464~471: B링 현시별 포화도 (평균)
    //472~479: 시스템 정보
}

function trafficLightBinary(value)
{
    var bin = 0;

    if(value == 1){//좌회전
        bin = 1 << 2;
    }else if(value == 2){//보행자
        bin = 1 << 5;
    }else if(value == 10){//직진
        bin = 1 << 1;
    }else if(value == 20){//노란불은 예약번호에 할당한다.
        bin = 1 << 0;
    }

    return bin;
}

function fillDynamicTrafficData(cnum, trafficTime, befcnum, hyunsi, hyunsinum) {
    //*384~391: 방향신호등 출력 상태 bit0: 노란색 추가.
    uint8View[384] = trafficLightBinary(datajson[cnum+"01"] + datajson[cnum+"07"]);
    uint8View[385] = trafficLightBinary(datajson[cnum+"02"] + datajson[cnum+"08"]);
    uint8View[386] = trafficLightBinary(datajson[cnum+"03"] + datajson[cnum+"09"]);
    uint8View[387] = trafficLightBinary(datajson[cnum+"04"] + datajson[cnum+"10"]);
    //*392~399: 보행신호 잔여시간 (초)
    if (uint8View[384] == 32) {
        uint8View[392] = parseInt(datajson[cnum] - trafficTime);
    }
    if (uint8View[385] == 32) {
        uint8View[393] = parseInt(datajson[cnum] - trafficTime);
    }
    if (uint8View[386] == 32) {
        uint8View[394] = parseInt(datajson[cnum] - trafficTime);
    }
    if (uint8View[387] == 32) {
        uint8View[395] = parseInt(datajson[cnum] - trafficTime);
    }
    //*432~439: 신호운영 상태변수
    
    uint8View[432] = parseInt(trafficTime - datajson[befcnum]); //현 주기 카운터
    uint8View[433] = (hyunsi << 4) + hyunsi//현시번호 B링 + A링
    uint8View[434] = parseInt(trafficTime - datajson[hyunsinum]);//A링 현시 카운터
    uint8View[435] = parseInt(trafficTime - datajson[hyunsinum]);//B링 현시 카운터
}

