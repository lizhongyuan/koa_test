'use strict';

const crypto = require('crypto');


var PKCS7Encoder = {};

/**
 * 删除解密后明文的补位字符
 *
 * @param {String} text 解密后的明文
 */
PKCS7Encoder.decode = function (text) {
    var pad = text[text.length - 1];
    
    if (pad < 1 || pad > 32) {
        pad = 0;
    }
    
    return text.slice(0, text.length - pad);
};


function decrypt(text, encodingAesKey) {
    // const aesKey = (new Buffer(encodingAesKey + '=', 'base64')).toString();
    const aesKey = new Buffer(encodingAesKey + '=', 'base64');
    const iv = aesKey.slice(0, 16);

    // 创建解密对象，AES采用CBC模式，数据采用PKCS#7填充；IV初始向量大小为16字节，取AESKey前16字节
    // var decipher = crypto.createDecipheriv('aes-256-cbc', this.key, this.iv);
    // var decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, );
    var decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);

    decipher.setAutoPadding(false);
    
    var deciphered = Buffer.concat([decipher.update(text, 'base64'), decipher.final()]);
    
    deciphered = PKCS7Encoder.decode(deciphered);
    // 算法：AES_Encrypt[random(16B) + msg_len(4B) + msg + $CorpID]
    // 去除16位随机数
    var content = deciphered.slice(16);
    var length = content.slice(0, 4).readUInt32BE(0);
    
    return {
        message: content.slice(4, length + 4).toString(),
        id: content.slice(length + 4).toString()
    };
}


const text = '7A/zVTmZ9V+xyd5HqoZVm/94PnA4EREBllY56lGzcVbKxyUfZEOyuM2IXTkmHYNwz9nN60qKZF265u8UMiKTRA==';
const encodingAesKey = '6TtfwQiphy8ykvUxm9UtiK2qFlb5MNtjF7tuv9erHwk';


console.log(decrypt(text, encodingAesKey));