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

var lasttimeA;
var lastphaseA;
var lasttimeB;
var lastphaseB;

function updateJSONdataBySigmapdata(messageString) {
    const jsonData = JSON.parse(messageString);
    console.log("traffic data updated");
    var i = 0;

    //A링
    var timesumA = 0;
    var timesumA2 = 0;
    for(var hysi = 1; hysi <= 4; hysi++)
    {
        for(var mphase = 1; mphase <= jsonData['n' + hysi]; mphase++)
        {
            // t1h1m
            i++;
            jsonData["tA"+i] = timesumA + Number(jsonData['c'+hysi+'h'+mphase+'m5s']);
            jsonData["tAinfo"+i] = ''+hysi+'h'+mphase+'m';
            timesumA = jsonData["tA"+i];
        }
        jsonData["thyunsiA"+hysi] = timesumA - timesumA2;
        timesumA2 = timesumA;
    }
    lastphaseA = i;
    i = 0;
    lasttimeA = timesumA;

    //B링
    var timesumB = 0;
    var timesumB2 = 0;
    for(var hysi = 1; hysi <= 4; hysi++)
    {
        for(var mphase = 1; mphase <= jsonData['n' + hysi]; mphase++)
        {
            // t1h1m
            i++;
            jsonData["tB"+i] = timesumB + Number(jsonData['c'+hysi+'h'+mphase+'m11s']);
            jsonData["tBinfo"+i] = ''+hysi+'h'+mphase+'m';
            timesumB = jsonData["tB"+i];
        }
        jsonData["thyunsiB"+hysi] = timesumB - timesumB2;
        timesumB2 = timesumB;
    }
    lastphaseB = i;
    i = 0;
    lasttimeB = timesumB;

    if(lasttimeA != lasttimeB){
        console.log("A링 총시간:"+lasttimeA+"  B링 총시간:"+lasttimeB);
        console.error("2중링간의 총 현시 시간이 일치하지 않습니다.");
        process.exit();
    }

    uint8View.fill(0);
    startTime = new Date().getTime();

    //정적인 데이터는 여기서 채워 넣어준다.
    fillStaticBusData();

    return jsonData;
}

