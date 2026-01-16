/**
 * 麦当劳图片分辨率过滤器 - cmkachun
 * 策略：通过二进制头解析宽高，拦截长比例大图，放行 UI 小图
 */

function getDimensions(data) {
    let uint8 = new Uint8Array(data);
    // PNG 格式解析
    if (uint8[0] === 0x89 && uint8[1] === 0x50) {
        let width = (uint8[16] << 24) | (uint8[17] << 16) | (uint8[18] << 8) | uint8[19];
        let height = (uint8[20] << 24) | (uint8[21] << 16) | (uint8[22] << 8) | uint8[23];
        return { width, height };
    }
    // JPEG 格式解析
    if (uint8[0] === 0xff && uint8[1] === 0xd8) {
        let i = 2;
        while (i < uint8.length) {
            if (uint8[i] === 0xff && (uint8[i + 1] >= 0xc0 && uint8[i + 1] <= 0xc3)) {
                let height = (uint8[i + 5] << 8) | uint8[i + 6];
                let width = (uint8[i + 7] << 8) | uint8[i + 8];
                return { width, height };
            }
            i += 2 + ((uint8[i + 2] << 8) | uint8[i + 3]);
        }
    }
    return null;
}

const body = $response.body;
if (body) {
    const dim = getDimensions(body);
    if (dim) {
        // 判定逻辑：宽度大于 300 且 高度大于宽度的 1.5 倍，通常就是开屏或弹窗
        if (dim.width > 300 && dim.height > dim.width * 1.5) {
            console.log(`cmkachun: 拦截大图广告 (尺寸: ${dim.width}x${dim.height})`);
            $done({ status: "HTTP/1.1 404 Not Found" });
        } else {
            $done({}); // UI 图标放行
        }
    } else {
        $done({}); // 解析失败默认放行
    }
} else {
    $done({});
}
