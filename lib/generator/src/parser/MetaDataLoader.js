
import RESTClient from 'node-rest-client';

export default class MetaDataLoader
{
  constructor(){}

  getSpreadSheetURL(options)
  {
    if(!options) return null;
    if(!options.root) return null;
    return options.root.docs_url || null;
  }

  loadSpreadSheet(url, callback)
  {
    var metaData = {};
    try{
      var client = new RESTClient.Client();
      client.get(url, function(data, response){
        try{
          if(data){
            var tsv = String(data).split('\r\n');
            var len = tsv.length;

            var tmpArray=[];
            for(var j=0; j<len; j++){
              tmpArray.push(j);
            }
            for(var i in tmpArray){
              var cols = tsv[i].split('\t');
              var key = cols[1];
              var value = cols[2];
              metaData[key] = value;
            }
          }
        }catch(e){
          console.log('Parse Error : Google Spreadsheets');
        }
        if(callback){
          callback(metaData);
        }
      });
    }catch(e){
      console.log('Load Error : Google Spreadsheets');
      if(callback){
        callback(null);
      }
    }
  }
}
