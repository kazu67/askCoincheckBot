function myFunction() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    var balance = getBalance();
    var balanceObj = balance[0];
    
    var addRow = sheet.getLastRow()+1
    sheet.getRange(addRow, 1).setValue(balanceObj);
    sheet.getRange(addRow, 2).setValue(Math.ceil(balanceObj / 10000) * 10000); 
    //シート1列目に現在の円建て総額をset, 2列目に10000円の桁で切り上げた額をsetする
    
    var checkRow = sheet.getLastRow()

    if ( sheet.getRange(checkRow, 1).getValue() > sheet.getRange(checkRow-1, 2).getValue() ){
    var message = "@kazu67 Coincheckの保有残高が"+ Math.floor(balanceObj / 10000) * 10000+"円を超えました" + "\n現在の残高は"+balanceObj+"円です";
    notifyMessage(message);
    } //もし新規でフェッチした円建て総額が、前回設定した切り上げ額より上回っている場合にお知らせする
  }
  
  function notifyMessage(text){
    var TOKEN = '*******************'; //Typetalk botトークン
    var data = {
      'message' : text
    }
    var topicId = '*****'; //Typetalk topicID
    var options = {
      'method'     : 'post',
      'contentType': 'application/x-www-form-urlencoded',
      'payload'    : data
    };
    var url = 'https://typetalk.com' + '/api/v1/topics/' + topicId + '?typetalkToken=' + TOKEN;
    var res = UrlFetchApp.fetch(url, options);
  }
  
  
  function getBalance(){
    var access = "*******************"; //あなたのアクセスキーを入力
    var secret = "*******************"; //あなたのアクセスシークレットを入力
  
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
    "method": "get",  //postかgetか
    "headers": headers,
    "contentType": "application/json"
    };
  
    var jsonBalanceData = UrlFetchApp.fetch(url, options);  //HTTPリクエスト
  
    var balance = JSON.parse(jsonBalanceData);
    var convertBalance = balanceJPY(balance);
    
    return convertBalance
  }
  
  function balanceJPY(balance){   
    var balanceObj = {} ;
    var array = ['btc', 'eth', 'etc', 'lsk', 'fct', 'rep', 'xrp', 'zec', 'xrp', 'ltc','dash', 'bch'];
    balanceObj["jpy"] = balance.jpy; 
    var balanceArray= []
    
    for (var i = 0; i < array.length; ++i) {
      var result = Math.ceil(currencyConverter(balance[array[i]], array[i]+"_jpy"));
      balanceArray.push(result);
      balanceObj[array[i]] = result;
    }
    
    var balanceSum = Math.ceil(balance.jpy) + balanceArray.reduce(function(p, c){
    return p + c
    });
    return[balanceSum, balanceObj]
  }
    
  function currencyConverter(currency, currencyID){
    var url = "https://coincheck.com/api/rate/"+currencyID+"/";
    var json = UrlFetchApp.fetch(url).getContentText();
    var rateData = JSON.parse(json);
    var balance = rateData.rate * currency;  
    return balance
  }