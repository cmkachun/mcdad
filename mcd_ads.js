/**
 * 麦当劳开屏全方位清理 - cmkachun
 */

let url = $request.url;
let body = $response.body;

// 1. 如果是配置接口，剔除所有广告模块
if (url.includes("bff/portal/version/mdl")) {
    try {
        let obj = JSON.parse(body);
        if (obj.data && obj.data.modules) {
            obj.data.modules = obj.data.modules.filter(item => {
                const name = (item.moduleName || "").toLowerCase();
                return !["splash", "ad", "video", "guide"].some(k => name.includes(k));
            });
        }
        if (obj.hasOwnProperty('audit')) obj.audit = true;
        body = JSON.stringify(obj);
        console.log("cmkachun: 已清理配置接口广告");
    } catch (e) {
        console.log("cmkachun: 配置解析跳过");
    }
}

// 2. 如果是 img.mcd.cn 的请求（针对可能的 JSON 配置）
if (url.includes("img.mcd.cn") && body) {
    // 抹除 body 中所有指向 .mp4 的链接
    body = body.replace(/https?:\/\/img\.mcd\.cn\/[^\s"]+\.mp4/g, "");
}

$done({ body });
