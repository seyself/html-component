'use strict';

function HtmlComponent() {

}

/** 初期化処理 */
HtmlComponent.prototype.init = function(){
    //TODO: プロジェクトを作成する
};

/** GitHubからコンポーネントを追加する */
HtmlComponent.prototype.install = function(){
    //TODO: 未実装
};

/** コンポーネントを削除する */
HtmlComponent.prototype.uninstall = function(){
    //TODO: 未実装
};

/** コンポーネントを新規作成 */
HtmlComponent.prototype.create = require('./lib/create.js');

/** コンポーネントを使ったHTMLを書き出す */
HtmlComponent.prototype.build = function(){
    //TODO: gulp-html-componentから処理を移す
};

module.exports = new HtmlComponent();

