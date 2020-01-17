//--------------------------------------------------------------
// client : udp_echocli.c
// command : cc -o udp_echocli  udp_echocli.c
// localip : udp_echocli  127.0.0.1 8999
// Client 소스코드 파일을 열어서 서버에 전송 및 저장하고, 다시 읽어 들여
// 유효성 체크를 하는 코드
//--------------------------------------------------------------
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <time.h>

#define MAXLINE 511 //최대값 지정
#define BLOCK 255   //BLOCK 단위로 저장

struct sockaddr_in servaddr;
int addrlen = sizeof(servaddr); //서버 주소의 size를 저장

//메시지 전송 부분 처리
void sendMessage(int s, char *buf)
{
	if ((sendto(s, buf, strlen(buf), 0, (struct sockaddr *)&servaddr, addrlen)) < 0)
	{
		perror("sendto fail");
		exit(0);
	}
}

int main(int argc, char *argv[])
{
	int s; //socket
	int nbyte;
	char buf[MAXLINE + 1], buf2[MAXLINE + 1];
	// FILE* stream;

	//./udp_echocli.c ip주소, 포트번호, 입출력 파일명
	if (argc != 4)
	{
		printf("usage: %s ip_address port_number filename\n", argv[0]);
		exit(0);
	}

	//socket 연결 0보다 작으면 Error
	if ((s = socket(PF_INET, SOCK_DGRAM, 0)) < 0)
	{
		perror("socket fail");
		exit(0);
	}

	//서버 주소 구조
	memset(&servaddr, 0, addrlen);				   //bzero((char *)&servaddr, sizeof(servaddr));
	servaddr.sin_family = AF_INET;				   //인터넷 Addr Family
	servaddr.sin_addr.s_addr = inet_addr(argv[1]); //argv[1]에서 주소를 가져옴
	servaddr.sin_port = htons(atoi(argv[2]));	  //argv[2]에서 port를 가져옴

	buf[0] = 'c'; //buffer를 초기화 ('c': connect, 'd':disconnect)
	buf[1] = '\0';
	

	while (1)
	{
		time_t t = time(NULL);
		struct tm tm = *localtime(&t);

		printf("\n%d-%d-%d %d:%d:%d\n", tm.tm_year+1900, tm.tm_mon+1, tm.tm_mday, tm.tm_hour, tm.tm_min, tm.tm_sec);

		printf("\nSend : %s\n", buf); //보낼 메시지 출력 (connect)
		sendMessage(s, buf);
		if ((nbyte = recvfrom(s, buf2, MAXLINE, 0, (struct sockaddr *)&servaddr, &addrlen)) < 0)
		{
			perror("recvfrom fail");
			exit(1);
		}
		buf2[nbyte] = '\0';
		printf("\nreceive: %s", buf2);
		fflush(stdout);
		sleep(1);
	}

	close(s); //socket close
	return 0;
}