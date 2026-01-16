/**
 * 麦当劳图片体积过滤器 - cmkachun
 * 策略：严格拦截大于 60KB 的大图，放行 UI 小图
 */

const sizeLimit = 60 * 1024; // 设定阈值为 60KB
let header = $response.headers;
let contentLength = header['Content-Length'] || header['content-length'];

if (contentLength) {
    let size = parseInt(contentLength);
    if (size > sizeLimit) {
        // 超过 60KB 判定为广告
        console.log(`cmkachun: 拦截广告大图 (体积: ${(size/1024).toFixed(2)} KB)`);
        $done({ status: "HTTP/1.1 404 Not Found" });
    } else {
        // 小于 60KB 视为 UI 图标，直接原样放行
        $done({});
    }
} else {
    // 缺失长度字段时默认放行，确保 UI 显示
    $done({});
}
