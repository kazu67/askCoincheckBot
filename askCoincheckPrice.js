function replyJudging(message){ 
  if (message.match(/cc|coincheck/g)) {
    var rtn = coincheckAsk(message);
  } else {
    var rtn = null
  }
  return rtn
}
//発言に"cc"もしくは"coincheck"が含まれる場合は、以下トリガーが引かれる。

function coincheckAsk(message) {
  var searchName = message.replace(/@money\-sosai\+ /,"").replace(/cc |coincheck /g, "");
  //発言からbotの名前を消す＆また"CC", "coincheck"の文字列を消す

  var coincode
  var btc = ['bitcoin','btc','btc_jpy','bitco','ビットコイン'];
  var eth = ['ethereum', 'eth', 'ether', 'イーサ', 'イーサリウム'];
  var etc = ['ethereum classic', 'etc', 'イサクラ'];
  var lsk = ['lisk', 'lsk', 'リスク'];
  var ftc = ['factom', 'ftc', 'ファクトム'];
  var xmr = ['monero', 'xmr', 'モネロ'];
  var rep = ['rep', 'Auger', 'auger', 'オーガー'];
  var xrp = ['xrp', 'ripple','北尾','sbi','sbiコイン','北尾吉孝','リップル'];
  var zec = ['zcash', 'zec', 'ゼットキャッシュ'];
  var xem = ['xem', 'nem', 'ネム']; 
  var ltc = ['litecoin', 'ltc', 'ライトコイン'];
  var dash = ['dsh', 'dash', 'ダッシュ'];
  var bch = ['bch', 'bitcoincash', 'bitcoin cash','ビットコインキャッシュ'];
  //各通貨のトリガーとなる文字列を設定

  if (btc.indexOf(searchName) != -1)[coincode = 'btc_jpy'];
  if (eth.indexOf(searchName) != -1)[coincode = 'eth_jpy'];
  if (etc.indexOf(searchName) != -1)[coincode = 'etc_jpy'];
  if (lsk.indexOf(searchName) != -1)[coincode = 'lsk_jpy'];
  if (ftc.indexOf(searchName) != -1)[coincode = 'ftc_jpy'];
  if (xmr.indexOf(searchName) != -1)[coincode = 'xmr_jpy'];
  if (rep.indexOf(searchName) != -1)[coincode = 'rep_jpy'];
  if (xrp.indexOf(searchName) != -1)[coincode = 'xrp_jpy'];
  if (zec.indexOf(searchName) != -1)[coincode = 'zec_jpy'];
  if (xem.indexOf(searchName) != -1)[coincode = 'xem_jpy'];
  if (ltc.indexOf(searchName) != -1)[coincode = 'ltc_jpy'];
  if (dash.indexOf(searchName) != -1)[coincode = 'dash_jpy'];
  if (bch.indexOf(searchName) != -1)[coincode = 'bch_jpy'];
  
  if (coincode === undefined){
    var content = "申し訳ない。" + searchName + " が見つかりませんでした";  
  }else{
    var url = "https://coincheck.com/api/rate/"+coincode+"/";
    var json = UrlFetchApp.fetch(url).getContentText();
    var jsonData = JSON.parse(json);
    var price = Math.ceil(jsonData["rate"]);
    var content = coincode + "：現在の価格は" + price + "円です";
  }
  return content;
  //コインの文字列が含まれない場合は、見つからない発言の文字列を作成する。
  //見つかった場合はAPIから価格をfetchして、返信用文字列を作成。
}  
  

var Typetalk = {
  getMessage: function (e) {
    var data = e.postData && JSON.parse(e.postData.getDataAsString());
    return data && data.post;
  },
  composeReplyMessage: function (message, postId) {
    var response = {
      "message" : message,
      "replyTo" : postId
    };
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
 
function doPost(e) {
  Logger.log(e);
  try {
    var post = Typetalk.getMessage(e);
    if (post) {
      var message = replyJudging(post.message);
      if (message) {
        return Typetalk.composeReplyMessage(message, post.id);
      }
    }
  } catch(ex) {
    return Typetalk.composeReplyMessage(ex.toString(), null);
  }
}