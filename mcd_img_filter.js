/**
 * 麦当劳图片体积过滤器 - cmkachun
 * 逻辑：大于 45KB 的图片判定为广告并拦截，小于此值的 UI 图标直接放行
 */

const sizeLimit = 45 * 1024; // 阈值设定为 45KB
let header = $response.headers;
let contentLength = header['Content-Length'] || header['content-length'];

if (contentLength) {
    let size = parseInt(contentLength);
    if (size > sizeLimit) {
        console.log(`cmkachun: 成功拦截大图广告 (${(size/1024).toFixed(2)} KB)`);
        // 使用 404 拒绝大图请求
        $done({ status: "HTTP/1.1 404 Not Found", headers: header });
    } else {
        // 小图 UI 直接原样放行，不做任何修改
        $done({});
    }
} else {
    // 缺失长度信息的默认放行
    $done({});
}
