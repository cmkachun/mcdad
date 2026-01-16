/**
 * 麦当劳图片体积过滤器 - cmkachun
 * 策略：严格限制体积，只允许小图通过
 */

const sizeLimit = 20 * 1024; // 严格限制在 20KB
let header = $response.headers;
let contentLength = header['Content-Length'] || header['content-length'];

if (contentLength) {
    let size = parseInt(contentLength);
    if (size > sizeLimit) {
        // 大于 20KB 的 PNG/JPG 直接拦截
        console.log(`cmkachun: 拦截大图 (体积: ${(size/1024).toFixed(2)} KB)`);
        $done({ status: "HTTP/1.1 404 Not Found" });
    } else {
        // 5KB 左右的小图（UI图标）直接原样放行
        $done({});
    }
} else {
    // 缺失长度字段的默认放行
    $done({});
}