function createBinarydataByJSONdata() {
    
    var curtime = new Date().getTime();
    elapsedtime = curtime - startTime;
    trafficTime = (elapsedtime/1000) % lasttimeA;
    var tmpstr = "";//ex) 1h1m
    var hidx = -1;
    var midx = -1;
    var beftimesum = 0;//이전 phase의 마지막 timesum
    var hyunsi = 0;//현시 int값
    var curtimesum = 0;//현재 phase의 마지막 timesum
    var ring = 'A';

    for(var p = 1; p <= lastphaseA; p++)
    {
        ring = 'A';
        if(trafficTime < datajson["tA"+p]){
            tmpstr = datajson["tAinfo"+p];
            hidx = tmpstr.indexOf("h");
            hyunsi = tmpstr.charAt(hidx-1);
            midx = tmpstr.indexOf("m");

            if(p == 1){
                beftimesum = 0;
            }else{
                pt = p - 1;
                beftimesum = Number(datajson["tA"+pt]);
            }
            curtimesum = datajson["tA"+hyunsi];
            fillDynamicTrafficData(tmpstr, trafficTime, hyunsi, beftimesum, curtimesum, ring);
            console.log("A링 현시: "+hyunsi+"현시   A링 phase: "+p);
            break;
        }
    }

    for(var p = 1; p <= lastphaseB; p++)
    {
        ring = 'B';
        if(trafficTime < datajson["tB"+p]){
            tmpstr = datajson["tBinfo"+p];
            hidx = tmpstr.indexOf("h");
            hyunsi = tmpstr.charAt(hidx-1);
            midx = tmpstr.indexOf("m");

            if(p == 1){
                beftimesum = 0;
            }else{
                pt = p - 1;
                beftimesum = Number(datajson["tB"+pt]);
            }
            curtimesum = datajson["tB"+hyunsi];
            fillDynamicTrafficData(tmpstr, trafficTime, hyunsi, beftimesum, curtimesum, ring);
            console.log("B링 현시: "+hyunsi+"현시   B링 phase: "+p);
            break;
        }
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
    uint8View[400] = datajson["thyunsiA1"];
    uint8View[401] = datajson["thyunsiA2"];
    uint8View[402] = datajson["thyunsiA3"];
    uint8View[403] = datajson["thyunsiA4"];
    //408~415: B링 현시별 할당 시간 (초)
    uint8View[408] = datajson["thyunsiB1"];
    uint8View[409] = datajson["thyunsiB2"];
    uint8View[410] = datajson["thyunsiB3"];
    uint8View[411] = datajson["thyunsiB4"];
    //416~423: A,B링 방향별(직진) 현시 번호 -- 지금은 정적인 데이터를 직접 넣었다.
    // uint8View[416] = 11; //북 B링 3현시
    // uint8View[417] = 1; //동 A링 1현시
    // uint8View[418] = 3; //남 A링 3현시
    // uint8View[419] = 9; //서 B링 1현시
    //424~431: A,B링 방향별(좌회전) 현시 번호
    // uint8View[424] = 4; //북 A링 4현시
    // uint8View[425] = 10; //동 B링 2현시
    // uint8View[426] = 12; //남 B링 4현시
    // uint8View[427] = 2; //서 A링 2현시
    //*432~439: 신호운영 상태변수
    //440~447: A링 현시별 최소녹색시간
    // uint8View[440] = datajson.c0106 + datajson.c0206;
    // uint8View[441] = datajson.c0306 + datajson.c0406;
    // uint8View[442] = datajson.c0506 + datajson.c0606;
    // uint8View[443] = datajson.c0706 + datajson.c0806;
    //448~455: B링 현시별 최소녹색시간
    // uint8View[448] = datajson.c0112 + datajson.c0212;
    // uint8View[449] = datajson.c0312 + datajson.c0412;
    // uint8View[450] = datajson.c0512 + datajson.c0612;
    // uint8View[451] = datajson.c0712 + datajson.c0812;
    //456~463: A링 현시별 포화도 (평균)
    //464~471: B링 현시별 포화도 (평균)
    //472~479: 시스템 정보
}

function trafficLightBinary(value)
{
    var bin = 0;

    if(value%10 == 1){//좌회전(01)
        bin += 1 << 2;
    }if(parseInt(value/10) == 1){//직진(10)
        bin += 1 << 1;
    }if(parseInt(value/10) == 2){//노란불은 예약번호(0번)에 할당한다.(20)
        bin += 1 << 0;
    }if(value%10 == 2){//보행자(02)
        bin += 1 << 5;
    }
    console.log(bin);
    return bin;
}
var A1tmp;
var A2tmp;
var A3tmp;
var A4tmp;

function fillDynamicTrafficData(str, trafficTime, hyunsi, beftimesum, curtimesum, ring) {
    
    if(ring == 'A'){
        A1tmp = Number(datajson["c"+str+"1s"]);
        A2tmp = Number(datajson["c"+str+"2s"]);
        A3tmp = Number(datajson["c"+str+"3s"]);
        A4tmp = Number(datajson["c"+str+"4s"]);
        //*432~439: 신호운영 상태변수
        //현시번호 B링 + A링
        uint8View[433] = hyunsi;
        //A링 현시 카운터
        uint8View[434] = parseInt(trafficTime - beftimesum);
    }else if(ring == 'B'){//항상 A링을 처리 후 B링을 처리한다고 가정.
        //*384~391: 방향신호등 출력 상태 bit0: 노란색 추가.
        uint8View[384] = trafficLightBinary(A1tmp + Number(datajson["c"+str+"7s"]));
        uint8View[385] = trafficLightBinary(A2tmp + Number(datajson["c"+str+"8s"]));
        uint8View[386] = trafficLightBinary(A3tmp + Number(datajson["c"+str+"9s"]));
        uint8View[387] = trafficLightBinary(A4tmp + Number(datajson["c"+str+"10s"]));
        console.log("ring "+uint8View[384]+" "+uint8View[385]+" "+uint8View[386]+" "+uint8View[387]);
        //*432~439: 신호운영 상태변수
        //현시번호 B링 + A링
        uint8View[433] += hyunsi << 4;
        //B링 현시 카운터
        uint8View[435] = parseInt(trafficTime - beftimesum);
    }
    //*392~399: 보행신호 잔여시간 (초)
    if (uint8View[384] == 32) {
        uint8View[392] = parseInt(curtimesum - trafficTime);
    }
    if (uint8View[385] == 32) {
        uint8View[393] = parseInt(curtimesum - trafficTime);
    }
    if (uint8View[386] == 32) {
        uint8View[394] = parseInt(curtimesum - trafficTime);
    }
    if (uint8View[387] == 32) {
        uint8View[395] = parseInt(curtimesum - trafficTime);
    }
    
    uint8View[432] = parseInt(trafficTime); //현 주기 카운터
}

