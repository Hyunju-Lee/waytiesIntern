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
#include <unistd.h>
#include "trafficData.h"

#define MAXLINE 511 //최대값 지정
#define BLOCK 1000  //BLOCK 단위로 저장

char trafficdata[100];

void getTrafficData()
{
    char buf[MAXLINE + 1];
    FILE *stream; //파일 입출력

    if ((stream = fopen("../buff.txt", "r")) == NULL)
    { //파일을 open
        printf("Error");
        exit(1);
    }

    fgets(buf, BLOCK, stream);
    if (strncmp(buf, "NULL", 4) == 0)
    {
        fclose(stream);
        return;
    }
    else
    {
        rewind(stream);
        fgets(buf, BLOCK, stream);       //buffer에 BLOCK 만큼 읽어들임
        printf("\n\n수신:\n %s\n", buf); //보낼 메시지 출력

        //test
        trafficdata[0] = '0';
        trafficdata[2] = '1';
        trafficdata[1] = '2';
        trafficdata[3] = '\0';
        fclose(stream);

        if ((stream = fopen("../buff.txt", "w")) == 0)
        {
            printf("Fail open error\n");
            exit(1);
        }

        fputs("NULL", stream); //파일 NULL로 초기화, 저장
        fclose(stream);
    }

    return;
}