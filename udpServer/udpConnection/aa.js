  /*

  ArrayBuffer(20 bytes)
  8bit == 1 byte

  ArrayBuffer / 1 byte = 20;

   */
  var buffer = new ArrayBuffer(20);
  // 부호 없는 1 byte 정수 배열
  var uint8View = new Uint8Array(buffer);

  uint8View[0] = 1 << 0;
  console.log(uint8View); 
  uint8View[1] = 1 << 1;
  console.log(uint8View); 
  uint8View[2] = 0x10;
  console.log(uint8View); 
  uint8View.fill(0);
  console.log(uint8View); 
  // 20

  /*

   ArrayBuffer(20 bytes)
   32bit == 4 byte

   ArrayBuffer / 4 byte = 5;

   */
  // 부호 없는 4 byte 정수 배열
  var uint32View = new Uint32Array(buffer);

  console.log(uint32View); // 5