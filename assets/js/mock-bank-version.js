(()=>{
 'use strict';
 const preserved={n5:4,n4:2,n3:2};
 window.AponarMockBankVersion={
  current:9,
  compatible(level,test,version){
   return version===9||(version===8&&Number.isInteger(test)&&test>=1&&test<=(preserved[level]||0));
  }
 };
})();
