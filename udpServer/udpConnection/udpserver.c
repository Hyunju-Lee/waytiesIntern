//--------------------------------------------------------------
// file Name : udp_echoserv.c
// command : cc -o udp_echoserv  udp_echoserv.c
// server 시작 : udp_echoserv  9999
// client에서 전송되는 메시지를 buf.txt 에 저장하고, 다시 client로 전송 후 유효성 체크
//--------------------------------------------------------------
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <sys/time.h>
#include "trafficData.h"
#include <time.h>

#define MAXLINE 511
#define BLOCK 255
#define FILENAME "buf.txt"

extern char trafficdata[100];
extern void getTrafficData();

int main(int argc, char *argv[])
{
    struct sockaddr_in servaddr, cliaddr;
    int s, nbyte, addrlen = sizeof(struct sockaddr);
    char buf[MAXLINE + 1];

    //udp receive socket timeout: 5sec
    struct timeval optVal = {5, 0};
    int optLen = sizeof(optVal);

    //파일명 포트번호
    if (argc != 2)
    {
        printf("usage: %s port\n", argv[0]);
        exit(0);
    }

    //소켓 생성
    if ((s = socket(PF_INET, SOCK_DGRAM, 0)) < 0)
    {
        perror("socket fail");
        exit(0);
    }

    setsockopt(s, SOL_SOCKET, SO_RCVTIMEO, &optVal, optLen);

    // 서버 구조
    memset(&cliaddr, 0, addrlen);  //bzero((char *)&cliaddr, addrlen);
    memset(&servaddr, 0, addrlen); //bzero((char *)&servaddr,addrlen);
    servaddr.sin_family = AF_INET;
    servaddr.sin_addr.s_addr = htonl(INADDR_ANY);
    servaddr.sin_port = htons(atoi(argv[1])); //argv[1]에서 port 번호 가지고 옴

    // 서버 로컬 주소로 bind()
    if (bind(s, (struct sockaddr *)&servaddr, addrlen) < 0)
    {
        perror("bind fail");
        exit(0);
    }

    while (1)
    {
        while (1)
        {
            time_t t = time(NULL);
		    struct tm tm = *localtime(&t);

		    printf("\n%d-%d-%d %d:%d:%d\n", tm.tm_year+1900, tm.tm_mon+1, tm.tm_mday, tm.tm_hour, tm.tm_min, tm.tm_sec);

            getTrafficData();
            //받은 데이터를 아래 문장으로 보낸다.

            puts("\nServer : waiting request.");
            //전송 받은 메시지 nbyte 저장
            nbyte = recvfrom(s, buf, MAXLINE, 0, (struct sockaddr *)&cliaddr, &addrlen);
            if (nbyte < 0)
            {
                perror("recvfrom fail ");
                // exit(1);
            }
            else
            {
                printf("\n(address) from %x\n", cliaddr.sin_addr.s_addr);
                buf[nbyte] = '\0'; //마지막 값에 null

                printf("%d byte recv: %s\n", nbyte, buf);
                break;
            }
        }

        if (sendto(s, trafficdata, strlen(trafficdata), 0, (struct sockaddr *)&cliaddr, addrlen) < 0)
        {
            perror("sendto fail");
            exit(0);
        }
    }

    close(s);
    return 0;
}