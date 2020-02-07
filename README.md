#waytiesInternProject

##3개의 nodejs실행파일로 이루어져있습니다.
##adminwebserver의 server.js는 신호발생기 에뮬레이터 UI, 
##udpServer의 nodeUDPserver.js는 신호발생기 에뮬레이터 udpserver,
##udpClient의 nodeUDPclient.js는 신호수신기 udpclient + 신호등 UI입니다.


###***server.js***

adminwebserver의 server.js는 신호발생기 에뮬레이터의 UI부분입니다.
UI에서 signalmap을 이용하여 신호발생을 구현합니다. 
리눅스 터미널을 열고 node server.js를 입력하여 웹서버를 열 수 있습니다.
기본 웹서버 포트는 3000번입니다. localhost:3000이나 127.0.0.1로 에뮬레이터 UI를 볼 수 있습니다.
signalmap을 채우고 신호발생을 누르면 텍스트 버퍼(buff.txt)에 json형으로 신호발생에 필요한 값들이 입력됩니다.
나중에 이 버퍼를 이용하여 udpserver에서 신호를 주기적으로 발생시킬 수 있도록 합니다. 
화면 구성 부분은 html과 jquery, ajax가 이용되었고 서버측은 http와 express가 이용되었습니다.


###***nodeUDPserver.js***

udpServer의 nodeUDPserver.js는 신호발생기 에뮬레이터 udpserver입니다.
신호발생에 필요한 값들을 주기적으로 polling하여 읽습니다.
읽은 값들을 해석하여 교통신호버스데이터형식에 맞게 json데이터를 byte데이터로 파싱을 합니다. (512byte)
파싱을 한 데이터를 udpclient가 연결을 요청을 할 때마다 udp통신을 하여 주기적으로 보내줍니다.
리눅스 터미널을 열고 node server.js를 입력하여 udp서버를 열 수 있습니다.
기본 udp서버 포트는 4000번입니다. 
udp통신을 하기 위하여 nodejs의 dgram과 udp4가 사용되었습니다.

###***nodeUDPclient.js***

udpClient의 nodeUDPclient.js는 신호수신기 udpclient + 신호등 UI입니다.
주기적으로 udpserver에 연결요청을하여 신호데이터를 받아옵니다.
byte데이터를 해석하여 필요한 값들을 추출합니다.
추출한 값들을 http소켓을 이용하여 클라이언트로 넘겨줍니다.
클라이언트에서 교통신호등 UI를 실시간으로 그려줍니다. localhost:3001을 통해 확인할 수 있습니다.
리눅스 터미널을 열고 node nodeUDPclient.js 127.0.0.1 4000를 입력하여 udp서버를 통신시키며 열 수 있습니다.
기본 웹서버 포트는 3001번입니다. 
udp통신을 하기 위하여 nodejs의 dgram과 udp4가 사용되었습니다.
실시간으로 그려주기 위하여 socket.io와 http가 사용되었습니다.

###***udp통신 서버와 클라이언트***

교통신호발생기와 신호를 수신하여 UI를 그려주는 폴더를 따로 구성하여 응용할 수 있습니다.
만약 교통신호발생기가 있다면 nodeUDPclient.js만, 교통신호 수신 시스템이 있다면 server.js와 nodeUDPserver.js만 사용할 수 있습니다.
실제로 127.0.0.1이 아닌, 이더넷 케이블 등을 통하여 통신을 할 수 있는 환경이라면 서버와 클라이언트 폴더를 분리하여 사용하면 됩니다.



 
