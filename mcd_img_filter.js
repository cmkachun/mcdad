/**
 * 麦当劳图片体积过滤器 - cmkachun
 * 逻辑：拦截大于 40KB 的图片，放行 UI 图标
 */

const sizeLimit = 40 * 1024; // 设置阈值为 40KB
let header = $response.headers;
let contentLength = header['Content-Length'] || header['content-length'];

if (contentLength) {
    let size = parseInt(contentLength);
    if (size > sizeLimit) {
        console.log(`cmkachun: 拦截大图 (体积: ${(size/1024).toFixed(2)} KB)`);
        // 针对大图直接返回 404 或拦截
        $done({ status: "HTTP/1.1 404 Not Found", headers: header });
    } else {
        // 小于阈值，视为 UI 图标，直接放行
        $done({});
    }
} else {
    // 如果没有长度字段，默认放行防止误伤
    $done({});
}
