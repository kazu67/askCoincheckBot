function replyJudging(message){ 
  if (message.match(/資産/g)) {
    var rtn = makeMessage();
  } else {
    var rtn = null
  }
  return rtn
}
//発言に「資産」が含まれる場合は、以下発動。

function makeMessage(){
  var balance = getBalance(); //以下functionからreturnで、円建て保有資産の数値が戻ってくる
  
  //Logger.log(balance[0]); 現在の日本円建て総額資産
  //Logger.log(balance[1]); 現在の各コインの日本円建て資産
  
  var message ="現在のCoincheckの資産総額は"+balance[0]+"円です";
  
  return message
}

  

//現在の円建て資産額を拾う関数
function getBalance(){
  
  var access = "*******"; //あなたのアクセスキーを入力
  var secret = "*******"; //あなたのアクセスシークレットを入力

  var date = new Date();
  var nonce = Math.floor((date.getTime()/1000)).toString(); //Unix時間をテキスト化
  var url = "https://coincheck.com/api/accounts/balance";  //リクエストURL
  
  var message = nonce+url;
  
  var sig = Utilities.computeHmacSha256Signature(message, secret);  //メッセージをHMAC-SHA256で暗号化

  var signature = sig.reduce(function(str,chr){
    chr = (chr < 0 ? chr + 256 : chr).toString(16);
    return str + (chr.length==1?'0':'') + chr;
  },'');   //Google Apps Scriptはバイト配列で暗号を返すので16進数化
   
  var headers = {
    "ACCESS-KEY":access,
    "ACCESS-NONCE":nonce,
    "ACCESS-SIGNATURE":signature
  }; //ヘッダー情報を格納

  var options = {
  "method": "get",
  "headers": headers,
  "contentType": "application/json"
  };

  var jsonBalanceData = UrlFetchApp.fetch(url, options);  //HTTPリクエスト

  var balance = JSON.parse(jsonBalanceData); //JSON形式をJSオブジェクト化
  var convertBalance = balanceJPY(balance);
  
  return convertBalance
}

//日本円換算し、円建ての合計所持額を算出＆各通貨の所持額のオブジェクトを作成する
function balanceJPY(balance){ 
  
  var balanceObj = {} ; //オブジェクトとして入れる
  
  var array = ['btc', 'eth', 'etc', 'lsk', 'fct', 'rep', 'xrp', 'zec', 'xrp', 'ltc', 'dash', 'bch'];
  //オブジェクトから呼び出すための文字列を配列にする
  
  balanceObj["jpy"] = balance.jpy;  //日本円資産

  var balanceArray= []
  
  for (var i = 0; i < array.length; ++i) {
    var result = Math.ceil(currencyConverter(balance[array[i]], array[i]+"_jpy"));
    //各通貨の保有枚数を以下関数に送り、円建ての保有額が返ってくる
    
    balanceArray.push(result);　//円の保有額を配列に入れる
    balanceObj[array[i]] = result; //オブジェクト"balanceObj"をキーに各通貨名、値に円建ての保有額を入れる
  }
  
  var balanceSum = Math.ceil(balance.jpy) + balanceArray.reduce(function(p, c){
  return p + c
  }); //各通貨を資産を円建てで合計したもの
                                    
  return[balanceSum, balanceObj] 
}
  
function currencyConverter(currency, currencyID){
  var url = "https://coincheck.com/api/rate/"+currencyID+"/";　//各通貨のレートをフェッチする
  var json = UrlFetchApp.fetch(url).getContentText();
  var rateData = JSON.parse(json);　
  var balance = rateData.rate * currency;
  
  return balance
}